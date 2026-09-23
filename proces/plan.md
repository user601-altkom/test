## Plan: Kalkulator harmonogramu POLSTR/WIBOR

Cel: dokończyć kalkulator harmonogramu spłat w istniejącej architekturze Next.js: czysta domena obliczeniowa, cienki route handler, ekran React/Tailwind i testy Vitest.

### Odkrycia
- `src/domena/harmonogram.ts` zawiera obecnie wyłącznie szkielet `ParametryKredytu` i funkcję `policzHarmonogram`.
- `src/dane/wskazniki.ts` udostępnia serie wskaźników z JSON; wartości są ułamkami dziesiętnymi.
- `app/api/harmonogram/route.ts` ma pozostać warstwą parsowania/walidacji i wywołania domeny.
- `app/page.tsx` jest placeholderem; docelowo ma być komponentem klientowym z formularzem, fetch, wynikami, tabelą i eksportem CSV.
- Testy domeny są niewystarczające; projekt używa Vitest, TypeScript strict i nie ma dodawać nowych zależności.

### Uzgodnienia
- Nadpłaty są obowiązkowe w MVP i obejmują domenę, API oraz UI.
- Eksport CSV: UTF-8, separator `;`, polskie nagłówki.
- Nadpłata nie ma dnia; w planie trzeba przyjąć jeden deterministyczny moment zastosowania i testować go.
- Użytkownik wybrał zmianę wskaźnika „od następnej raty”; trzeba doprecyzować, czy wpis `od` oznacza ratę graniczną, po której dopiero kolejna rata używa nowej wartości.

### Kroki
1. Ustalić kontrakt danych i reguły graniczne: typy parametrów, raty, wynik, nadpłaty, walidacja, daty i zaokrąglanie. Pytania: dokładny moment nadpłaty; czy nowa stawka obowiązuje od raty granicznej czy dopiero kolejnej.
2. Dodać testy domeny przed implementacją: liczba kontrolna rat równych, malejące, zmiana wskaźnika, oba tryby nadpłaty, suma kapitału oraz testy granic i końcowego wyrównania.
3. Zaimplementować czyste obliczenia w `src/domena/harmonogram.ts`: wybór stawki z przekazanej serii, daty, odsetki, raty równe/malejące, nadpłaty, końcowe wyrównanie i suma odsetek. Nie importować React/I/O ani nie liczyć w route.
4. Rozszerzyć `app/api/harmonogram/route.ts`: parsować query string wraz z listą nadpłat, wybrać serię wskaźnika, wywołać domenę, mapować błędy na 400 i zwrócić stabilny JSON.
5. Zastąpić placeholder w `app/page.tsx`: formularz, dynamiczna lista nadpłat, fetch, stany ładowania/błędu, podsumowanie, tabela oraz CSV po stronie przeglądarki. Zachować `'use client'`, Tailwind i brak biblioteki UI.
6. Zweryfikować integrację i wydanie: testy, typecheck, lint, build, ręczne wywołanie API/UI, eksport CSV oraz konfigurację Vercel/README zgodnie z KARTA.md.

### Weryfikacja końcowa
- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- ręcznie: liczba kontrolna 400000 zł / 300 rat / 5,66%, zmiana POLSTR/WIBOR, oba tryby nadpłaty, suma kapitału i CSV.
