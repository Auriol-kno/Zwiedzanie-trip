# Odkryj Warszawę 3.0 — model danych i integracje

## Zakres
- **184 atrakcje** w **18 dzielnicach** (`data/atrakcje.json`).
- **36 lokali gastronomicznych**, kuchnia, typ, dzielnica, orientacyjny budżet, tagi i adres (`data/restauracje.json`).
- **Warto odwiedzić 1–5** to ocena kuratorska; nie jest średnią ocen odwiedzających. Przygotowana redakcyjnie, bez deklarowania realnych danych o liczbie turystów.
- **Polecenie redakcji 1–5** dotyczy tylko lokali gastronomicznych. Nie jest oceną Google.
- `googleRating: null` oznacza **brak aktualnego odczytu**; nie zapisujemy przypadkowych snapshotów.

## Sześć obszarów rozwoju — stan 3.0
1. **WTP:** przyciski do oficjalnego rozkładu WTP oraz trasy z przesiadkami przez Google Maps. Numery linii i rzeczywiste odjazdy **nie są** liczone w aplikacji — integracja API jest kolejnym etapem.
2. **Inteligentny planer:** wybór tempa 80% / 100% / 125%, minimalna wartość atrakcji 1–5, ocena rodzinne/foto, uwzględnianie dostępności i zapas czasu na posiłek. Czasy przemieszczenia są orientacyjne; nie jest to routing po grafie ulic.
3. **Fotografia:** preferowanie parków, widoków i architektury, podpowiedź kadru, orientacyjna złota godzina obliczana lokalnie według przybliżenia astronomicznego.
4. **Rodzina:** aktywny tryb rodzinny z preferencjami wieku 6–9, 10–13 i 14+ oraz zwiększeniem priorytetu atrakcji rodzinnych. Ocena dostępności dla konkretnego wieku nie jest gwarancją.
5. **Przewodnik głosowy:** lokalna synteza mowy `SpeechSynthesis` opisów redakcyjnych. **To nie jest jeszcze AI generujące nowe opisy.** Funkcja AI wymaga później autoryzowanego backendu i nadzoru nad treścią.
6. **Offline i GPS:** katalog i interfejs PWA w pamięci cache, opcjonalne ustalenie pozycji za zgodą użytkownika i eksport planu jako TXT. **Mapy zewnętrzne, trasy i opinie Google nie są dostępne całkowicie offline.**

## Restauracje i aktualne gwiazdki Google
Link **Opinie Google** otwiera odpowiednią wyszukiwarkę Google Maps, gdzie użytkownik sprawdza aktualne oceny i godziny. Aplikacja **nie pobiera ocen Google na żywo**, ponieważ wymagałoby to prawidłowej integracji Google Maps Platform Places API, obsługi płatności, zgodności z licencją i polityką wyświetlania danych w EOG. W publicznym GitHub Pages nie wolno umieszczać tajnego klucza serwera.

Do produkcyjnej integracji:
- utwórz oddzielny backend (np. serverless) dla zapytań Places API;
- korzystaj z identyfikatorów `place_id`, nie z dopasowania po nazwie przy każdym pobraniu;
- weryfikuj licencję, atrybucję, możliwości cache i regulaminy dla map innych niż Google;
- zastosuj limity kosztów i monitorowanie;
- nie mieszaj gwiazdek gości z oceną `visitValue`.

## Aktualizacja danych
Zmodyfikuj pliki JSON, uruchom `python tools/sync_database.py`, a potem testy `python tools/test_bundle.py`. GitHub Actions weryfikuje, czy generowane pliki `.js` są zsynchronizowane.

Źródła: [Przewodnik Warszawy](https://go2warsaw.pl/), [WTP](https://www.wtp.waw.pl/), [Google Maps Platform](https://developers.google.com/maps/documentation/places/web-service/policies), [MICHELIN Guide](https://guide.michelin.com/en/at/masovia/warsaw/restaurants).

**Uwaga:** miejsca i adresy zweryfikowano na podstawie katalogów biznesowych, ale wiele współrzędnych parków i pomników jest orientacyjnych. Przed odwiedzeniem obiektu należy sprawdzić aktualną dostępność i dane organizatora.
