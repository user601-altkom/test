---

description: "Lista zadań implementacji CR-A"
---

# Zadania: Wybór trybu rozliczenia nadpłaty

**Input**: Dokumenty projektowe z `specs/001-cr-a-tryb-nadplaty/`

**Zakres**: mała zmiana w istniejącej domenie i kontrakcie API; bez nowych zależności.

## Phase 1: Setup

- [X] T001 Zweryfikować stan istniejących testów i kontraktu nadpłat w `tests/smoke.test.ts` oraz `app/api/harmonogram/route.ts`.

## Phase 2: Fundament

- [X] T002 [P] Potwierdzić w `src/domena/harmonogram.ts`, że typy `TrybNadplaty` i obliczenia obu jawnych trybów pozostają bez zmiany.
- [X] T003 [P] Przygotować przypadek kontrolny CR-A w `tests/smoke.test.ts`: 30000000 groszy, 240 rat, stopa 6,66%, nadpłata 3000000 groszy po racie 1.

## Phase 3: User Story 1 - Porównanie skutków nadpłaty (Priority: P1) 🎯 MVP

**Cel**: Doradca może uzyskać oba warianty rozliczenia nadpłaty z liczbami kontrolnymi CR-A.

**Test niezależny**: `npm test` potwierdza ratę początkową 226507 groszy, saldo 26939993 grosze, ratę 203811 groszy dla `obniz_rate`, 196 rat i ostatnią ratę 220053 grosze dla `skroc_okres`, a także sumę kapitału równą 30000000 groszy.

### Testy User Story 1

- [X] T004 [US1] Napisać czerwony test obu wariantów CR-A oraz sumy kapitału w `tests/smoke.test.ts` i uruchomić `npm test`.

### Implementacja User Story 1

- [X] T005 [US1] Zmienić parser `parsujNadplate` w `app/api/harmonogram/route.ts`, aby brak trzeciego elementu `tryb` normalizował do `skroc_okres`, a nieznana jawna wartość nadal zwracała błąd 400.
- [X] T006 [US1] Dodać test kompatybilności braku trybu w `tests/smoke.test.ts`, porównujący wynik z jawnym `skroc_okres`.

## Phase 4: User Story 2 - Spójność kapitału (Priority: P1)

**Cel**: Każdy wariant nadpłaty zamyka kapitał dokładnie w groszach.

**Test niezależny**: testy domeny potwierdzają, że suma `kapitalGr + nadplataGr` jest równa kwocie kredytu w obu trybach.

- [X] T007 [US2] Rozszerzyć asercje w `tests/smoke.test.ts` o sumę kapitału osobno dla `obniz_rate` i `skroc_okres`.
- [X] T008 [US2] Jeśli test CR-A ujawni błąd zaokrąglenia, poprawić wyłącznie obliczenie końcowej raty w `src/domena/harmonogram.ts` i zachować istniejące limity oraz typy.

## Phase 5: User Story 3 - Zachowanie istniejącego wywołania (Priority: P2)

**Cel**: Starsze wywołania bez trybu zachowują dotychczasowe zachowanie skrócenia okresu.

**Test niezależny**: żądanie z `nadplata=1:30000` daje ten sam harmonogram co `nadplata=1:30000:skroc_okres`.

- [X] T009 [US3] Dodać test kontraktu route handlera dla opcjonalnego trybu w `tests/smoke.test.ts` lub wydzielonym teście domeny kontraktu, bez zmiany formatu odpowiedzi 200/400.
- [X] T010 [US3] Sprawdzić obsługę nieznanego trybu i zachować odpowiedź 400 w `app/api/harmonogram/route.ts`.

## Phase 6: Polish i walidacja przekrojowa

- [X] T011 [P] Opisać w `README.md` konwencję: nadpłata po racie miesiąca, odsetki tej raty od salda sprzed nadpłaty, kolejne odsetki od salda po nadpłacie.
- [X] T012 Uruchomić `npm test`, `npm run typecheck`, `npm run lint` i `npm run build` zgodnie z `specs/001-cr-a-tryb-nadplaty/quickstart.md`.
- [X] T013 Zweryfikować kontrakt API dla trybu jawnego, domyślnego i nieznanego oraz odnotować wynik w raporcie implementacji.

## Zależności i kolejność

- T001 -> T002/T003 -> T004 -> T005/T006 -> T007/T008 -> T009/T010 -> T011 -> T012 -> T013.
- T002 i T003 mogą działać równolegle, bo dotyczą różnych plików.
- T011 może działać równolegle z T009/T010 po ustabilizowaniu kontraktu.
- Wszystkie zadania zmieniające `tests/smoke.test.ts` wykonujemy sekwencyjnie.

## Strategia

Najpierw test CR-A i test domyślności, potem najmniejsza poprawka parsera. Po zielonych testach wykonujemy dokumentację i pełną walidację projektu. Zakres MVP obejmuje User Story 1; User Story 2 i 3 są wymagane do zamknięcia kryteriów akceptacji i kompatybilności.
