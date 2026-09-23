# Research: CR-A

## Decyzja: wykorzystać istniejący model nadpłaty

- `src/domena/harmonogram.ts` już definiuje `TrybNadplaty`, `Nadplata` i obliczenia obu trybów.
- `obniz_rate` resetuje ratę równą po nadpłacie, a `skroc_okres` pozostawia ratę i kończy pętlę po wyzerowaniu salda.
- Zmiana implementacyjna powinna pozostać mała: dodać domyślność brakującego trybu w parserze API i rozszerzyć testy o przypadek CR-A.

**Uzasadnienie:** zachowuje istniejący kontrakt domeny, nie przenosi logiki finansowej do route handlera ani UI i minimalizuje ryzyko regresji.

**Alternatywy rozważane:** przebudowa algorytmu harmonogramu od podstaw odrzucona, ponieważ obecny kod spełnia jawne scenariusze obu trybów i istniejące testy.

## Decyzja: brak trybu oznacza `skroc_okres`

Parser `nadplata` przyjmuje format `numerRaty:kwota[:tryb]`. Pusty lub pominięty trzeci element mapuje na `skroc_okres`; jawne wartości pozostają ograniczone do `obniz_rate` i `skroc_okres`, a inne są błędem 400.

**Uzasadnienie:** spełnia kompatybilność wsteczną wymaganą przez CR-A i zachowuje dotychczasowe zachowanie biznesowe.

**Alternatywy rozważane:** odrzucanie braku trybu odrzucone jako niezgodne z kryterium 1.

## Decyzja: nadpłata po racie wskazanego numeru

Najpierw naliczane są odsetki od salda sprzed raty i księgowana jest część kapitałowa raty. Następnie nadpłata pomniejsza saldo; odsetki kolejnej raty liczone są od nowego salda.

**Uzasadnienie:** dokładnie odpowiada konwencji z wymagania i liczbom kontrolnym: po pierwszej racie saldo wynosi 299 399,93 zł, po nadpłacie 269 399,93 zł.

**Alternatywy rozważane:** nadpłata przed ratą lub przed naliczeniem odsetek odrzucone, bo zmieniają saldo i ratę kontrolną.

## Decyzja: kwoty w groszach i końcowe wyrównanie

Kwoty wejściowe i wynikowe pozostają liczbami całkowitymi w groszach. Odsetki i raty są zaokrąglane przez istniejącą funkcję, a ostatnia część kapitałowa jest ograniczana do pozostałego salda.

**Uzasadnienie:** daje dokładną sumę kapitału rat i nadpłat równą kwocie kredytu, zgodnie z FR-005.

**Alternatywy rozważane:** zaokrąglanie dopiero na poziomie UI odrzucone, bo narusza stabilność kontraktu API i dokładność domeny.

## Decyzja: test domeny jako główny test akceptacyjny

Test w `tests/smoke.test.ts` obejmie przypadek 300 000 zł / 240 rat / 6,66% / 30 000 zł po racie 1 dla obu trybów oraz test domyślności przez parser API lub wspólną funkcję parsowania.

**Uzasadnienie:** test domeny jest szybki, deterministyczny i zgodny z konwencją repozytorium, a test route zabezpiecza zmianę kontraktu wejściowego.

**Alternatywy rozważane:** test wyłącznie ręczny przez UI odrzucony jako niewystarczający dla zaokrągleń i kompatybilności.
