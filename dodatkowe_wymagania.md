## CR-A: Wybór skutku nadpłaty: skrócenie okresu albo obniżenie raty

| Numer | Poziom | Zgłaszający | Data |
|---|---|---|---|
| CR-A | A (łatwa) | Departament Produktów Hipotecznych | 2026-09-23 |

**Treść zgłoszenia.** Kalkulator po nadpłacie zawsze skraca okres kredytowania.
Art. 39 ust. 1 ustawy z 23 marca 2017 r. o kredycie hipotecznym daje konsumentowi prawo
do spłaty całości lub części kredytu przed terminem w każdym czasie, a nasza umowa
pozwala klientowi wybrać sposób rozliczenia nadpłaty: skrócenie okresu przy
niezmienionej racie albo obniżenie raty przy niezmienionym okresie. Doradcy w oddziałach
potrzebują pokazać klientowi oba warianty obok siebie. Prosimy o parametr trybu przy
każdej nadpłacie; domyślny tryb pozostaje bez zmian (skrócenie okresu).

**Kryteria akceptacji.**
1. Każda nadpłata ma tryb: „skróć okres" albo „obniż ratę". Brak trybu oznacza „skróć okres".
2. „Obniż ratę": liczba rat bez zmian, rata przeliczona na pozostałe raty od salda po nadpłacie.
3. „Skróć okres": rata bez zmian, harmonogram kończy się wcześniej, ostatnia rata wyrównująca.
4. W obu trybach suma spłaconego kapitału (raty plus nadpłaty) równa się kwocie kredytu.

**Przypadek testowy.** Kredyt 300 000 zł, 240 rat równych, oprocentowanie 6,66 %
(WIBOR 3M 4,55 % + marża 2,11 pp). Nadpłata 30 000 zł po zaksięgowaniu 1. raty.

| Wielkość | Wartość |
|---|---|
| Rata przed nadpłatą | 2 265,07 zł |
| Saldo po 1. racie i nadpłacie | 269 399,93 zł |
| „Obniż ratę": nowa rata od 2. raty, 240 rat razem | 2 038,11 zł |
| „Skróć okres": rata bez zmian, liczba rat razem | 2 265,07 zł, 196 rat (195 po nadpłacie) |
| „Skróć okres": ostatnia rata wyrównująca | 2 200,53 zł |

**Jak to zrobić procesem.**
1. Czerwony test: dopisz test `nadplata.tryb` z liczbami z karty, `npm test` ma go oblać.
2. Poprawka: najmniejsza zmiana, która zieleni test; reszta testów zielona; konwencję
   „nadpłata po racie miesiąca, odsetki od salda sprzed nadpłaty" wpisz do README.
3. PR: gałąź `cr-a-tryb-nadplaty`, opis PR z odhaczonymi kryteriami 1–4, `gh pr create`.
4. Review Copilota: dodaj Copilota jako reviewera, każdą uwagę zamknij poprawką albo
   krótkim uzasadnieniem odmowy w komentarzu.
5. Merge i tag: `gh pr merge --squash`, `git tag v0.2.0`, `git push --tags`; Vercel wdraża
   main automatycznie, sprawdź adres produkcyjny i wyślij go prowadzącemu mailem.

Źródło: https://lexlege.pl/kredyt-hipot-i-nadzor/art-39/

---
