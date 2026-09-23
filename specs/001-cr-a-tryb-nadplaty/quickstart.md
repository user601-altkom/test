# Quickstart walidacji CR-A

## Wymagania

- Node.js zgodny z `package.json` (>=22)
- zależności zainstalowane przez `npm install`

## Testy automatyczne

Uruchom z katalogu repozytorium:

```powershell
npm test
npm run typecheck
npm run lint
npm run build
```

Oczekiwany rezultat: wszystkie testy przechodzą, TypeScript, lint i build kończą się kodem 0.

## Scenariusz domenowy

Test powinien wywołać `policzHarmonogram` dla 300 000 zł, 240 rat równych,
marży 2,11%, wskaźnika 4,55% i nadpłaty 30 000 zł po racie 1.

Sprawdź:

- rata początkowa `226507` groszy,
- saldo po racie i nadpłacie `26939993` groszy,
- dla `obniz_rate`: 240 rat i kolejna rata `203811` groszy,
- dla `skroc_okres`: 196 rat i ostatnia rata `220053` groszy,
- w obu wariantach suma kapitałów rat oraz nadpłat równa `30000000` groszy.

## Scenariusz kompatybilności API

Wyślij żądanie z nadpłatą bez trzeciego elementu, np.:

```text
/api/harmonogram?kwota=300000&liczbaRat=240&marza=2.11&wskaznik=WIBOR_3M&typRat=rowne&pierwszaRata=2026-10-01&nadplata=1:30000
```

Oczekiwany rezultat: odpowiedź 200 i zachowanie identyczne jak dla
`nadplata=1:30000:skroc_okres`.

## Scenariusz błędu

Wyślij `nadplata=1:30000:nieznany`. Oczekiwany rezultat: HTTP 400 z polem
`blad`; parser nie powinien cicho wybierać trybu dla nieznanej wartości.
