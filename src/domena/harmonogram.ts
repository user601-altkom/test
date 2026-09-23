/** Czyste obliczenia harmonogramu spłat, bez Reacta i bez I/O. */

export type TypRat = 'rowne' | 'malejace';
export type Wskaznik = 'POLSTR_1M' | 'WIBOR_3M';
export type TrybNadplaty = 'obniz_rate' | 'skroc_okres';

export const MAKSYMALNA_LICZBA_RAT = 420;
export const MAKSYMALNA_KWOTA_GR = 5_000_000_000;

export interface WpisSerii {
  od: string;
  stopa: number;
}

export interface Nadplata {
  numerRaty: number;
  kwotaGr: number;
  tryb: TrybNadplaty;
}

export interface ParametryKredytu {
  kwotaGr: number;
  liczbaRat: number;
  marza: number;
  typRat: TypRat;
  wskaznik: Wskaznik;
  pierwszaRata: string;
  seriaWskaznika: WpisSerii[];
  nadplaty: Nadplata[];
}

export interface Rata {
  numer: number;
  data: string;
  oprocentowanie: number;
  kapitalGr: number;
  odsetkiGr: number;
  rataGr: number;
  nadplataGr: number;
  nadplataOgraniczona: boolean;
  saldoPoSplacieGr: number;
}

export interface WynikHarmonogramu {
  raty: Rata[];
  sumaOdsetekGr: number;
}

function zaokraglijGrosze(wartosc: number): number {
  return Math.round(wartosc);
}

