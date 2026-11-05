ODKRYJ WARSZAWĘ 2.0 — PRZEWODNIK NA IPHONE
Data aktualizacji: 5 listopada 2026

REPOZYTORIUM
https://github.com/Auriol-kno/Zwiedzanie-trip

CO NOWE W WERSJI 2.0
- 118 atrakcji we wszystkich 18 dzielnicach Warszawy.
- Lista dzielnic i szybki wybór dzielnicy oraz całej Warszawy.
- Wyszukiwanie miejsc według nazwy, opisu i dzielnicy.
- Ustawienie początku wycieczki na terenie wybranej dzielnicy.
- Większy promień mapy do 25 km.
- Oddzielny katalog JSON oraz plik JS dla działania PWA.

NADAL DOSTĘPNE
- Interaktywna mapa, okrąg i własny wielokąt.
- Planer czasu i kolejności odwiedzania atrakcji.
- Środki transportu: pieszo, rower, transport publiczny, samochód.
- Karty miejsc z opisem i szacowanym czasem zwiedzania.
- Ulubione, pieczątki, trzy motywy graficzne.

INSTALACJA NA IPHONIE
1. GitHub → Settings → Pages → Deploy from a branch, main, /(root).
2. Otwórz publiczny adres GitHub Pages w Safari.
3. Udostępnij → Dodaj do ekranu początkowego.
4. Po publikacji nowej wersji odśwież Safari; PWA aktualizuje pamięć podręczną.

STRUKTURA
index.html — interfejs, mapa i planer
data/atrakcje.json — źródłowa baza atrakcji
data/atrakcje.js — kopia do przeglądarki, generowana z JSON
tools/sync_database.py — kontrola i synchronizacja danych
service-worker.js — cache aplikacji
manifest.webmanifest — instalacja na iPhonie
PLAN_ROZWOJU.md — kolejne etapy

AKTUALIZOWANIE DANYCH
Edytuj data/atrakcje.json i uruchom: python tools/sync_database.py.
Następnie zatwierdź zmianę pliku JSON i automatycznie wygenerowanego JS.

WAŻNE OGRANICZENIA
To prototyp: 118 atrakcji tworzy katalog redakcyjny, nie pełny urzędowy spis.
Godziny, ceny i lokalizacje części atrakcji trzeba zweryfikować.
Czas pobytu i transportu jest szacowany. Rysowana trasa łączy punkty,
ale nie jest routingiem drogowym. Konkretne linie WTP i przesiadki
należy sprawdzić w nawigacji — połączenia na żywo wymagają integracji.
