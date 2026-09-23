import { NextResponse } from 'next/server';
import { seriaWskaznika } from '../../../src/dane/wskazniki';
import {
  MAKSYMALNA_KWOTA_GR,
  MAKSYMALNA_LICZBA_RAT,
  policzHarmonogram,
  type Nadplata,
  type ParametryKredytu,
} from '../../../src/domena/harmonogram';

// Route handler jest cienki: parsuje parametry z query string, woła domenę, zwraca JSON.
// Żadnych obliczeń finansowych w tym pliku. Przeliczenie jednostek wejścia
// (złote na grosze, punkty procentowe na ułamek) to część parsowania kontraktu API.

const PRZYKLAD =
  '/api/harmonogram?kwota=400000&liczbaRat=300&marza=2.11&wskaznik=POLSTR_1M&typRat=rowne&pierwszaRata=2026-10-01';

function parsujLiczbe(wartosc: string | null): number {
  return Number((wartosc ?? '').replace(/\s/g, '').replace(',', '.'));
}

function parsujNadplate(szukane: URLSearchParams): Nadplata[] | string {
  const nadplaty: Nadplata[] = [];
  for (const wartosc of szukane.getAll('nadplata')) {
    const [numerRatyTekst, kwotaTekst, tryb] = wartosc.split(':');
    const numerRaty = Number(numerRatyTekst);
    const kwota = parsujLiczbe(kwotaTekst ?? null);
    if (!Number.isInteger(numerRaty) || numerRaty < 1) return 'nadplata: numer raty musi być dodatnią liczbą całkowitą';
    if (!Number.isFinite(kwota) || kwota <= 0) return 'nadplata: kwota musi być dodatnią liczbą';
    const wybranyTryb = tryb ?? 'skroc_okres';
    if (wybranyTryb !== 'obniz_rate' && wybranyTryb !== 'skroc_okres') return 'nadplata: tryb obniz_rate albo skroc_okres';
    nadplaty.push({ numerRaty, kwotaGr: Math.round(kwota * 100), tryb: wybranyTryb });
  }
  return nadplaty;
}

function parsujParametry(szukane: URLSearchParams): ParametryKredytu | string {
  const kwota = parsujLiczbe(szukane.get('kwota'));
  const liczbaRat = Number(szukane.get('liczbaRat'));
  const marzaTekst = szukane.get('marza');
  const marza = parsujLiczbe(marzaTekst);
  const wskaznik = szukane.get('wskaznik');
  const typRat = szukane.get('typRat');
  const pierwszaRata = szukane.get('pierwszaRata') ?? '';

  if (!Number.isFinite(kwota) || kwota <= 0) return 'kwota: liczba dodatnia w złotych, np. 400000';
  if (kwota * 100 > MAKSYMALNA_KWOTA_GR) return 'kwota: maksymalnie 50000000 zł';
  if (!Number.isInteger(liczbaRat) || liczbaRat <= 0) return 'liczbaRat: liczba całkowita dodatnia, np. 300';
  if (liczbaRat > MAKSYMALNA_LICZBA_RAT) return 'liczbaRat: maksymalnie 420 rat';
  if (marzaTekst === null || marzaTekst.trim() === '') return 'marza: punkty procentowe, np. 2.11';
  if (!Number.isFinite(marza) || marza < 0) return 'marza: punkty procentowe, np. 2.11';
  if (wskaznik !== 'POLSTR_1M' && wskaznik !== 'WIBOR_3M') return 'wskaznik: POLSTR_1M albo WIBOR_3M';
  if (typRat !== 'rowne' && typRat !== 'malejace') return 'typRat: rowne albo malejace';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(pierwszaRata)) return 'pierwszaRata: data YYYY-MM-DD';
  const nadplaty = parsujNadplate(szukane);
  if (typeof nadplaty === 'string') return nadplaty;

  return {
    kwotaGr: Math.round(kwota * 100),
    liczbaRat,
    marza: marza / 100,
    wskaznik,
    typRat,
    pierwszaRata,
    seriaWskaznika: seriaWskaznika(wskaznik),
    nadplaty,
  };
}

export function GET(request: Request) {
  const parametry = parsujParametry(new URL(request.url).searchParams);
  if (typeof parametry === 'string') {
    return NextResponse.json({ blad: parametry, przyklad: PRZYKLAD }, { status: 400 });
  }

  try {
    const harmonogram = policzHarmonogram(parametry);
    return NextResponse.json({
      raty: harmonogram.raty.map((rata) => ({
        numer: rata.numer,
        data: rata.data,
        kapital: rata.kapitalGr,
        odsetki: rata.odsetkiGr,
        rata: rata.rataGr,
        nadplata: rata.nadplataGr,
        nadplataOgraniczona: rata.nadplataOgraniczona,
        saldoPoSplacie: rata.saldoPoSplacieGr,
      })),
      sumaOdsetek: harmonogram.sumaOdsetekGr,
    });
  } catch (blad) {
    const komunikat = blad instanceof Error ? blad.message : String(blad);
    return NextResponse.json({ blad: komunikat }, { status: 400 });
  }
}
