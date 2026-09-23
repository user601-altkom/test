'use client';

import { FormEvent, useState } from 'react';

type TrybNadplaty = 'obniz_rate' | 'skroc_okres';
type StanEkranu = 'pusty' | 'ladowanie' | 'wynik' | 'blad';

interface NadplataFormularza {
  id: number;
  numerRaty: string;
  kwota: string;
  tryb: TrybNadplaty;
}

interface Rata {
  numer: number;
  data: string;
  kapital: number;
  odsetki: number;
  rata: number;
  nadplata: number;
  nadplataOgraniczona: boolean;
  saldoPoSplacie: number;
}

interface WynikHarmonogramu {
  raty: Rata[];
  sumaOdsetek: number;
}

function formatujZl(grosze: number): string {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(grosze / 100);
}

function formatujNadplate(nadplata: NadplataFormularza): string {
  return `${nadplata.numerRaty}:${nadplata.kwota}:${nadplata.tryb}`;
}

function pobierzBlad(odpowiedz: unknown): string {
  if (typeof odpowiedz === 'object' && odpowiedz !== null && 'blad' in odpowiedz) {
    const blad = odpowiedz.blad;
    if (typeof blad === 'string') return blad;
  }
  return 'Nie udało się pobrać harmonogramu.';
}

export default function Strona() {
  const [kwota, setKwota] = useState('400000');
  const [liczbaRat, setLiczbaRat] = useState('300');
  const [pierwszaRata, setPierwszaRata] = useState('2026-10-01');
  const [marza, setMarza] = useState('2.11');
  const [wskaznik, setWskaznik] = useState<'POLSTR_1M' | 'WIBOR_3M'>('POLSTR_1M');
  const [typRat, setTypRat] = useState<'rowne' | 'malejace'>('rowne');
  const [nadplaty, setNadplaty] = useState<NadplataFormularza[]>([]);
  const [wynik, setWynik] = useState<WynikHarmonogramu | null>(null);
  const [blad, setBlad] = useState('');
  const [stan, setStan] = useState<StanEkranu>('pusty');
  const [pokazWszystkie, setPokazWszystkie] = useState(false);

  async function oblicz(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (Number(kwota.replace(/\s/g, '').replace(',', '.')) > 50_000_000) {
      setBlad('Kwota kredytu nie może przekraczać 50 000 000 zł.');
      setWynik(null);
      setStan('blad');
      return;
    }
    if (!Number.isInteger(Number(liczbaRat)) || Number(liczbaRat) > 420) {
      setBlad('Liczba rat musi mieścić się w zakresie od 1 do 420.');
      setWynik(null);
      setStan('blad');
      return;
    }
    setStan('ladowanie');
    setBlad('');
    setWynik(null);

    const parametry = new URLSearchParams({ kwota, liczbaRat, marza, wskaznik, typRat, pierwszaRata });
    nadplaty.forEach((nadplata) => parametry.append('nadplata', formatujNadplate(nadplata)));

    try {
      const odpowiedz = await fetch(`/api/harmonogram?${parametry.toString()}`);
      const dane: unknown = await odpowiedz.json();
      if (!odpowiedz.ok) throw new Error(pobierzBlad(dane));
      setWynik(dane as WynikHarmonogramu);
      setStan('wynik');
    } catch (error) {
      setBlad(error instanceof Error ? error.message : 'Nie udało się pobrać harmonogramu.');
      setStan('blad');
    }
  }

  function dodajNadplate() {
    setNadplaty((poprzednie) => [
      ...poprzednie,
      { id: Date.now(), numerRaty: '1', kwota: '10000', tryb: 'obniz_rate' },
    ]);
  }

  function aktualizujNadplate(id: number, pole: keyof NadplataFormularza, wartosc: string) {
    setNadplaty((poprzednie) => poprzednie.map((nadplata) => (
      nadplata.id === id ? { ...nadplata, [pole]: wartosc } : nadplata
    )));
  }

  function eksportujCsv() {
    if (!wynik) return;
    const naglowek = 'Numer;Data;Kapitał;Odsetki;Rata;Nadpłata;Saldo po spłacie';
    const wiersze = wynik.raty.map((rata) => [
      rata.numer,
      rata.data,
      formatujZl(rata.kapital),
      formatujZl(rata.odsetki),
      formatujZl(rata.rata),
      formatujZl(rata.nadplata),
      formatujZl(rata.saldoPoSplacie),
    ].join(';'));
    const plik = new Blob([`\uFEFF${[naglowek, ...wiersze].join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
    const adres = URL.createObjectURL(plik);
    const link = document.createElement('a');
    link.href = adres;
    link.download = 'harmonogram-splat.csv';
    link.click();
    URL.revokeObjectURL(adres);
  }

  const raty = wynik?.raty ?? [];
  const widoczneRaty = pokazWszystkie ? raty : raty.slice(0, 24);

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-col gap-5 border-b border-[var(--kolor-divider)] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--kolor-akcent)]">Narzędzie dla doradcy</p>
            <h1 className="text-5xl leading-none sm:text-7xl">Harmonogram spłat</h1>
            <p className="mt-4 max-w-xl text-lg text-[var(--kolor-muted)]">Kalkulator kredytu hipotecznego na POLSTR i WIBOR.</p>
          </div>
          <p className="max-w-48 border-l-2 border-[var(--kolor-akcent-2)] pl-3 text-sm text-[var(--kolor-muted)]">Stawka okresowa na podstawie serii wskaźnika.</p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
          <form className="surface flex flex-col gap-6 p-5 sm:p-7" onSubmit={oblicz}>
            <div><p className="eyebrow">Parametry kredytu</p><h2 className="mt-2 text-3xl">Uzupełnij założenia</h2></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field sm:col-span-2">Kwota kredytu (zł)<input required inputMode="decimal" max="50000000" value={kwota} onChange={(e) => setKwota(e.target.value)} /></label>
              <label className="field">Liczba rat<input required type="number" min="1" max="420" value={liczbaRat} onChange={(e) => setLiczbaRat(e.target.value)} /></label>
              <label className="field">Data pierwszej raty<input required type="date" value={pierwszaRata} onChange={(e) => setPierwszaRata(e.target.value)} /></label>
              <label className="field sm:col-span-2">Marża banku (pp)<input required min="0" inputMode="decimal" value={marza} onChange={(e) => setMarza(e.target.value)} /></label>
            </div>
            <fieldset><legend className="field-label">Wskaźnik</legend><div className="segmented"><button type="button" className={wskaznik === 'POLSTR_1M' ? 'active' : ''} onClick={() => setWskaznik('POLSTR_1M')}>POLSTR 1M</button><button type="button" className={wskaznik === 'WIBOR_3M' ? 'active' : ''} onClick={() => setWskaznik('WIBOR_3M')}>WIBOR 3M</button></div></fieldset>
            <fieldset><legend className="field-label">Typ rat</legend><div className="segmented"><button type="button" className={typRat === 'rowne' ? 'active' : ''} onClick={() => setTypRat('rowne')}>Równe</button><button type="button" className={typRat === 'malejace' ? 'active' : ''} onClick={() => setTypRat('malejace')}>Malejące</button></div></fieldset>
            <div className="border-t border-[var(--kolor-divider)] pt-5">
              <div className="mb-4 flex items-center justify-between"><div><p className="eyebrow">Nadpłaty</p><h2 className="mt-1 text-2xl">Dodatkowe wpłaty</h2></div><button type="button" className="btn-secondary" onClick={dodajNadplate}>+ Dodaj</button></div>
              {nadplaty.length === 0 ? <p className="text-sm italic text-[var(--kolor-muted)]">Brak nadpłat. Harmonogram bazowy.</p> : <div className="flex flex-col gap-3">{nadplaty.map((nadplata) => <div className="grid items-end gap-2 border border-[var(--kolor-divider)] p-3 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,1.4fr)_2rem]" key={nadplata.id}><label className="field">Numer raty<input min="1" max={liczbaRat} type="number" value={nadplata.numerRaty} onChange={(e) => aktualizujNadplate(nadplata.id, 'numerRaty', e.target.value)} /></label><label className="field">Kwota (zł)<input inputMode="decimal" value={nadplata.kwota} onChange={(e) => aktualizujNadplate(nadplata.id, 'kwota', e.target.value)} /></label><label className="field">Tryb<select value={nadplata.tryb} onChange={(e) => aktualizujNadplate(nadplata.id, 'tryb', e.target.value)}><option value="obniz_rate">Obniż ratę</option><option value="skroc_okres">Skróć okres</option></select></label><button type="button" className="remove-button" aria-label="Usuń nadpłatę" onClick={() => setNadplaty((poprzednie) => poprzednie.filter((element) => element.id !== nadplata.id))}>×</button></div>)}</div>}
            </div>
            <button className="btn-primary" disabled={stan === 'ladowanie'} type="submit">{stan === 'ladowanie' ? 'Liczę harmonogram…' : 'Policz harmonogram'}</button>
          </form>

          <section className="flex min-h-[32rem] flex-col gap-6">
            {stan === 'pusty' && <div className="empty-state"><p className="eyebrow">Wynik obliczeń</p><h2>Uzupełnij parametry i policz harmonogram.</h2><p>Porównaj raty, odsetki i saldo kredytu w jednym widoku.</p></div>}
            {stan === 'blad' && <div className="empty-state border-[var(--kolor-akcent-2)]"><p className="eyebrow text-[var(--kolor-akcent-2)]">Błąd danych</p><h2>Nie udało się policzyć harmonogramu.</h2><p>{blad}</p></div>}
            {stan === 'ladowanie' && <div className="empty-state"><p className="eyebrow">Obliczenia</p><h2>Przygotowuję wynik…</h2><p>GET /api/harmonogram</p></div>}
            {stan === 'wynik' && wynik && <><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><div className="metric"><span>Pierwsza rata</span><strong>{formatujZl(raty[0]?.rata ?? 0)}</strong></div><div className="metric"><span>Ostatnia rata</span><strong>{formatujZl(raty[raty.length - 1]?.rata ?? 0)}</strong></div><div className="metric"><span>Suma odsetek</span><strong>{formatujZl(wynik.sumaOdsetek)}</strong></div><div className="metric"><span>Liczba rat</span><strong>{raty.length}</strong></div></div>{raty.some((rata) => rata.nadplataOgraniczona) && <p className="border-l-4 border-[var(--kolor-akcent-2)] bg-[var(--kolor-powierzchni)] p-3 text-sm text-[var(--kolor-muted)]">Nadpłata została ograniczona do pozostałego salda</p>}<div className="surface overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--kolor-divider)] p-5"><div><p className="eyebrow">Szczegóły</p><h2 className="mt-1 text-2xl">Tabela rat</h2></div><button className="btn-secondary" type="button" onClick={eksportujCsv}>Eksport CSV</button></div><div className="overflow-x-auto"><table><thead><tr><th>Nr</th><th>Data</th><th>Kapitał</th><th>Odsetki</th><th>Rata</th><th>Nadpłata</th><th>Saldo po spłacie</th></tr></thead><tbody>{widoczneRaty.map((rata) => <tr key={rata.numer}><td>{rata.numer}</td><td>{rata.data}</td><td>{formatujZl(rata.kapital)}</td><td>{formatujZl(rata.odsetki)}</td><td className="font-semibold">{formatujZl(rata.rata)}</td><td>{formatujZl(rata.nadplata)}</td><td>{formatujZl(rata.saldoPoSplacie)}</td></tr>)}</tbody></table></div>{raty.length > 24 && <button className="w-full border-t border-[var(--kolor-divider)] p-4 text-sm font-semibold text-[var(--kolor-akcent-700)] hover:bg-[var(--kolor-akcent-100)]" type="button" onClick={() => setPokazWszystkie((poprzednie) => !poprzednie)}>{pokazWszystkie ? 'Pokaż pierwsze 24 raty' : `Pokaż wszystkie ${raty.length} rat`}</button>}</div></>}
          </section>
        </section>
      </div>
    </main>
  );
}
