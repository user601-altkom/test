# Kontrakt API harmonogramu

## Żądanie

`GET /api/harmonogram`

Parametry podstawowe pozostają bez zmian: `kwota`, `liczbaRat`, `marza`, `wskaznik`, `typRat`, `pierwszaRata`.

Nadpłata jest przekazywana jako powtarzalny parametr:

`nadplata=numerRaty:kwota[:tryb]`

Przykład jawnego trybu:

`nadplata=1:30000:obniz_rate`

Trzeci element jest opcjonalny. Brak elementu oznacza `skroc_okres`.

## Odpowiedź 200

```json
{
  "raty": [
    {
      "numer": 1,
      "data": "2026-10-01",
      "kapital": 60007,
      "odsetki": 166500,
      "rata": 226507,
      "nadplata": 3000000,
      "nadplataOgraniczona": false,
      "saldoPoSplacie": 26939993
    }
  ],
  "sumaOdsetek": 0
}
```

Kwoty są w groszach. Rzeczywista odpowiedź zawiera wszystkie raty, a `sumaOdsetek` jest sumą `odsetki`.

## Odpowiedź 400

```json
{
  "blad": "opis błędu"
}
```

Nieznany tryb, niedodatnia kwota, niepoprawny numer raty lub niepoprawny parametr podstawowy zwracają 400. Brak trybu nie jest błędem.
