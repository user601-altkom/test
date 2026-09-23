# Plan implementacji: Wybór trybu rozliczenia nadpłaty

**Branch**: `001-cr-a-tryb-nadplaty` | **Date**: 2026-09-23 | **Spec**: [spec.md](spec.md)

**Input**: Specyfikacja funkcji z `specs/001-cr-a-tryb-nadplaty/spec.md`

## Podsumowanie

Rozszerzenie i uszczelnienie istniejącego kalkulatora tak, aby każda nadpłata
wybierała tryb `obniz_rate` albo `skroc_okres`, przy zachowaniu domyślnego
`skroc_okres` dla starszych wywołań bez trybu. Domenowa logika obu trybów już
istnieje; plan obejmuje test przypadku CR-A, poprawę parsowania kontraktu API,
udokumentowanie momentu księgowania nadpłaty i pełną walidację regresji.

## Kontekst techniczny

**Language/Version**: TypeScript 5.9, Node.js >=22, strict mode

**Primary Dependencies**: Next.js 16 App Router, React 19, Vitest 4, bez nowych zależności

**Storage**: N/A; serie wskaźników są importowane z plików JSON

**Testing**: Vitest; testy domeny w `tests/`

**Target Platform**: aplikacja webowa Next.js uruchamiana lokalnie i na Vercel

**Project Type**: web application z route handlerem JSON i ekranem React

**Performance Goals**: obliczenie maksymalnie 420 rat i 50 000 000 zł bez zmiany istniejących limitów MVP

**Constraints**: czysta domena bez React/I/O; kwoty w groszach; zaokrąglanie w jednym miejscu; route tylko parsuje i deleguje; brak nowych zależności

**Scale/Scope**: jedna funkcja domenowa, jeden kontrakt `GET /api/harmonogram`, istniejący ekran i testy regresyjne

## Kontrola konstytucji

Plik `.specify/memory/constitution.md` pozostaje szablonem i nie zawiera
ratyfikowanych zasad ani bramek do oceny. Stosowane są wiążące konwencje z
`AGENTS.md`: czysta domena, cienki route handler, TypeScript strict, Vitest,
test-first dla logiki obliczeń, brak nowych zależności i pełna walidacja npm.

**Wynik przed Phase 0**: PASS. Plan nie wprowadza wyjątku od tych konwencji.

## Struktura projektu

```text
app/
├── page.tsx
└── api/harmonogram/route.ts
src/
├── domena/harmonogram.ts
└── dane/wskazniki.ts
tests/
└── smoke.test.ts
```

**Decyzja strukturalna**: pozostaje istniejący monolit Next.js. Obliczenia i
typy nadpłat pozostają w `src/domena/harmonogram.ts`, parsowanie trybu i jego
wartości domyślnej w `app/api/harmonogram/route.ts`, a testy w `tests/`.

## Kolejność realizacji

1. Dodać czerwony test przypadku CR-A dla obu trybów oraz test kompatybilności
	braku trybu.
2. Zmienić parser nadpłat tak, aby brak trybu normalizował się do
	`skroc_okres`, bez zmiany jawnych wartości i obliczeń domenowych.
3. Dodać do `README.md` konwencję: nadpłata po racie miesiąca, odsetki od
	salda sprzed nadpłaty, a kolejne odsetki od salda po nadpłacie.
4. Uruchomić testy, typecheck, lint i build; ręcznie sprawdzić kontrakt API.

## Kontrola konstytucji po projekcie

**Wynik po Phase 1**: PASS. Projekt pozostaje test-first, nie dodaje
zależności, utrzymuje obliczenia w czystej domenie i zachowuje cienki route
handler. Nie ma nierozstrzygniętych pytań projektowych.

## Śledzenie złożoności

Brak naruszeń konstytucji wymagających uzasadnienia.