function dataJakoObiekt(data: string): Date {
  const obiekt = new Date(`${data}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || Number.isNaN(obiekt.getTime())) {
    throw new Error('data: oczekiwany format YYYY-MM-DD');
  }
  if (obiekt.toISOString().slice(0, 10) !== data) {
    throw new Error('data: nieistniejąca data');
  }
  return obiekt;
}

function dodajMiesiace(data: Date, liczbaMiesiecy: number): Date {
  const wynik = new Date(data);
  const dzien = wynik.getUTCDate();
  wynik.setUTCDate(1);
  wynik.setUTCMonth(wynik.getUTCMonth() + liczbaMiesiecy);
  const ostatniDzienMiesiaca = new Date(Date.UTC(wynik.getUTCFullYear(), wynik.getUTCMonth() + 1, 0)).getUTCDate();
  wynik.setUTCDate(Math.min(dzien, ostatniDzienMiesiaca));
  return wynik;
}

function dataDoTekstu(data: Date): string {
  return data.toISOString().slice(0, 10);
}

function znajdzWskaznik(data: string, seria: WpisSerii[]): number {
  const pierwszyWpis = seria[0];
  if (!pierwszyWpis || data < pierwszyWpis.od) throw new Error('brak wskaźnika dla daty');
  let znaleziony = pierwszyWpis;
  for (const wpis of seria) {
    if (wpis.od <= data) znaleziony = wpis;
  }
  if (!znaleziony) throw new Error('seria wskaźnika nie może być pusta');
  return znaleziony.stopa;
}

function sprawdzParametry(parametry: ParametryKredytu): void {
  if (!Number.isInteger(parametry.kwotaGr) || parametry.kwotaGr <= 0) throw new Error('kwotaGr musi być dodatnią liczbą całkowitą');
  if (parametry.kwotaGr > MAKSYMALNA_KWOTA_GR) throw new Error('kwotaGr: maksymalnie 50000000 zł');
  if (!Number.isInteger(parametry.liczbaRat) || parametry.liczbaRat <= 0) throw new Error('liczbaRat musi być dodatnią liczbą całkowitą');
  if (parametry.liczbaRat > MAKSYMALNA_LICZBA_RAT) throw new Error('liczbaRat: maksymalnie 420 rat');
  if (!Number.isFinite(parametry.marza) || parametry.marza < 0) throw new Error('marża musi być nieujemną liczbą');
  dataJakoObiekt(parametry.pierwszaRata);
  if (parametry.seriaWskaznika.length === 0) throw new Error('seria wskaźnika nie może być pusta');
  for (const wpis of parametry.seriaWskaznika) dataJakoObiekt(wpis.od);
  const numeryNadplat = new Set<number>();
  for (const nadplata of parametry.nadplaty) {
    if (!Number.isInteger(nadplata.numerRaty) || nadplata.numerRaty < 1 || nadplata.numerRaty > parametry.liczbaRat) throw new Error('numer nadpłaty jest poza harmonogramem');
    if (!Number.isInteger(nadplata.kwotaGr) || nadplata.kwotaGr <= 0) throw new Error('kwota nadpłaty musi być dodatnia');
    if (numeryNadplat.has(nadplata.numerRaty)) throw new Error('rata nie może mieć dwóch nadpłat');
    numeryNadplat.add(nadplata.numerRaty);
  }
}

function rataRowna(saldoGr: number, stopaMiesieczna: number, liczbaPozostalychRat: number): number {
  if (liczbaPozostalychRat <= 1) return saldoGr;
  if (stopaMiesieczna === 0) return zaokraglijGrosze(saldoGr / liczbaPozostalychRat);
  return zaokraglijGrosze(saldoGr * stopaMiesieczna / (1 - Math.pow(1 + stopaMiesieczna, -liczbaPozostalychRat)));
}

export function policzHarmonogram(parametry: ParametryKredytu): WynikHarmonogramu {
  sprawdzParametry(parametry);

  const dataPierwszejRaty = dataJakoObiekt(parametry.pierwszaRata);
  const nadplaty = new Map(parametry.nadplaty.map((nadplata) => [nadplata.numerRaty, nadplata]));
  const raty: Rata[] = [];
  let saldoGr = parametry.kwotaGr;
  let pozostaleRaty = parametry.liczbaRat;
  const stalaCzescKapitalowaGr = zaokraglijGrosze(parametry.kwotaGr / parametry.liczbaRat);
  let rataRownaGr: number | null = null;
  let poprzednieOprocentowanie: number | null = null;
  let sumaOdsetekGr = 0;

  for (let numer = 1; numer <= parametry.liczbaRat && saldoGr > 0; numer += 1) {
    const data = dataDoTekstu(dodajMiesiace(dataPierwszejRaty, numer - 1));
    const oprocentowanie = znajdzWskaznik(data, parametry.seriaWskaznika) + parametry.marza;
    const stopaMiesieczna = oprocentowanie / 12;
    const zmianaOprocentowania = poprzednieOprocentowanie !== oprocentowanie;
    const odsetkiGr = zaokraglijGrosze(saldoGr * stopaMiesieczna);

    if (parametry.typRat === 'rowne' && (rataRownaGr === null || zmianaOprocentowania)) {
      rataRownaGr = rataRowna(saldoGr, stopaMiesieczna, pozostaleRaty);
    }

    const planowanaRataGr = parametry.typRat === 'rowne'
      ? rataRownaGr ?? saldoGr
      : stalaCzescKapitalowaGr + odsetkiGr;
    const kapitalGr = pozostaleRaty === 1
      ? saldoGr
      : parametry.typRat === 'malejace'
        ? Math.min(saldoGr, stalaCzescKapitalowaGr)
        : Math.min(saldoGr, Math.max(0, planowanaRataGr - odsetkiGr));
    const rataGr = kapitalGr + odsetkiGr;
    saldoGr -= kapitalGr;
    pozostaleRaty -= 1;

    const nadplata = nadplaty.get(numer);
    const nadplataGr = nadplata ? Math.min(saldoGr, nadplata.kwotaGr) : 0;
    const nadplataOgraniczona = nadplataGr < (nadplata?.kwotaGr ?? 0);
    saldoGr -= nadplataGr;
    if (nadplataGr > 0 && nadplata?.tryb === 'obniz_rate') rataRownaGr = null;

    sumaOdsetekGr += odsetkiGr;
    raty.push({
      numer,
      data,
      oprocentowanie,
      kapitalGr,
      odsetkiGr,
      rataGr,
      nadplataGr,
      nadplataOgraniczona,
      saldoPoSplacieGr: saldoGr,
    });
    poprzednieOprocentowanie = oprocentowanie;
  }

  return { raty, sumaOdsetekGr };
}
