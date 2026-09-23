# Model danych: CR-A

## TrybNadplaty

Enum domenowy opisujący skutek nadpłaty:

- `obniz_rate` - liczba rat całego harmonogramu pozostaje bez zmian, a rata od następnej raty jest wyliczana od salda po nadpłacie i liczby pozostałych rat.
- `skroc_okres` - rata regularna pozostaje bez zmian, a harmonogram kończy się po wcześniejszej spłacie; ostatnia rata wyrównuje pozostały kapitał.

Brak trybu w wejściu API jest normalizowany do `skroc_okres`.

## Nadplata

Reprezentuje jedną nadpłatę:

| Pole | Typ | Reguły |
|---|---|---|
| `numerRaty` | liczba całkowita | od 1 do `liczbaRat`, maksymalnie jedna nadpłata na numer |
| `kwotaGr` | liczba całkowita | dodatnia kwota w groszach; faktyczna kwota nie przekracza pozostałego salda |
| `tryb` | `TrybNadplaty` | `obniz_rate` albo `skroc_okres`; po normalizacji zawsze obecny |

Nadpłata jest stosowana po zaksięgowaniu raty o danym numerze. Jej faktyczna wartość jest częścią wyniku raty i może być oznaczona jako ograniczona.

## Rata

Wynik jednej raty zawiera między innymi `numer`, `data`, `kapitalGr`, `odsetkiGr`, `rataGr`, `nadplataGr`, `nadplataOgraniczona` i `saldoPoSplacieGr`.

Odsetki są liczone od salda przed ratą. Po odjęciu kapitału raty odejmowana jest nadpłata, a tak powstałe saldo jest podstawą kolejnego okresu.

## Niezmienniki

- `saldoPoSplacieGr >= 0`.
- Suma `kapitalGr + nadplataGr` po wszystkich ratach jest równa początkowej kwocie kredytu.
- W trybie `obniz_rate` liczba rat jest równa wejściowej `liczbaRat`, o ile saldo nie zostało zamknięte wcześniej przez nadpłatę.
- W trybie `skroc_okres` liczba rat może być mniejsza od wejściowej `liczbaRat`.
- Wszystkie wartości pieniężne API są groszami.

## Przypadek kontrolny

Dla 300 000 zł, 240 rat, stopy 6,66% i nadpłaty 30 000 zł po racie 1:

- rata przed nadpłatą: 2 265,07 zł,
- saldo po racie i nadpłacie: 269 399,93 zł,
- `obniz_rate`: 2 038,11 zł od raty 2, 240 rat łącznie,
- `skroc_okres`: 2 265,07 zł, 196 rat łącznie, ostatnia rata 2 200,53 zł.
