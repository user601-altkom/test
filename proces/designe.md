# Prompt dla Claude Design

Zaprojektuj i wygeneruj kompletny ekran aplikacji webowej jako jeden komponent React z Tailwind CSS.

Kontekst:
Tworzę kalkulator harmonogramu spłat kredytu hipotecznego dla doradcy bankowego. Aplikacja obsługuje oprocentowanie oparte na POLSTR 1M oraz WIBOR 3M, raty równe i malejące oraz nadpłaty kredytu.

Wymagania techniczne:
- Wygeneruj jeden plik `app/page.tsx`.
- Komponent musi mieć dyrektywę `'use client'` w pierwszej linii.
- Używaj wyłącznie Reacta i klas Tailwind CSS.
- Nie używaj bibliotek UI, zewnętrznych komponentów ani ikon z bibliotek.
- Komponent ma być domyślnym eksportem: `export default function Strona()`.
- Nie dodawaj backendu ani przykładowych obliczeń finansowych.
- Nie używaj sztucznych danych w tabeli jako wyniku działania aplikacji.
- Cała logika finansowa znajduje się poza komponentem, w API.
- Dane pobieraj przez `fetch` z endpointu `/api/harmonogram`.

Kierunek wizualny:
- Interfejs ma wyglądać jak nowoczesne, profesjonalne narzędzie dla doradcy bankowego.
- Układ ma być spokojny, czytelny i nastawiony na szybkie porównywanie danych.
- Zastosuj jasne tło w kolorze złamanej bieli, ciemny granat lub grafit dla tekstu oraz jeden wyrazisty akcent w kolorze petrol/teal.
- Dodaj niewielki drugi akcent kolorystyczny dla informacji pozytywnych i ostrzeżeń.
- Unikaj fioletu, generycznego dashboardu, dużych kart marketingowych i dekoracyjnych gradientów.
- Użyj wyraźnej hierarchii typografii: elegancki nagłówek, zwarte etykiety pól, monospacjowe lub bardzo czytelne liczby w wynikach.
- Zaokrąglenia elementów ogranicz do maksymalnie 8 px.
- Interfejs ma być responsywny i dobrze działać na telefonie oraz szerokim ekranie.
- Nie twórz landing page. Pierwszy widok ma od razu pokazywać działający kalkulator.

Struktura ekranu:

1. Górny nagłówek:
- Tytuł: `Harmonogram spłat`.
- Podtytuł: `Kalkulator kredytu hipotecznego na POLSTR i WIBOR`.
- Mały status informujący, że obliczenia wykonywane są na podstawie danych wskaźnika.

2. Główna sekcja formularza:
Utwórz formularz z następującymi polami:
- `Kwota kredytu` w PLN,
- `Liczba rat`,
- `Data pierwszej raty` w formacie `YYYY-MM-DD`,
- `Marża banku` w punktach procentowych,
- `Wskaźnik` jako wybór: `POLSTR 1M` albo `WIBOR 3M`,
- `Typ rat` jako przełącznik lub segmented control: `Równe` albo `Malejące`.

Dodaj wyraźny przycisk główny `Policz harmonogram`.

Formularz powinien:
- mieć wartości początkowe: kwota `400000`, liczba rat `300`, data pierwszej raty `2026-10-01`, marża `2.11`, wskaźnik `POLSTR_1M`, typ rat `rowne`,
- walidować wymagane pola po stronie przeglądarki,
- blokować przycisk podczas pobierania,
- pokazywać czytelny komunikat błędu.

3. Sekcja nadpłat:
Dodaj możliwość tworzenia listy nadpłat. Każdy wiersz powinien zawierać:
- miesiąc lub numer raty nadpłaty,
- kwotę nadpłaty w PLN,
- tryb: `Obniż ratę` albo `Skróć okres`,
- przycisk usunięcia wiersza.

Dodaj przycisk `Dodaj nadpłatę`.

Lista może być pusta. Formularz powinien umożliwiać edycję wielu nadpłat.

4. Sekcja podsumowania:
Po poprawnym pobraniu danych pokaż cztery wyraźne wartości:
- `Pierwsza rata`,
- `Ostatnia rata`,
- `Suma odsetek`,
- `Liczba rat`.

Wartości kwot pokazuj w PLN, z separatorem tysięcy i dokładnie dwoma miejscami po przecinku.

5. Tabela harmonogramu:
Pokaż tabelę wynikową z kolumnami:
- `Nr`,
- `Data`,
- `Kapitał`,
- `Odsetki`,
- `Rata`,
- `Saldo po spłacie`.

Tabela powinna:
- być czytelna na desktopie,
- mieć poziome przewijanie na telefonie,
- wyróżniać ostatnią ratę,
- używać wyrównania do prawej dla kwot,
- formatować kwoty jako PLN,
- pokazywać pusty stan przed pierwszym obliczeniem,
- nie powodować przesuwania layoutu podczas ładowania.

Dodaj nad tabelą przycisk `Eksport CSV`.

Eksport CSV:
- wykonuj wyłącznie po stronie przeglądarki,
- użyj separatora `;`,
- użyj polskich nagłówków,
- zapisz plik jako UTF-8,
- eksportuj numer, datę, kapitał, odsetki, ratę i saldo po spłacie,
- nazwij plik np. `harmonogram-splat.csv`.

Integracja z API:
Po zatwierdzeniu formularza wykonaj żądanie `GET /api/harmonogram`.

Parametry podstawowe w query string:
- `kwota`,
- `liczbaRat`,
- `marza`,
- `wskaznik`,
- `typRat`,
- `pierwszaRata`.

Parametry nadpłat przekaż również w query string w sposób łatwy do zmiany, jeśli backend będzie wymagał innego formatu. Umieść serializowanie nadpłat w osobnej małej funkcji, aby można je było łatwo podmienić.

Zakładany kształt odpowiedzi API:

```ts
{
  raty: Array<{
    numer: number;
    data: string;
    kapital: number;
    odsetki: number;
    rata: number;
    saldoPoSplacie: number;
  }>;
  sumaOdsetek: number;
}
```

Kwoty z API mogą być zwracane w groszach, dlatego przygotuj jedną funkcję formatującą grosze na kwotę PLN. Nie umieszczaj w komponencie żadnych wzorów finansowych.

Uwzględnij stany:
- początkowy, przed obliczeniem,
- ładowanie,
- poprawny wynik,
- błąd API,
- brak rat w odpowiedzi.

Zadbaj o:
- poprawne etykiety powiązane z polami formularza,
- widoczne stany focus i disabled,
- dobrą dostępność kontrastu,
- obsługę klawiatury,
- responsywność,
- brak nachodzenia tekstu i elementów,
- brak poziomego przewijania całej strony.

Wygeneruj wyłącznie gotowy komponent React w jednym pliku, bez objaśnień i bez dodatkowych plików.
