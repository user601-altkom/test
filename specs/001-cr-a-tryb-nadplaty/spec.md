# Specyfikacja funkcji: Wybór trybu rozliczenia nadpłaty

**Feature Branch**: `cr-a-tryb-nadplaty`

**Created**: 2026-09-23

**Status**: Draft

**Input**: Wymaganie CR-A z `dodatkowe_wymagania.md`

## Scenariusze użytkownika i testowanie

### User Story 1 - Porównanie skutków nadpłaty (Priority: P1)

Doradca chce wybrać dla każdej nadpłaty skrócenie okresu albo obniżenie raty,
aby pokazać klientowi oba warianty rozliczenia.

**Why this priority**: Jest to główna zmiana biznesowa i wpływa bezpośrednio na
wynik harmonogramu.

**Independent Test**: Test domeny wywołuje obliczenia z jedną nadpłatą w każdym
trybie i porównuje ratę, liczbę rat, ostatnią ratę oraz sumę kapitału.

**Acceptance Scenarios**:

1. **Given** kredyt 300 000 zł, 240 rat równych i stopę 6,66%, **When** po
  zaksięgowaniu pierwszej raty zostanie nadpłacone 30 000 zł w trybie
  „obniż ratę”, **Then** saldo wynosi 269 399,93 zł, a kolejne raty są
  przeliczone przy zachowaniu pierwotnego okresu.
2. **Given** te same dane, **When** nadpłata zostanie wykonana w trybie
  „skróć okres”, **Then** rata pozostaje równa 2 265,07 zł, harmonogram ma
  196 rat łącznie, a ostatnia rata wyrównująca wynosi 2 200,53 zł.
3. **Given** nadpłata bez podanego trybu, **When** harmonogram zostanie
  obliczony, **Then** zostanie użyty tryb „skróć okres”.

---

### User Story 2 - Spójność kapitału (Priority: P1)

Doradca chce mieć pewność, że zaokrąglenia i nadpłaty nie zmieniają łącznej
kwoty spłaconego kapitału.

**Why this priority**: Błąd w kapitale oznacza niepoprawny harmonogram i wynik
finansowy dla klienta.

**Independent Test**: Dla obu trybów suma części kapitałowych rat i nadpłat jest
porównana z kwotą kredytu.

**Acceptance Scenarios**:

1. **Given** dowolny poprawny kredyt z nadpłatą, **When** harmonogram zostanie
  zakończony, **Then** suma kapitału z rat i nadpłat równa się kwocie kredytu
  w groszach.

---

### User Story 3 - Zachowanie istniejącego wywołania (Priority: P2)

Istniejący klient API, który nie przekazuje trybu nadpłaty, chce otrzymać wynik
zgodny z dotychczasowym zachowaniem, czyli ze skróceniem okresu.

**Why this priority**: Domyślność chroni kompatybilność istniejących wywołań.

**Independent Test**: Wywołanie bez pola trybu daje taki sam wynik jak jawne
`skroc_okres`.

**Acceptance Scenarios**:

1. **Given** istniejące parametry nadpłaty bez trybu, **When** API obliczy
  harmonogram, **Then** przyjmie tryb „skróć okres”.

---

### Edge Cases

- Nadpłata nie może zwiększyć salda ani przejść poza pozostały kapitał; kwota
  zastosowana w harmonogramie jest ograniczana do salda.
- Nadpłata po ostatniej racie kończy harmonogram bez rat o zerowym kapitale.
- Tryb musi należeć do zbioru `skroc_okres`, `obniz_rate`; nieznana wartość
  jest błędem walidacji.
- W trybie „skróć okres” ostatnia rata może być niższa od raty regularnej i
  wyrównuje pozostały kapitał po zaokrągleniach.
- Nadpłata jest księgowana po racie wskazanego miesiąca, a odsetki tej raty
  liczone są od salda sprzed nadpłaty.

## Wymagania

### Wymagania funkcjonalne

- **FR-001**: System musi przyjmować tryb rozliczenia przy każdej nadpłacie.
- **FR-002**: Brak trybu musi oznaczać `skroc_okres`.
- **FR-003**: Tryb `obniz_rate` musi zachować liczbę rat pierwotnego
  harmonogramu i przeliczyć ratę od salda po nadpłacie na pozostały okres.
- **FR-004**: Tryb `skroc_okres` musi zachować ratę regularną i zakończyć
  harmonogram wcześniej, z ostatnią ratą wyrównującą.
- **FR-005**: Suma kapitału spłaconego w ratach i nadpłatach musi być równa
  kwocie kredytu.
- **FR-006**: Wybrany tryb musi być widoczny w danych wejściowych i wpływać na
  przedstawiony klientowi wynik bez zmiany innych parametrów kredytu.
- **FR-007**: Wyniki kwotowe muszą być dokładne do jednego grosza, a końcowa
  suma kapitału nie może różnić się od kwoty kredytu.

### Kluczowe encje

- **Nadpłata**: kwota, numer raty księgowania i tryb `skroc_okres` albo
  `obniz_rate`.
- **Harmonogram**: uporządkowana lista rat z kapitałem, odsetkami, ratą,
  saldem i zastosowanymi nadpłatami.
- **Rata**: numer, data, część kapitałowa, część odsetkowa, suma raty i saldo
  po spłacie.

## Kryteria sukcesu

### Mierzalne wyniki

- **SC-001**: W przypadku kontrolnym rata przed nadpłatą wynosi 2 265,07 zł,
  a saldo po pierwszej racie i nadpłacie wynosi 269 399,93 zł.
- **SC-002**: W obu wariantach suma kapitału spłaconego ratami i nadpłatami
  równa się kwocie kredytu z dokładnością do 0 groszy.
- **SC-003**: Tryb „obniż ratę” zachowuje 240 rat łącznie, a tryb „skróć
  okres” kończy przypadek kontrolny po 196 ratach łącznie.
- **SC-004**: Wywołanie bez trybu pozostaje kompatybilne z jawnym trybem
  `skroc_okres`.

## Założenia

- Oprocentowanie i sposób naliczania odsetek pozostają zgodne z istniejącą
  domeną kalkulatora.
- Nadpłata jest stosowana po zaksięgowaniu raty wskazanej w danych wejściowych.
- Wersja CR-A nie zmienia danych wskaźników ani sposobu ich wyboru.
- Zakres obejmuje domenę, API, ekran i testy; operacje PR, merge, tagowanie
  oraz wdrożenie są czynnościami procesu wydania, nie funkcją produktu.
