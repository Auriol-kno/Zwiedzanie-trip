/* Tu Byłem 4.0: wspólny przełącznik PL/EN dla Atlasu i Warszawy.
 * Każda widoczna karta EN otrzymuje angielski tytuł i opis, niezależnie od języka źródłowego bazy.
 */
(function(){
'use strict';
if(!window.WARSAW_DB||!document.getElementById('langWarsaw'))return;
const $=s=>document.querySelector(s);
const PREFIX='tubylem_lang';
let lang=(new URLSearchParams(location.search).get('lang')||localStorage.getItem(PREFIX)||'pl')==='en'?'en':'pl';
const PAIRS=[
['Miejsca i Wspomnienia','Places & Memories'],['Tu Byłem — Miejsca i Wspomnienia','Tu Byłem — Places & Memories'],
['TU BYŁEM','I WAS HERE'],
['Warszawa · 18 dzielnic · przewodnik 2.0','Warsaw · 18 districts · city guide'],
['Warszawa · 18 dzielnic · przewodnik 3.0','Warsaw · 18 districts · city guide'],['Warszawa · 18 dzielnic · przewodnik 4.0','Warsaw · 18 districts · city guide'],['Warszawa · 18 dzielnic · przewodnik miejski','Warsaw · 18 districts · city guide'],['Wygląd','Theme'],['Zmień wygląd','Change appearance'],['I Was Here — Atlas Polski','I Was Here — Poland Atlas'],['Wróć do mapy Polski','Back to the Poland Atlas'],['I Was Here — wróć do Atlasu Polski','I Was Here — back to the Poland Atlas'],
['Twoje miasto.','Your city.'],['Twoja trasa.','Your journey.'],
['Zaznacz obszar lub wybierz dzielnicę. Odkryj ponad sto miejsc i ułóż własną trasę.','Choose an area or district. Discover local sights and design your own route.'],['Zaznacz obszar lub wybierz dzielnicę. Odkryj 184 miejsca i ułóż własną trasę.','Choose an area or district. Explore 184 sights and plan your own route.'],
['W twoim obszarze','In your area'],['atrakcji do wyboru','places to explore'],['Czas wycieczki','Trip duration'],['z szacowanymi dojazdami','including estimated travel'],['Twój paszport','Your passport'],['zdobytych pieczątek','collected stamps'],
['✨ Inteligentny przewodnik','✨ Smart city guide'],['Dopasuj tempo, kategorię i czas zwiedzania. Ocena 1–5 to redakcyjna wartość odwiedzenia — nie ocena Google.','Set your pace, preferences and visiting time. Our 1–5 rating is editorial, not a Google score.'],
['Minimalna wartość miejsca','Minimum visit rating'],['Tempo zwiedzania','Sightseeing pace'],['Szybkie (80%)','Quick (80%)'],['Standardowe','Standard'],['Spokojne (125%)','Relaxed (125%)'],['📸 Tryb fotografa','📸 Photo mode'],['👨‍👩‍👧‍👦 Tryb rodzinny','👨‍👩‍👧‍👦 Family mode'],['Wiek dziecka','Child age'],['6–9 lat','6–9 years'],['10–13 lat','10–13 years'],['14+ lat','14+ years'],['Czas na odpoczynek','Break time'],['Bez przerwy','No break'],['20 min','20 min'],['30 min','30 min'],['45 min','45 min'],['60 min','60 min'],['90 min','90 min'],
['Godziny światła fotograficznego…','Photography light times…'],['📍 Start z GPS','📍 Start from GPS'],['↓ Zapisz plan offline','↓ Save offline itinerary'],['🚋 Rozkłady WTP','🚋 Public transport timetables'],['Lokalizacja jest pobierana tylko za zgodą użytkownika.','Location is accessed only with your permission.'],['Sprawdzanie połączenia…','Checking connection…'],
['Mapy oraz rzeczywiste połączenia komunikacji miejskiej wymagają dostępu do sieci. Godziny zwiedzania i czasy przejazdu są szacunkowe.','Maps and live public transport information require internet. Visiting and travel times are estimates.'],
['Obszar zwiedzania','Sightseeing area'],['Rysuj na mapie albo wybierz dzielnicę','Draw on the map or choose a district'],['Reset ↺','Reset ↺'],['◉ Okrąg','◉ Circle'],['⬡ Rysuj obszar','⬡ Draw area'],['⌖ Ustaw start','⌖ Set start'],['✓ Gotowe','✓ Done'],['Dotknij mapy, aby ustawić środek obszaru. Przesuń promień po prawej.','Tap the map to set the centre. Adjust the radius on the right.'],['Promień','Radius'],
['Odkryj dzielnicę','Discover a district'],['18 dzielnic','18 districts'],['Wybierz obszar administracyjny','Choose an administrative district'],['Obszar z mapy (okrąg lub wielokąt)','Area drawn on the map'],['Cała Warszawa — 18 dzielnic','All Warsaw — 18 districts'],['📍 Start tutaj','📍 Start here'],['Dzielnice filtrują atrakcje. Granice administracyjne nie są tu rysowane; piny nowych miejsc są orientacyjne.','District filters show matching sights. Administrative borders are not shown; some new map pins are approximate.'],
['📍 Punkt początkowy','📍 Starting point'],['Stare Miasto','Old Town'],['Centrum / PKiN','City Centre / Palace of Culture'],['Łazienki Królewskie','Royal Łazienki Park'],['Pałac w Wilanowie','Wilanów Palace'],['Centrum Nauki Kopernik','Copernicus Science Centre'],['Dworzec Centralny','Central Station'],['Własny punkt z mapy','Custom point on the map'],
['📅 Data zwiedzania','📅 Visit date'],['🕘 Godzina rozpoczęcia','🕘 Start time'],['🧭 Priorytet','🧭 Priority'],['Najciekawsze miejsca','Top sights'],['Krótkie dojazdy','Short travel legs'],['Darmowe atrakcje','Free attractions'],['Odkrywanie mniej znanych','Hidden gems'],['Jak długo chcesz zwiedzać?','How long would you like to explore?'],['Jak się przemieszczasz?','How will you travel?'],['Pieszo','Walk'],['Transport','Public transport'],['Rower','Bike'],['Samochód','Car'],
['Co Cię interesuje?','What interests you?'],['Wybierz jeden lub kilka tematów','Choose one or more interests'],['Wszystkie','All'],['Plan Twojego dnia','Your day itinerary'],['Trasa dopasowana do Twojego czasu','A route tailored to your time'],['✦ Plan wycieczki','✦ Trip itinerary'],['⟳ Przelicz','⟳ Recalculate'],['Najlepsze z Warszawy','Warsaw highlights'],['Dojazdy sprawdzisz w nawigacji.','Check travel directions in Maps.'],['🚋 Do pierwszego punktu komunikacją','🚋 Transit to first stop'],['🧭 Nawiguj trasą','🧭 Open navigation'],['⇧ Udostępnij','⇧ Share'],
['Miejsca warte uwagi','Places worth exploring'],['Odkryj atrakcje w wybranym obszarze','Discover sights in your selected area'],['♡ Zapisane','♡ Saved'],['♥ Pokaż wszystkie','♥ Show all'],['🔎 Szukaj atrakcji w wybranym obszarze','🔎 Search sights in this area'],
['🍽️ Jedzenie i kawiarnie','🍽️ Food & cafés'],['Odkrywaj restauracje według kuchni, rodzaju lokalu, dzielnicy i budżetu. Oceny i dostępność sprawdzisz w Google Maps.','Find food by cuisine, venue type, district and budget. Check current reviews and opening status in Google Maps.'],['Wyszukaj lokal','Search places to eat'],['Dzielnica','District'],['Kuchnia','Cuisine'],['Typ lokalu','Venue type'],['Budżet','Budget'],['Niedrogo','Low budget'],['Do umiarkowanego','Moderate'],['Do wyższego','Higher budget'],['Wszystkie ceny','All budgets'],['Sortuj','Sort by'],['Wybór redakcji','Editorial picks'],['Nazwa A–Z','Name A–Z'],['Najpierw budżet','Lowest budget first'],
['✦ Polecenie redakcji i „Warto odwiedzić” 1–5 to niezależne oceny kuratorskie. Nie są ocenami Google. Nie zapisujemy historycznych gwiazdek Google ani nie zgadujemy aktualnych ocen.','✦ Editorial food picks and 1–5 visit ratings are our independent scores, not Google reviews. We do not store or invent Google star ratings.'],
['I Was Here 5.1 • redakcyjna baza 184 miejsc + 36 lokali gastronomicznych we wszystkich dzielnicach, stan: listopad 2026. Czas zwiedzania i transportu to szacunki, a nowe współrzędne mogą być orientacyjne. Godziny i ceny należy potwierdzić.','I Was Here 5.1 • 184 curated sights and 36 food venues across Warsaw. Travel and visiting times are estimates; some map coordinates are approximate. Check current hours and prices.'],['WTP Warszawa','Warsaw public transport'],['Taryfa biletowa','Ticket prices'],['Mapa','Map'],['Plan dnia','Day plan'],['Atrakcje','Sights'],['Jedzenie','Food'],['Paszport','Passport'],
['Kolekcja wspomnień','Memories collection'],['Paszport odkrywcy','Explorer passport'],['Zbieraj wirtualne pieczątki po odwiedzeniu atrakcji. Są zapisywane na tym urządzeniu.','Collect digital stamps after visiting sights. They are saved on this device.'],
['Personalizacja','Personalisation'],['Styl aplikacji','App theme'],['Wybierz wygląd najbardziej odpowiadający sposobowi, w jaki lubisz odkrywać miasto.','Choose the look that best suits the way you explore.'],
['W przyszłości: fotografie wysokiej jakości, tryb offline, inteligentny asystent i integracja z transportem publicznym.','Coming next: richer photography, fuller offline maps, AI assistant and public transport integration.'],
['ODKRYJ WARSZAWĘ / TWOJA PODRÓŻ','EXPLORE WARSAW / YOUR ADVENTURE'],['Od czego dziś','Where shall we'],['zaczniemy?','begin today?'],['Stworzymy trasę skrojoną pod Ciebie. Na początek wybierz, ile czasu możesz poświęcić.','We will create a route for you. First choose how much time you have.'],['ILE MASZ CZASU?','HOW MUCH TIME?'],['GDZIE ROZPOCZYNASZ?','WHERE WILL YOU START?'],['Zobacz Warszawę →','Explore Warsaw →'],['Bez logowania • bez konta • na Twoim iPhonie','No login • no account • on your iPhone'],
['Historia','History'],['Muzea','Museums'],['Parki','Parks'],['Widoki','Views'],['Nauka','Science'],['Rodzinne','Family'],['Architektura','Architecture'],['Mniej znane','Hidden gems'],['Pomniki i pamięć','Monuments & memorials'],
['Otwórz nawigację','Open directions'],['Pokaż szczegóły przejazdu','Show directions'],['Sprawdź linię, przesiadki i trasę w nawigacji','Check the line and transfers in Maps'],['Szczegóły','Details'],
['Historia miejsca','History & background'],['Transport i dojście','Getting there'],['Cena wstępu','Admission price'],['Godziny otwarcia','Opening hours'],['Typowy pobyt (szacunek)','Typical visit (estimate)'],['Warto odwiedzić','Worth visiting'],['Informacje o miejscu','Information'],['Jak dojechać','Directions'],['Oficjalne informacje','Official information'],
['♡ Zapisz miejsce','♡ Save place'],['♥ Zapisano','♥ Saved'],['✣ Zdobądź pieczątkę','✣ Collect stamp'],['✓ Pieczątka zdobyta','✓ Stamp collected'],
['✦ Warto odwiedzić:','✦ Worth visiting:'],['Ocena redakcyjna, nie opinie Google. Nowe lokalizacje mogą być orientacyjne.','Editorial rating, not Google reviews. Some new locations are approximate.'],['📸 Podpowiedź fotograficzna:','📸 Photo tip:'],['🔊 Posłuchaj opisu','🔊 Listen to guide'],['■ Zatrzymaj','■ Stop'],['Przewodnik głosowy czyta przygotowany tekst, nie jest to generacja AI na żywo.','The audio guide reads prepared text; it does not generate AI narration live.'],
['Zwykle bezpłatnie','Usually free'],['Sprawdź aktualny cennik u organizatora','Check current admission prices'],['Sprawdź aktualne godziny na stronie organizatora','Check current opening times on the official website'],['Teren zewnętrzny: sprawdź zasady dostępności i ewentualne ograniczenia','Outdoor area: check access restrictions'],['Bilety: sprawdź','Tickets: check prices'],['Bezpłatnie','Free entry'],['Dziś bezpłatnie','Free today'],
['zł','PLN'],['godz.','hours'],['godziny','hours'],['min','min'],
['restauracja','restaurant'],['bistro','bistro'],['streetfood','street food'],['finedining','fine dining'],['kawiarnia','café'],['bar','bar'],['polska','Polish'],['koreańska','Korean'],['chińska','Chinese'],['tajska','Thai'],['japońska','Japanese'],['włoska','Italian'],['roślinna','Plant-based'],['indyjska','Indian'],['śniadania','Breakfast'],['kawa','Coffee'],['koktajle','Cocktails'],
['Opinie Google ↗','Google reviews ↗'],['Dojazd ↗','Directions ↗'],['+ Przerwa','+ Meal stop'],['✓ Wybrano','✓ Selected'],['✦ Wybór redakcji:','✦ Editorial pick:'],['Budżet:','Budget:'],['Szacunkowy','Estimated'],['(szacunek)','(estimate)'],['⭐ Google: sprawdź aktualne opinie w Mapach','⭐ Google: check current reviews in Maps'],
['♥ Pokaż wszystkie','♥ Show all'],['♡ Zapisane','♡ Saved'],['Brak restauracji pasujących do filtrów.','No restaurants match your filters.'],
['🟢 Dane i mapy online','🟢 Online — maps available'],['🟠 Offline: zapisane miejsca dostępne; mapa może nie działać','🟠 Offline: saved places available; maps may not work'],
['Dopasuj','Customise'],['Pokaż wszystkie','Show all'],['Zapisano','Saved'],['Zapisz miejsce','Save place'],['Zdobądź pieczątkę','Collect stamp'],
['Miasto','City'],['Miejsce','Place'],['Śródmieście','City Centre'],['Praga-Północ','Praga North'],['Praga-Południe','Praga South'],
['Wszystkie dzielnice','All districts'],['Wszystkie kuchnie','All cuisines'],['Wszystkie typy lokali','All venue types'],['niedrogo','low budget'],['umiarkowanie','moderate'],['wyższy budżet','higher budget'],['premium','premium'],
['Polska','Poland'],['Atlas Polski','Poland Atlas'],['13 miast','13 cities'],['Mapa Polski','Map of Poland'],['Kuchnia koreańska, kawa, ostre, mięso…','Korean food, coffee, spicy, meat…'],['Odkryj atrakcje...','Explore sights...']
];
PAIRS.push(...[["◷ Typowy pobyt (szacunek)","◷ Typical visit (estimate)"],["🎫 Cena wstępu","🎫 Admission"],["🕘 Godziny otwarcia","🕘 Opening hours"],["✓ Odkryte","✓ Visited"],["punkt startowy","starting point"],["Start tutaj","Start here"],["🌐 Cała Warszawa","🌐 All Warsaw"],["Cała Warszawa","All Warsaw"],["obszar z mapy","area selected on map"],["Obszar z mapy (okrąg / wielokąt)","Area drawn on map (circle / polygon)"],["Cała Warszawa — wszystkie 18 dzielnic","All Warsaw — all 18 districts"],["Dotknij mapy, aby ustawić środek. Zmień promień.","Tap the map to set the centre. Adjust the radius."],["Dotknij mapy, aby ustawić dokładny punkt startowy.","Tap the map to choose the exact starting point."],["Dotykaj mapy, dodając wierzchołki obszaru. Na końcu kliknij Gotowe.","Tap the map to add polygon corners. Then tap Done."],["Otwórz","Open"],["Zapisz","Save"],["miejsce","place"],["miejsca","places"],["miejsc","places"],["atrakcja","sight"],["atrakcje","sights"],["atrakcji","sights"],["wizyta","visit"],["zobacz cennik","check prices"],["Sprawdź ceny","Check prices"],["Zmień czas lub obszar","Change the time or area"],["Wypróbuj np. 4 godz., start Stare Miasto, promień 2,5 km.","Try 4 hours, start at the Old Town, radius 2.5 km."],["Koszty wejść:","Admission costs:"],["Ważne:","Important:"],["brak potwierdzonych płatnych wejść","no confirmed paid entries"],[" + ceny do sprawdzenia w obiektach"," + prices to check at venues"],["Nie uwzględniono parkingów i opłat za paliwo. Samochód może być niepraktyczny przy zwiedzaniu centrum.","Parking fees and fuel costs are not included. Driving may be inconvenient in the city centre."],["Cena ewentualnego wypożyczenia roweru nie jest uwzględniona.","Bicycle rental costs are not included."],["lin ie WTP","WTP lines"],["Sprawdź konkretne linie i przesiadki dla swojego punktu startowego w nawigacji miejskiej. Planer pokazuje szacunkowe czasy i odległości, nie rozkład jazdy na żywo.","Find up-to-date transit lines and connections in Maps. This planner uses estimated distances and times, not live timetables."],["Planer pokazuje szacunkowe czasy i odległości, nie rozkład jazdy na żywo.","The planner shows estimated journeys and distances, not live departure times."],["Podany czas pobytu jest szacunkiem redakcyjnym, nie średnią z danych podróżnych. Godziny i ceny mogą się zmieniać: zawsze potwierdź je u organizatora.","Visit duration is an editorial estimate, not a statistical average. Opening hours and prices may change; verify them with the venue."],["Lokalizacja nowo dodanego miejsca na mapie jest orientacyjna i wymaga weryfikacji przed podróżą.","The map pin for this new place is approximate; verify its location before travelling."],["Planer układa trasę według dostępnego czasu i lokalizacji.","The planner fits the route to your available time and location."],["Wybierz dzielnicę lub zaznacz własny obszar na mapie. Położenia niektórych nowych punktów są orientacyjne.","Choose a district or draw a custom area. Some newly added map pins are approximate."],["Rezerwa czasu na przerwę:","Time reserved for a break:"],["Wybrano","Selected"],["w bazie","in the database"],["Najciekawsze","Top rated"],["Zapisane","Saved"],["14+ lat","14+ years"],["◷","◷"],["Informacje o miejscu","Information about this place"],["ⓘ Informacje o miejscu","ⓘ Place information"],["➤ Jak dojechać","➤ Directions"],["Przerwa gastronomiczna","Meal break"],["rezerwa","reserved"],["Sprawdź dojazd ↗","Check directions ↗"],["Usuń wybrany lokal","Remove selected venue"],["Wpisz nazwę miejsca","Enter place name"],["📸 Podpowiedź fotograficzna:","📸 Photography tip:"],["Spróbuj kadru z niskiej perspektywy i z szerszym kontekstem otoczenia.","Try a low-angle view and another framing the monument in its setting."],["Zrób zdjęcie przy miękkim porannym lub wieczornym świetle.","Take a photo in soft morning or evening light."],["Szukaj symetrii, linii prowadzących i ciekawego pierwszego planu.","Look for symmetry, leading lines and a strong foreground."],["Przedział budżetu jest orientacyjny","Budget band is an estimate"],["Pokaż na mapie","Show on map"],["Plan bez przerwy","No planned break"]]);
const DICT=new Map(PAIRS);
const special={
castle:['Royal Castle','Former royal residence and one of the greatest symbols of Warsaw’s reconstruction.','Home to Polish monarchs from the reign of Sigismund III Vasa. The castle was destroyed during World War II and carefully rebuilt using preserved historical details.'],
market:['Old Town Market Square','Colourful historic buildings, the Warsaw Mermaid and the unique atmosphere of the Old Town.','The medieval commercial centre of Warsaw. Rebuilt after World War II, the historic Old Town became a UNESCO World Heritage Site in 1980.'],
barbican:['Warsaw Barbican','Surviving traces of Warsaw’s old defensive walls between the Old and New Town.','The original fortifications date to the 16th century; their present appearance results from post-war reconstruction.'],
gardens:['Royal Castle Gardens','Terraced gardens offering scenic views of the Vistula River.','The garden layout was recreated from historical plans. Seasonal access restrictions may apply.'],
uprisingmon:['Warsaw Uprising Monument','A powerful memorial to the courage of the insurgents at Krasiński Square.','Unveiled in 1989, it commemorates the 1944 Warsaw Uprising and the tragic struggle for the city.'],
polin:['POLIN Museum of the History of Polish Jews','One thousand years of Jewish life in Poland presented through an engaging interactive exhibition.','Opened in 2013 beside the Ghetto Heroes Monument, in what was once the heart of Warsaw’s Jewish district.'],
uprising:['Warsaw Uprising Museum','A moving multimedia account of the 1944 uprising and everyday civilian life.','Opened in 2004 in a former tram power station, the museum documents the lives of insurgents and civilians.'],
pkin:['Palace of Culture Observation Deck','Panoramic views of Warsaw from the observation terrace on the 30th floor.','The Palace of Culture and Science was completed in 1955 and remains one of Warsaw’s defining landmarks.'],
saxon:['Saxon Garden','A peaceful historic park with a fountain and the Tomb of the Unknown Soldier.','One of Poland’s oldest public parks, opened to residents in the 18th century.'],
chopin:['Fryderyk Chopin Museum','Explore the composer’s life and music inside historic Ostrogski Palace.','Interactive displays combine Chopin’s music, personal belongings, letters and the atmosphere of 19th-century Warsaw.'],
kopernik:['Copernicus Science Centre','Hands-on experiments, discoveries and science activities for visitors of all ages.','This science centre on the Vistula waterfront opened in 2010 and encourages independent exploration.'],
bulwary:['Vistula Boulevards','Riverside walks, cafés and beautiful views across the Vistula River.','The renewed riverfront has become one of Warsaw’s most popular gathering places.'],
univlib:['Warsaw University Library Roof Garden','Green architecture above the library and stunning views over Powiśle.','Designed by Irena Bajerska, the rooftop gardens opened in 2002.'],
lazienki:['Royal Łazienki Gardens','Royal parkland, palaces, lakes and squirrels in the heart of Warsaw.','The park grew around the 18th-century summer residence of King Stanisław August Poniatowski.'],
palaceisle:['Palace on the Isle','A neoclassical jewel reflected in the waters of its surrounding lake.','Originally a bathhouse, it was transformed into an elegant royal residence by King Stanisław August.'],
chopinmon:['Fryderyk Chopin Monument','One of Warsaw’s most photogenic monuments, set among the Łazienki gardens.','Designed by Wacław Szymanowski and unveiled in 1926. The monument was destroyed in 1940 and later reconstructed.'],
wilanow:['Wilanów Palace of King John III','A magnificent Baroque royal residence with impressive historic interiors.','Built in the late 17th century for King John III Sobieski, it survived the widespread destruction of Warsaw.'],
wilanowpark:['Wilanów Gardens','Formal Baroque gardens, tree-lined paths and atmospheric palace surroundings.','The garden composition dates to the late 17th century and evolved under successive owners.'],
praga:['Museum of Warsaw Praga','The story of Warsaw’s right bank told through restored historic buildings.','Exhibits explore the multicultural character and everyday life of Praga through the centuries.'],
neon:['Neon Museum','Explore Polish graphic design through vintage illuminated signs.','The collection documents the colourful urban neon signs of 20th-century Poland.'],
koneser:['Koneser Praga Centre','Industrial brick architecture, exhibitions, restaurants and cafés.','A revitalised former vodka distillery that now hosts cultural venues and restaurants.'],
national:['National Museum in Warsaw','Major collections of Polish, European and ancient art.','Founded in the 19th century, the museum brings together artworks from antiquity to modern times.'],
wilanowtemple:['Temple of Divine Providence','A monumental contemporary church in Warsaw’s Wilanów district.','A modern expression of a project first conceived as a national thanksgiving following the Constitution of 3 May.'],
pole:['Pole Mokotowskie Park','Spacious green lawns, cycling paths, ponds and places to unwind.','Former aviation and sports grounds became one of Warsaw’s most valued urban parks.'],
krasi:['Krasiński Garden','An elegant park with a palace, pond and reminders of the city’s past.','The Baroque garden gradually evolved into a favourite public park.'],
royalroute:['Krakowskie Przedmieście','A ceremonial section of the Royal Route, lined with palaces and historic churches.','A historic axis of royal Warsaw, linked to court life, public celebrations and education.']
};
const cuisineNames={polska:'Polish',koreańska:'Korean',chińska:'Chinese',tajska:'Thai',japońska:'Japanese',włoska:'Italian',roślinna:'plant-based',indyjska:'Indian',śniadania:'breakfast',kawa:'specialty coffee',koktajle:'cocktails'};
const kindLabel={monument:'monument and memorial',park:'park or green space',museum:'museum',history:'historical site',architecture:'architectural landmark',view:'viewpoint',science:'science attraction',family:'family attraction',hidden:'local hidden gem'};
function properEnglish(name){
 if(special[name])return special[name][0];
 if(name==='Kolumna Zygmunta III Wazy')return 'Sigismund’s Column';
 if(name==='Pomnik Tadeusza Kościuszki')return 'Tadeusz Kościuszko Monument';
 if(name.startsWith('Pomnik '))return name.replace(/^Pomnik /,'Monument to ');
 if(name.startsWith('Muzeum '))return name.replace(/^Muzeum /,'Museum of ');
 if(name.startsWith('Park '))return name.replace(/^Park /,'Park ');
 if(name.startsWith('Ogród '))return name.replace(/^Ogród /,'Garden ');
 if(name.startsWith('Las '))return name.replace(/^Las /,'Forest ');
 return name;
}
function fallback(p){
 const kind=(p.cats||[]).map(c=>kindLabel[c]).find(Boolean)||'interesting place';
 const area=p.district||'Warsaw';
 return ['Explore '+kind+' in '+area+'. '+p.name+' offers a worthwhile stop while discovering the city.','This place is part of the local character of '+area+'. Consider it for a thematic walk or a sightseeing route, and check current access conditions before your visit.'];
}
const placeFields=['name','desc','story','hours','priceText','range','metro'];
const foodFields=['name','description'];
const placeData=window.WARSAW_DB.attractions;
const foodData=window.WARSAW_FOOD?window.WARSAW_FOOD.restaurants:[];
function translateData(next){
 placeData.forEach(p=>{
 if(!p.__originalI18n)p.__originalI18n=Object.fromEntries(placeFields.map(k=>[k,p[k]]));
 const o=p.__originalI18n;
 if(next==='pl'){placeFields.forEach(k=>{p[k]=o[k]});return}
 const sp=special[p.id];const fb=fallback({...p,name:o.name});
 p.name=sp?sp[0]:properEnglish(o.name);p.desc=sp?sp[1]:fb[0];p.story=sp?sp[2]:fb[1];
 p.hours=o.schedule?'Check the current opening times with the venue.':'Outdoor area: check accessibility and seasonal restrictions.';
 p.priceText=p.price===0?'Free entry / outdoor access':p.price===null?'Check admission fees with the organiser':String(p.price)+' PLN (estimated; check current prices)';
 p.range=o.range;p.metro=o.metro? 'See current public transport directions in Maps.':undefined;
 });
 foodData.forEach(r=>{
 if(!r.__originalI18n)r.__originalI18n=Object.fromEntries(foodFields.map(k=>[k,r[k]]));
 if(next==='pl'){foodFields.forEach(k=>{r[k]=r.__originalI18n[k]});return}
 const kind=cuisineNames[r.cuisine]||'local';const serving=r.type==='kawiarnia'?'A welcoming café serving '+kind+'.':r.type==='bar'?'An inviting bar for drinks and a break.':'A '+kind+' food spot to explore in Warsaw.';
 const mood=r.tags?.includes('ostre')?' Spicy dishes are among the options.':'';
 r.description=serving+mood+' Browse current menu, reviews and opening times in Google Maps.';
 });
}
const exact=(s)=>DICT.get(s)||null;
function words(s){
 if(!s||!s.trim())return s;
 let trim=s.trim();if(DICT.has(trim))return s.replace(trim,DICT.get(trim));

 if(trim.includes(' · ')){
  const bits=trim.split(' · ');
  const rebuilt=bits.map(bit=>DICT.get(bit)||words(bit)).join(' · ');
  if(rebuilt!==trim)return s.replace(trim,rebuilt);
 }
 const pref=trim.match(/^([^\p{L}]+)\s+(\p{L}.*)$/u);
 if(pref){const tail=words(pref[2]);if(tail!==pref[2])return s.replace(trim,pref[1]+' '+tail)}
 if(/^\d+\s+miejsc$/.test(trim))return trim.replace('miejsc','places');
 if(/^\d+\s+atrakcji$/.test(trim))return trim.replace('atrakcji','sights');
 if(/^.*:\s+\d+\s+miejsc\s+w bazie\./.test(trim))return 'This district contains curated sightseeing spots. Tap Start here to begin. Some new map pins are approximate.';
 if(trim.startsWith('Całe miasto:'))return 'All of Warsaw: '+String(window.WARSAW_DB.attractions.length)+' places. The route starts at your chosen point and fits the available time.';
 if(trim.includes(' • wizyta '))return trim.replace(' • wizyta ',' • visit ').replace('zobacz cennik','check prices');
 if(trim.startsWith('lin ie WTP'))return 'Find WTP lines, stops and live departures in navigation. The red line is only a schematic connection, not a street-level route.';
 if(trim.startsWith('Podany czas pobytu'))return 'Visit duration is an editorial estimate. Opening hours, prices and approximate pins should be verified before visiting.';
 if(trim.includes('Planer pokazuje szacunkowe czasy'))return 'The planner shows estimated times and distances; use Maps for live connections.';
 if(trim.startsWith('Koszty wejść:'))return trim.replace('Koszty wejść:','Admission costs:');
 if(trim.startsWith('od ')&&trim.includes('zł / osoba'))return trim.replace('od ','from ').replace('zł / osoba','PLN per person');
 if(trim.startsWith('linie WTP,'))return 'Use navigation to check WTP lines, stops and timetables. The red line is schematic, not an actual walking or driving route.';

 if(/^\d+\s+godz\.$/.test(trim))return trim.replace('godz.','hours');
 if(/^\d+\s+godziny$/.test(trim))return trim.replace('godziny','hours');
 if(/^\d+\s+atrakcj(e|a|i)/.test(trim))return trim.replace(/atrakcj(e|a|i)/,'sights').replace('dotknij, aby poznać historię','tap to read their stories');
 if(/^\d+\s+(miejsce|miejsca|miejsc)\s+w Twoim planie/.test(trim))return trim.replace(/(miejsce|miejsca|miejsc)\s+w Twoim planie/,'stops in your itinerary');
 if(/^\d+\s+z\s+\d+\s+pieczątek/.test(trim))return trim.replace(/z\s+/,'of ').replace('pieczątek','stamps');
 if(/^\d+\s+minut/.test(trim))return trim.replace('minut','minutes');
 if(/^\d+(\.\d+)?\s+km$/.test(trim))return trim;
 if(trim.startsWith('✦ Warto odwiedzić:'))return trim.replace('Warto odwiedzić','Worth visiting');
 if(trim.startsWith('✦ Wybór redakcji:'))return trim.replace('Wybór redakcji','Editorial pick');
 if(trim.startsWith('⭐ Google:'))return '⭐ Google: check current reviews in Maps';
 if(trim.startsWith('Budżet:'))return trim.replace('Budżet','Budget').replace('(szacunek)','(estimate)').replace('niedrogo','low budget').replace('umiarkowanie','moderate').replace('wyższy budżet','higher budget');
 if(trim.startsWith('Około '))return trim.replace('Około','About').replace('pieszo','walking').replace('rowerem','cycling').replace('samochodem','driving').replace('transportem miejskim','public transport').replace(/pozostało/,'remaining').replace('zapasu. Wybór dostosowano do godzin otwarcia znanych atrakcji.','spare. Known opening hours were taken into account.');
 if(trim.startsWith('Brak miejsc pasujących'))return 'No matching places for the selected area, categories or opening hours. Try a different time or a larger area.';
 if(trim.startsWith('Brak atrakcji'))return 'No sights match the current area and filters. Increase the radius or change filters.';
 if(trim.startsWith('Wybrano ')&&trim.includes('dzielnic'))return 'Selected district. Choose a start point and explore its sights.';
 if(trim.startsWith('Wybierz dzielnicę'))return 'Choose a district or mark an area on the map.';
 if(trim.startsWith('Dojazd do Starego Miasta'))return 'See directions to Warsaw Old Town in Maps.';
 if(trim.startsWith('📍 Ustawiono start z GPS'))return '📍 GPS starting point set.';
 if(trim.startsWith('🌅 Złote światło'))return trim.replace('🌅 Złote światło ok.','🌅 Approximate golden hour:').replace(' oraz ',' and ');
 if(trim.startsWith('🍽️ Przerwa gastronomiczna'))return trim.replace('Przerwa gastronomiczna','Meal break').replace('rezerwa','reserve');
 if(trim.startsWith('☕ Zapas czasu na przerwę'))return trim.replace('Zapas czasu na przerwę','Time reserved for a break');
 if(trim.startsWith('Przerwa gastronomiczna'))return trim.replace('Przerwa gastronomiczna','Meal break');
 if(trim.startsWith('Teren zewnętrzny'))return 'Outdoor location: please check access and seasonal restrictions.';
 if(trim.startsWith('Sprawdź aktualne'))return 'Check the latest information with the venue.';
 if(trim.startsWith('Zwykle '))return 'Usually free; check current prices.';
 if(trim.startsWith('WTP:'))return trim.replace('orientacyjnie','estimate');
 if(trim.startsWith('Dojazdy i czas przejścia'))return 'Travel and walking time estimates; confirm directions in Maps.';
 if(trim.startsWith('Transport miejski:'))return 'Public transport: use Maps for individual legs, lines and live departures.';
 if(trim.startsWith('✦ Trasa dobrana'))return '✦ Route tailored to you';
 if(trim.startsWith('✦ Mniej znane'))return '✦ Hidden gems';
 if(trim.startsWith('✦ Oszczędna'))return '✦ Budget-friendly route';
 if(trim.startsWith('Brak potwierdzonych'))return 'No confirmed paid entries';
 return s;
}
const originalNodes=new WeakMap();
let observer=null,pending=false,painting=false;
const attrs=['placeholder','aria-label','title'];
function translateNode(n){
 const cur=n.nodeValue;if(!cur||!cur.trim())return;
 let d=originalNodes.get(n);
 if(!d){d={pl:cur,en:null};originalNodes.set(n,d)}
 else if(cur!==d.pl&&cur!==d.en){d.pl=cur;d.en=null}
 if(lang==='pl'){if(n.nodeValue!==d.pl)n.nodeValue=d.pl;return}
 const converted=words(d.pl);d.en=converted;
 if(n.nodeValue!==converted)n.nodeValue=converted;
}
function translateAttrs(el){
 if(el.nodeType!==1||el.hasAttribute('data-i18n-skip'))return;
 for(const a of attrs){
 if(!el.hasAttribute(a))continue;
 const v=el.getAttribute(a);
 if(!el.dataset['i18nOriginal'+a.replace(/[^a-z]/ig,'')])el.dataset['i18nOriginal'+a.replace(/[^a-z]/ig,'')]=v;
 const orig=el.dataset['i18nOriginal'+a.replace(/[^a-z]/ig,'')];
 const translated=lang==='en'?words(orig):orig;
 if(v!==translated)el.setAttribute(a,translated);
 }
}
function repaint(){
 if(painting)return;painting=true;observer?.disconnect();
 const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode(n){
 const p=n.parentElement;if(!p||p.closest('script,style,svg,noscript'))return NodeFilter.FILTER_REJECT;
 return NodeFilter.FILTER_ACCEPT;
 }});
 while(w.nextNode())translateNode(w.currentNode);
 document.querySelectorAll('[placeholder],[aria-label],[title]').forEach(translateAttrs);
 observer?.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:false});
 painting=false;
}
function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;repaint()})}
observer=new MutationObserver(schedule);
function refresh(){
 document.documentElement.lang=lang;
 localStorage.setItem(PREFIX,lang);
 // Przełącznik PL | EN pokazuje oba języki; aktywny jest wyróżniony.
 const sw=$('#langWarsaw');sw.querySelectorAll('[data-lang]').forEach(x=>{x.classList.toggle('on',x.dataset.lang===lang)});
 sw.setAttribute('aria-label',lang==='pl'?'Język: polski. Przełącz na angielski':'Language: English. Switch to Polish');
 // Linki powrotu do Atlasu przekazują język; brak elementu nie może zatrzymać tłumaczenia.
 for(const id of ['#atlasTop','#atlasFloat']){const link=$(id);if(link)link.href='./atlas.html?lang='+lang}
 translateData(lang);
 try{renderAll()}catch(err){console.warn('UI refresh',err)}
 const select=document.querySelector('#waw3FoodSort');if(select)select.dispatchEvent(new Event('change',{bubbles:true}));
 document.title=lang==='en'?'I Was Here — Warsaw City Guide':'I Was Here — Warszawa';
 repaint();
}
$('#langWarsaw').addEventListener('click',e=>{const pick=e.target.closest('[data-lang]')?.dataset.lang;const next=pick||(lang==='pl'?'en':'pl');if(next===lang&&pick)return;lang=next;refresh()});
window.addEventListener('storage',e=>{if(e.key===PREFIX&&['pl','en'].includes(e.newValue)&&e.newValue!==lang){lang=e.newValue;refresh()}});
refresh();
})();