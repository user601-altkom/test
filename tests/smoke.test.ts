import { describe, expect, it } from 'vitest';
import { seriaWskaznika } from '../src/dane/wskazniki';
import { policzHarmonogram, type ParametryKredytu } from '../src/domena/harmonogram';

describe('dane wskaźników z katalogu dane/', () => {
  it.each(['POLSTR_1M', 'WIBOR_3M'] as const)('%s ma serię uporządkowaną rosnąco po dacie', (wskaznik) => {
    const seria = seriaWskaznika(wskaznik);
    expect(seria.length).toBeGreaterThan(0);
    for (const wpis of seria) {
      expect(wpis.od).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(wpis.stopa).toBeGreaterThan(0);
      expect(wpis.stopa).toBeLessThan(0.2);
    }
    const daty = seria.map((wpis) => wpis.od);
    expect([...daty].sort()).toEqual(daty);
  });
});

const stalaSeria = [{ od: '2026-01-01', stopa: 0.0355 }];

function parametryBazowe(nadplaty: ParametryKredytu['nadplaty'] = []): ParametryKredytu {
  return {
    kwotaGr: 400_000_00,
    liczbaRat: 300,
    marza: 0.0211,
    typRat: 'rowne',
    wskaznik: 'POLSTR_1M',
    pierwszaRata: '2026-10-01',
    seriaWskaznika: stalaSeria,
    nadplaty,
  };
}

describe('domena harmonogramu', () => {
  it('wylicza ratę kontrolną dla rat równych przy stałej stopie', () => {
    const wynik = policzHarmonogram(parametryBazowe());

    expect(wynik.raty[0]?.rataGr).toBe(249_472);
    expect(wynik.raty.at(-1)?.rataGr).toBe(249_253);
  });

  it('wylicza raty malejące i zamyka saldo kredytu', () => {
    const wynik = policzHarmonogram({ ...parametryBazowe(), typRat: 'malejace', liczbaRat: 3 });

    expect(wynik.raty.map((rata) => rata.kapitalGr)).toEqual([13_333_333, 13_333_333, 13_333_334]);
    expect(wynik.raty[0]?.rataGr).toBeGreaterThan(wynik.raty[1]?.rataGr ?? 0);
    expect(wynik.raty.at(-1)?.saldoPoSplacieGr).toBe(0);
  });

  it('zmienia oprocentowanie od raty obowiązywania wpisu serii', () => {
    const wynik = policzHarmonogram({
      ...parametryBazowe(),
      liczbaRat: 3,
      seriaWskaznika: [
        { od: '2026-01-01', stopa: 0.0355 },
        { od: '2026-11-01', stopa: 0.025 },
      ],
    });

    expect(wynik.raty[0]?.oprocentowanie).toBeCloseTo(0.0566);
    expect(wynik.raty[1]?.oprocentowanie).toBeCloseTo(0.0461);
  });

  it('stosuje nadpłatę obniżającą ratę i zachowuje liczbę rat', () => {
    const wynik = policzHarmonogram({
      ...parametryBazowe(),
      liczbaRat: 4,
      nadplaty: [{ numerRaty: 2, kwotaGr: 100_00, tryb: 'obniz_rate' }],
    });

    expect(wynik.raty).toHaveLength(4);
    expect(wynik.raty[1]?.nadplataGr).toBe(100_00);
    expect(wynik.raty[2]?.rataGr).toBeLessThan(wynik.raty[1]?.rataGr ?? 0);
    expect(wynik.raty.at(-1)?.saldoPoSplacieGr).toBe(0);
  });

  it('stosuje nadpłatę skracającą okres', () => {
    const wynik = policzHarmonogram({
      ...parametryBazowe(),
      liczbaRat: 4,
      nadplaty: [{ numerRaty: 2, kwotaGr: 200_000_00, tryb: 'skroc_okres' }],
    });

    expect(wynik.raty.length).toBeLessThan(4);
    expect(wynik.raty.at(-1)?.saldoPoSplacieGr).toBe(0);
  });

  it('suma kapitału i nadpłat równa się kwocie kredytu', () => {
    const wynik = policzHarmonogram({
      ...parametryBazowe(),
      liczbaRat: 12,
      nadplaty: [{ numerRaty: 3, kwotaGr: 1_000_00, tryb: 'skroc_okres' }],
    });

    const sumaKapitalu = wynik.raty.reduce((suma, rata) => suma + rata.kapitalGr + rata.nadplataGr, 0);
    expect(sumaKapitalu).toBe(400_000_00);
  });

  it('ogranicza nadpłatę do pozostałego salda i oznacza ograniczenie', () => {
    const wynik = policzHarmonogram({
      ...parametryBazowe(),
      liczbaRat: 2,
      nadplaty: [{ numerRaty: 1, kwotaGr: 999_999_99, tryb: 'obniz_rate' }],
    });

    expect(wynik.raty[0]?.nadplataGr).toBeLessThan(999_999_99);
    expect(wynik.raty[0]?.nadplataOgraniczona).toBe(true);
  });

  it('odrzuca nieistniejącą datę i parametry poza limitami MVP', () => {
    expect(() => policzHarmonogram({ ...parametryBazowe(), pierwszaRata: '2026-02-30' })).toThrow('data: nieistniejąca data');
    expect(() => policzHarmonogram({ ...parametryBazowe(), liczbaRat: 421 })).toThrow('liczbaRat: maksymalnie 420');
    expect(() => policzHarmonogram({ ...parametryBazowe(), kwotaGr: 5_000_000_001 })).toThrow('kwotaGr: maksymalnie 50000000 zł');
  });

  it('testy działają w strefie Europe/Warsaw', () => {
    expect(process.env.TZ).toBe('Europe/Warsaw');
  });
});
