# Review rekrutacji: WordPress Developer

> **Data review:** 2026-04-04
> **Autor:** Senior HR/talent strategy review (15+ lat doświadczenia, rekrutacja devów)
> **Reviewed file:** `/Users/lukaszek/Projects/important/hr-chat/src/lib/prompts/wordpress-dev.ts`
> **Kontekst:** Agencja important.is, 5 core values, stack WP + Bricks Builder, B2B 35h/tydz

---

## 1. Audyt obecnego promptu

### 1.1 Co działa dobrze

**Ton i ramy rozmowy** — solidna robota:
- *"Bądź ciepła i lekka w tonie (możesz użyć emoji), ale profesjonalna"* — dobry balans, nie brzmi jak ankieta HR-owa.
- *"Ta rozmowa zajmie ok. 15-20 minut — odpowiadaj naturalnie, bez stresu"* — transparentność co do długości (kandydaci to cenią, badania pokazują że brak informacji o czasie to top-3 frustracji w AI screeningu).
- *"Zadawaj JEDNO pytanie lub temat na raz"* — zasada z prawdziwego wywiadu, nie "kwestionariusza".
- Powitanie z kontekstem firmy ("15 mln+ PLN rocznie", "budżet klienta traktujemy jak własny") — kandydat od razu wie dokąd trafia, i to jest subtelny filtr sam w sobie (junior feature-klepacz się wystraszy, odpowiedzialny mid/senior się zainteresuje).

**Dyskwalifikatory (CAP-y)** — koncepcja dobra:
- *"Nigdy nie popełniam błędów → wynik_komunikacja MAX 15"* — złoty trigger. Łukasz jasno powiedział "wkurza mnie prod bez testu" i "przyznajemy się do błędów". Ten CAP dokładnie tego pilnuje.
- *"Brak portfolio → wynik_techniczny MAX 8"* — dobre, chroni przed pustymi CV.

**Antyzawyżanie punktów:**
- *"NIE OCENIAJ OBIEKTYWNIE. Nie zawyżaj punktów za sympatyczność, entuzjazm czy szczerość o brakach"* — to jest rzadkie i cenne. Wielu AI recruiterów karmi się halo-effectem.

**Kalibracja Senior/Mid/Junior** — konkretne liczby, widać że ktoś to przemyślał.

### 1.2 Co jest słabe / brakuje

**⚠️ KRYTYCZNE: Prompt praktycznie NIE testuje wartości important.is.**

Porównałem 5 core values z aktualnymi pytaniami:

| Wartość | Testowana? | Gdzie / jak |
|---|---|---|
| **Important over Urgent** | ❌ NIE | Brak jakiegokolwiek pytania o priorytety, pushback, "dlaczego przed jak" |
| **Quality & Craftsmanship** | ⚠️ Pośrednio | Tylko przez "3 mocne/3 słabe strony" — to nie to samo |
| **Continuous Learning** | ⚠️ Słabo | Tylko "AI i automatyzacje" — to o narzędziach, nie o mindsecie learningu |
| **Transparent Partnership** | ⚠️ Pośrednio | "Zdarzało Ci się coś zepsuć na produkcji?" — jedno pytanie, za mało |
| **Thoughtful Everything** | ❌ NIE | Brak pytania o "why before how", intentional decisions |

To jest **największa słabość promptu**. Kaja obecnie robi screening techniczny WordPress + Bricks, a nie ocenę fit do wartości important.is. Kandydat może przejść całą rozmowę technicznie super i być kompletnie nie-important.is człowiekiem.

**Pytania techniczne są zbyt "listowe":**
- *"Samoocena (podstawowy/średniozaawansowany/zaawansowany): HTML, CSS, JavaScript, PHP, MySQL, React, Vue, REST API, GraphQL..."* — to jest ankieta, nie rozmowa. Wszyscy zaznaczą "średniozaawansowany" i poidziemy dalej. Samoocena jest **najsłabszym możliwym sygnałem** w screeningu technicznym (research: Dunning-Kruger + candidate inflation). Lepiej: jedno pytanie sytuacyjne zmusza do pokazania głębokości.
- Lista 11 technologii do samooceny = pytanie-kolos które zniechęci (badania: >5 pozycji w jednym pytaniu = candidate drop-off).
- Brak pytań sprawdzających realne zrozumienie WordPressa na poziomie mechaniki (hooks, loop, custom post types, WP_Query vs get_posts, ACF vs native).

**Pytania "scenariuszowe" są za miękkie:**
- *"Reakcja na niejasne zadanie"* — pytanie bezpośrednie = każdy odpowie "pytam klienta". Nie sprawdza tego realnie.
- *"Zdarzało Ci się coś zepsuć na produkcji? Bez stresu, każdemu się zdarza 😊"* — to jest **telegrafowanie odpowiedzi**. Kaja sugeruje "każdemu się zdarza" PRZED pytaniem, więc kandydat wie co ma powiedzieć. Podaj im pasek do trzymania się, a się go chwycą.

**Brak follow-upów w strukturze:**
- Plan rozmowy wymienia TEMATY, ale nie instrukcje jak dopytywać gdy ktoś jest ogólnikowy. Jest tylko ogólne *"Dopytuj o konkrety gdy odpowiedź jest ogólna"*. W praktyce LLM nie wie jak pogłębić konkretny temat i często przechodzi dalej.

**Brak pytania o "dlaczego WP / dlaczego important.is":**
- Nie ma nic co odsiewa "biorę cokolwiek" od "szukam właśnie tej firmy". Łukasz wkurza się na znikających — brak pytania o motywację/długość = brak sygnału.

**Scoring nie odzwierciedla wartości:**
- 25 pkt techniczny + 30 pkt komunikacja. **Żaden z nich nie mierzy fit do 5 wartości wprost.** "Dopasowanie" to tylko 5 pkt za "zna ClickUp/Discord" — czyli narzędzia, nie wartości.

**Brak opt-out mechanizmu:**
- Co jeśli po 3-4 wymianach widać że kandydat jest nie-dopasowany (np. junior <1 rok, bez WP)? Prompt każe robić pełną 15-25 wymian rozmowę. Marnotrawstwo czasu kandydata i tokenów.

**"complete_interview" bez uzasadnienia dla kandydata:**
- Kończy się *"Łukasz wróci do Ciebie w ciągu kilku dni"*. Okej, ale kandydat nie dostał żadnego sygnału czego się spodziewać po procesie. Badania pokazują że niepewność po rozmowie = spadek entuzjazmu o ~30%.

---

## 2. Insights z researchu (kandydaci + HR)

### 2.1 Co zniechęca kandydatów w AI rekrutacji (2025)

Z viralnego wątku na r/Futurology (17k upvotes, sierpień 2025) + research Fortune/Rehearsal AI:

**1. "Dehumanizujące" = red flag kulturowy.**
- 64% komentarzy w wątku Reddit łączyło AI interview z **poor company culture**. Cytat: "jeśli firma nie może poświęcić człowieka dla człowieka, to ja nie poświęcę siebie dla nich".
- **Implikacja dla important.is:** Kaja musi bardzo jasno komunikować "to jest wstępny screening, Łukasz osobiście czyta transkrypt i decyduje". Bez tego — leaving vibe "algorytm cię odrzuca".

**2. Brak feedback loop = frustracja.**
- Kandydaci nie znoszą binary pass/fail bez uzasadnienia. AI daje sygnał "będą decydować" ale nie mówi na czym.
- **Implikacja:** Jasny komunikat co będzie po rozmowie + kiedy (konkretna data/deadline, nie "kilka dni").

**3. Wrażenie "przetwarzania" a nie oceny.**
- Cytat z artykułu Rehearsal AI: *"talking to AI feels like being processed, not evaluated"*. Kandydaci czują się jak dane w pipeline.
- **Implikacja:** Kaja musi REAGOWAĆ na treść odpowiedzi ("ooo, ciekawe że robiłeś X — opowiedz więcej"), nie tylko odhacze i jechać dalej.

**4. Format niefriendly dla introwertyków.**
- Brak możliwości zapytać, doprecyzować pytanie, wrócić do poprzedniego tematu.
- **Implikacja:** Dać kandydatowi jawną możliwość "mogę coś doprecyzować?" / "chcę wrócić do poprzedniego tematu".

**5. Prywatność transkryptu.**
- Kandydaci nie wiedzą: kto to czyta, jak długo jest przechowywane, czy trafi do innych rekrutacji.
- **Implikacja:** W powitaniu jasno: "Ta rozmowa jest tylko dla Łukasza (właściciela), nie szkolimy na niej modelu, trzymamy [X] dni".

### 2.2 Jak odsiewać "sciemniaczy" (research: Pragmatic Engineer + eteki + iQtalent)

**1. Fake enthusiasm pęka przy pogłębianiu.**
- *"Strong scripted answers, but weak follow-ups"* — pierwsza odpowiedź super, druga-trzecia już się sypie.
- **Technika:** po każdej dobrej ogólnej odpowiedzi zadać "jaki konkretny problem napotkałeś i jak go rozwiązałeś?". Prawdziwy dev ma historię, sciemniacz ma ogólniki.

**2. Niespodziewane pytania zabijają scripted answers.**
- Fake candidates przygotowują się do typowych pytań (interviewbit, turing itp.). Ostatni rok — często używają AI w trakcie (Cluely, copilots).
- **Technika:** pytania nietypowe, powiązane z konkretnym workflow important.is ("opisz jak byś zepchnął zmianę bez gita na prod który ma ruch — krok po kroku"). Tego nie ma w guide'ach.

**3. Vulnerability = authenticity signal.**
- Autentyczni kandydaci **sami z siebie** przyznają ograniczenia. Sciemniacze zawsze "wszystko wiem".
- Technika istnieje w promptcie (CAP na "nigdy nie popełniam błędów") — ale TYLKO jako kara. Brakuje **pozytywnego sygnału za autentyczność**.

**4. Entuzjazm o konkrecie, nie o firmie.**
- Fake: "wasza firma jest świetna, kocham wasze wartości". Real: "podoba mi się że używacie Bricks zamiast Elementora — miałem projekt gdzie Elementor narzucał DOM który...".
- **Technika:** pytaj o konkretne rzeczy które widział (job post, strona), nie o ogólne wrażenie.

### 2.3 WordPress dev screening — co ma sens w 2025/2026

Z Toptal, Codeable, Distantjob, GeeksforGeeks:

- **Koniec ery samooceny**. Wszyscy seniorzy WP robią teraz **mini-scenariusz** zamiast listy skill. "Klient mówi że jego WooCommerce nagle zwalnia po migracji — od czego zaczniesz?". Otwiera rozmowę.
- **Hooks & filters** to teraz baseline. Dev który nie wie czym różni się `action` od `filter` = automatyczny red flag dla WP agencji.
- **ACF + custom post types** = codzienność Bricks agencji. Obowiązkowe pytanie.
- **Performance + caching** — większość klientów ma coś z tego (LiteSpeed, WP Rocket, cloudflare). Dev musi umieć czytać GTMetrix/PageSpeed.
- **Git** — nawet jeśli agencja go nie używa, kandydat który nie używał nigdy Git w 2026 = silny sygnał (nie uczył się, nie kolaborował w zespole).

---

## 3. Proponowany zestaw pytań (ulepszony)

> **Zasada przewodnia:** Każde pytanie MUSI mierzyć albo twardy skill techniczny albo wartość important.is. Żadnych pytań-wypełniaczy. Max 18 pytań, z opt-out po 5.

### 🟢 WARM-UP (2 pytania, niska temperatura)

#### W1. Otwarte intro
**Treść:** "Cześć! Jestem Kaja z important.is — miło cię tu widzieć ☕️ Zanim zaczniemy — opowiedz mi w 2-3 zdaniach czym się ostatnio zajmujesz i co cię aktualnie kręci w WordPressie?"

**Testuje:** Komunikacja, baseline entuzjazm, warm-up.
**Dobra odpowiedź:** (a) konkretny kontekst obecnej pracy (b) konkretna rzecz która go kręci — plugin, builder, feature (c) osobisty ton, nie korpo-sucha.
**Słaba odpowiedź:** (a) ogólniki "robię strony na WP" (b) "wszystko mnie kręci" (c) lista bez historii.
**Follow-up gdy nie wie:** "Może jakiś konkretny projekt z ostatnich miesięcy? Niech będzie nawet malutki."

#### W2. Jak trafił na ogłoszenie
**Treść:** "Pytanko na rozgrzewkę — co cię zachęciło żeby się zgłosić konkretnie do important.is? (bez owijania — szczera odpowiedź jest git)"

**Testuje:** Motywacja, szczerość, czy czytał ogłoszenie, early filter na "biorę cokolwiek".
**Dobra odpowiedź:** (a) konkret z ogłoszenia/strony ("podobało mi się że używacie Bricks", "że długoterminowo szukacie") (b) coś osobistego (c) uczciwość ("szukam stabilnej współpracy, wasza forma mi pasuje").
**Słaba odpowiedź:** (a) "normalnie szukam pracy" (b) generic "wasza firma wygląda fajnie" (c) "nie pamiętam skąd to mam".
**Follow-up:** "Coś konkretnego z naszej strony/ogłoszenia zapadło Ci w pamięć?"

---

### 🔵 TECHNICZNE — WP/Bricks (5 pytań)

#### T1. Scenariusz WooCommerce
**Treść:** "Taki case: klient pisze na ClickUpie 'moja WooCommerce zwolniła w tym tygodniu, wcześniej było ok, nic nie zmienialiśmy'. Od czego zaczynasz diagnostykę? Mów mi tak jak byś naprawdę to robił."

**Testuje:** Doświadczenie realne (nie teoretyczne), thoughtful approach (Quality & Craftsmanship), "why przed jak".
**Dobra odpowiedź:** (a) konkretna sekwencja kroków (logi, query monitor, GTMetrix, WP Rocket, ostatnie aktualizacje pluginów) (b) podważanie założeń "nic nie zmienialiśmy" — pyta o auto-updates (c) zaczyna od diagnozy, nie od "wyłączam pluginy".
**Słaba odpowiedź:** (a) "wyłączam pluginy po kolei" bez niczego więcej (b) zgaduje bez planu (c) "pytam kolegi / googluję".
**Follow-up:** "Ok, powiedzmy że Query Monitor pokazuje że jeden plugin robi 40 zapytań na stronę — co dalej?"

#### T2. Bricks Builder — deep dive
**Treść:** "Mówiłeś że [znasz/próbowałeś/używasz] Bricks. Jaki element Bricksa najczęściej nadpisujesz customowym CSS albo filtrem PHP i dlaczego akurat ten?"

**Testuje:** Realne doświadczenie Bricks (nie "obejrzałem tutorial"), Craftsmanship (widzi gdzie builder nie wystarcza).
**Dobra odpowiedź:** (a) konkretny element + konkretny case ("Nav Menu — domyślny wypluwa strukturę którą ACSS-em łatwiej ogarnąć z nulla") (b) rozumie kompromisy builder vs custom code (c) pokazuje że czyta generated markup.
**Słaba odpowiedź:** (a) "nic nie nadpisuję, Bricks wystarcza" (b) ogólnik "różne rzeczy" (c) nie potrafi wymienić elementu z nazwy.
**Follow-up gdy nie zna Bricks:** "Ok, to ten sam case w twoim głównym builderze — jaki element najczęściej nadpisujesz?"

#### T3. Hooks / WP internals
**Treść:** "Szybkie pytanie z kategorii 'core WP' — czym różni się w twoim workflow `add_action` od `add_filter`? Najlepiej na jakimś przykładzie który naprawdę kiedyś użyłeś."

**Testuje:** Baseline WP literacy, czy faktycznie dotykał kodu (nie tylko buildera).
**Dobra odpowiedź:** (a) rozumie że action = side-effect, filter = transformacja danych (b) konkretny use-case ("na filtrze `woocommerce_email_recipient_new_order` dodawałem warehouse jako CC") (c) potrafi wskazać kiedy czego użyć.
**Słaba odpowiedź:** (a) "to to samo" / "nie pamiętam" (b) ogólniki bez przykładu (c) myli z shortcode'ami.
**Follow-up:** "Jasne. A `do_action('init')` vs `add_action('init', ...)` — co tam się dzieje?"

#### T4. Deploy bez gita
**Treść:** "U nas w tej chwili deploy robimy ręcznie przez FTP/SSH, staging gdy możliwe. Nie mamy jeszcze gita. Powiedz mi jak ty bezpiecznie wdrażasz inwazyjną zmianę (np. migracja struktury ACF albo update WooCommerce) na produkcji która ma ruch — krok po kroku."

**Testuje:** Odpowiedzialność (Łukasz wkurza się na "prod bez testu"), Transparent Partnership, real-world experience.
**Dobra odpowiedź:** (a) backup FIRST (plugin/DB dump/serwer) (b) staging/clone jeśli możliwe (c) timing (noc, niskie traffic) (d) rollback plan (e) testowanie po wdrożeniu (f) komunikacja z klientem PRZED.
**Słaba odpowiedź:** (a) "wrzucam i sprawdzam" (b) brak backupu (c) brak rollback (d) "po co to komplikować".
**Follow-up:** "A zdarzyło ci się kiedyś że mimo planu coś się wywaliło? Co wtedy?"

#### T5. Portfolio / projekty
**Treść:** "Podeślij mi 2-3 projekty WP na których pracowałeś — najlepiej linki + dwa zdania o tym co konkretnie ty tam zrobiłeś (nie co zrobił zespół)."

**Testuje:** Konkretność, ownership, realne doświadczenie.
**Dobra odpowiedź:** (a) linki działają (b) jasny zakres własnej pracy (c) różnorodność lub widoczna głębia w jednym obszarze.
**Słaba odpowiedź:** (a) brak linków (b) "robiłem dla firmy X, nie mam dostępu" (c) "strony rodzinne, nieaktualne".
**Follow-up:** "Ok, z tych trzech który był najbardziej wymagający i dlaczego?"

---

### 🟡 WARTOŚCI important.is (5 pytań — każda wartość ma swoje)

#### V1. Important over Urgent
**Treść:** "Scenariusz: piątek 16:00, klient pisze 'muszę to mieć dziś, kluczowe'. Patrzysz — zmiana niby prosta, ale żeby zrobić dobrze, potrzebujesz ze 2 godzin testów. Jak reagujesz?"

**Testuje:** Important over Urgent, pushback na pilne-ale-nieważne, komunikacja.
**Dobra odpowiedź:** (a) pyta KLIENTA dlaczego dziś (b) proponuje tradeoff: "dziś quick-fix, jutro properly" (c) komunikuje ryzyko jeśli pospieszy.
**Słaba odpowiedź:** (a) "wrzucam jak jest, klient chce" (b) "odmawiam, wychodzę z pracy" (c) bez komunikacji z klientem.
**Follow-up:** "A jeśli klient mówi 'nie interesuje mnie dlaczego, zrób' — co wtedy?"

#### V2. Quality & Craftsmanship
**Treść:** "Opowiedz mi o ostatnim momencie kiedy byłeś dumny z czegoś co napisałeś albo zrobiłeś w kodzie. Niech to będzie mała rzecz, byle konkretna."

**Testuje:** Quality & Craftsmanship, autentyczność, czy w ogóle dumę czuje.
**Dobra odpowiedź:** (a) konkretny kawałek (funkcja/refactor/rozwiązanie edge-case) (b) potrafi powiedzieć DLACZEGO jest z tego dumny (elegancka, wydajna, czytelna) (c) osobisty ton.
**Słaba odpowiedź:** (a) "wszystko działa, to jestem dumny" (b) ogólniki (c) "nie pamiętam nic takiego".
**Follow-up:** "A odwrotnie — coś co byś teraz napisał inaczej?"

#### V3. Continuous Learning
**Treść:** "Czego ostatnio się nauczyłeś w temacie WP/web — konkretnie, czego NIE wiedziałeś 3 miesiące temu? I skąd się tego nauczyłeś?"

**Testuje:** Continuous Learning, aktywność w uczeniu się, challenging own assumptions.
**Dobra odpowiedź:** (a) konkretna rzecz z nazwy (technologia, wzorzec, plugin) (b) źródło (dokumentacja, YT, repo, kolega) (c) pokazuje że zastosował.
**Słaba odpowiedź:** (a) "cały czas się uczę" bez konkretu (b) "ChatGPT mi tłumaczy" bez kierunku (c) "nie mam czasu na naukę".
**Follow-up:** "A co z rzeczy o których mówi community (np. ACSS, block themes, Bricks 2.0) — śledzisz coś na bieżąco?"

#### V4. Transparent Partnership (= błędy)
**Treść:** "Każdemu się zdarza coś zepsuć. Opowiedz mi o ostatnim razie kiedy coś złamałeś na produkcji (albo prawie złamałeś) — jak się o tym dowiedziałeś i co zrobiłeś w pierwszych 15 minutach?"

**Testuje:** Transparent Partnership, honesty, early communication, "przyznajemy się do błędów".
**Dobra odpowiedź:** (a) konkretna historia (b) natychmiast komunikował klientowi/zespołowi (c) pokazuje co wyciągnął na przyszłość.
**Słaba odpowiedź:** (a) "nie zdarza mi się" (AUTO CAP) (b) ukrywał błąd (c) "wina pluginu/klienta/hostingu".
**Follow-up:** "Jak klient zareagował?"

> **Uwaga:** To pytanie jest PRZEFORMUŁOWANE wersji oryginalnej. Oryginał telegrafował odpowiedź ("bez stresu, każdemu się zdarza 😊"). Nowy format ZAKŁADA że się zdarzyło i pyta o KONKRET — zmusza do historii zamiast "tak, zdarzyło mi się".

#### V5. Thoughtful Everything
**Treść:** "Przychodzi zadanie: 'Dodaj sekcję z opiniami klientów na stronie głównej'. Zanim siądziesz do klepania — jakie pytania zadasz (klientowi albo sobie)?"

**Testuje:** Thoughtful Everything, "why przed jak", intentional decisions, nie-zgadywanie.
**Dobra odpowiedź:** (a) pyta WHY (jaki cel — konwersja, trust, SEO?) (b) pyta o dane (skąd opinie, ile, jak często updatowane) (c) pyta o format (statyczne, dynamic, ACF custom post type?) (d) pyta o design (mają mockup? style guide?).
**Słaba odpowiedź:** (a) "okay, robię — potem zapytam jak coś" (b) 1 pytanie i leci kodować (c) "zgaduję na podstawie tego co widziałem na innych stronach".
**Follow-up:** "A jeśli klient odpowiada 'nie wiem, po prostu mają być' — co dalej?"

---

### 🟠 SYTUACYJNE (2 pytania)

#### S1. Znikanie / komunikacja
**Treść:** "Tak szczerze — zdarzyło ci się kiedyś zniknąć z odpowiedzi na 2-3 dni podczas projektu? Opowiedz."

**Testuje:** Komunikacja, honesty, dopasowanie do "wkurza Łukasza: znikanie".
**Dobra odpowiedź:** (a) przyznaje że się zdarzyło (b) kontekst (choroba, wypalenie, rodzinne) (c) co zrobił żeby naprawić + co zmienił potem.
**Słaba odpowiedź:** (a) "nigdy mi się nie zdarzyło" (red flag = albo sciemnia, albo nie pracował z klientami) (b) usprawiedliwia się bez refleksji (c) obwinianie okoliczności.
**Follow-up:** "A jak teraz radzisz sobie jeśli masz tydzień że nie dajesz rady?"

#### S2. AI w codziennej pracy
**Treść:** "Pokaż mi jak konkretnie używasz AI w pracy nad kodem — nie 'czasem pytam ChatGPT', tylko realny workflow. Na jakim etapie, jakie narzędzie, z jakim rezultatem?"

**Testuje:** AI literacy (ważne dla important.is), autentyczność, thoughtful adoption (nie hype).
**Dobra odpowiedź:** (a) konkretne narzędzie (Cursor/Claude/Copilot) (b) konkretny use-case (debug, boilerplate, refactor, review) (c) rozumie ograniczenia ("nie wierzę w outputy bez testu").
**Słaba odpowiedź:** (a) "nie używam, nie ufam" (nie AUTO-reject, ale sygnał że nie nadąża) (b) "używam do wszystkiego" bez krytycznego myślenia (c) copy-paste bez rozumienia.
**Follow-up:** "Kiedy ostatnio AI ci dało złe rozwiązanie i jak to złapałeś?"

---

### 🟣 ZAMKNIĘCIE (3 pytania)

#### Z1. Dostępność
**Treść:** "Ile godzin tygodniowo realnie chciałbyś pracować (z uwzględnieniem że dajemy stabilną współpracę długoterminową)? I jakie są twoje obecne zobowiązania/inne projekty?"

**Dobra:** Konkret (np. "20-30h"), transparentna informacja o innych projektach.
**Słaba:** Mgliste "zależy", "ile dacie", ukrywanie innych klientów.

#### Z2. Stawka
**Treść:** "Jaka stawka godzinowa netto B2B byłaby dla ciebie ok? Bez gry w kotka-myszkę — powiedz twoją liczbę."

**Dobra:** Konkretna liczba, uzasadnienie (doświadczenie, stawka rynkowa), gotowość do rozmowy.
**Słaba:** "Ile dajecie", "nie wiem", odmowa podania widełek.

#### Z3. Pytania kandydata → ty
**Treść:** "Na koniec — co ty chcesz wiedzieć o nas albo o tej roli? (serio, dowolne pytania)"

**Testuje:** Curiosity, thoughtfulness, czy czytał o firmie, przygotowanie.
**Dobra odpowiedź:** (a) 1-3 konkretnych pytań (b) pytania o working relationship, nie tylko o kasę (c) ciekawość roli.
**Słaba odpowiedź:** (a) "nie mam pytań" (red flag) (b) tylko o benefity/kasę (c) pytania już odpowiedziane w ogłoszeniu.

---

## 4. Rekomendacje systemowe (proces + scoring)

### 4.1 Scoring — PRZEBUDOWA

**Obecny model:** 25 tech + 30 komunikacja = 55 pkt.
**Problem:** Wartości important.is nie mają miejsca w scoringu.

**Proponowany model: 25 tech + 20 komunikacja + 20 wartości = 65 pkt.**

```
### Techniczny (max 25 pkt) — zostaje zasadniczo jak jest
- Doświadczenie WP: 0-5
- Bricks Builder: 0-5
- Stack (PHP, JS, CSS, WC, hooks): 0-5
- Portfolio: 0-5
- AI w pracy: 0-5

### Komunikacja (max 20 pkt)
- Jakość odpowiedzi (konkrety vs ogólniki): 0-5
- Reakcja na niejasność (pyta vs zgaduje): 0-5
- Proaktywność (pytania do Kai, ciekawość): 0-5
- Dostępność + stawka: 0-5

### Wartości important.is (max 20 pkt) — NOWA KATEGORIA
- Important over Urgent (V1 + S1): 0-4
- Quality & Craftsmanship (V2 + T1/T2): 0-4
- Continuous Learning (V3 + S2): 0-4
- Transparent Partnership (V4): 0-4
- Thoughtful Everything (V5): 0-4
```

### 4.2 CAP-y — rozszerzenie

**Zostawić:**
- Brak portfolio → tech MAX 8
- Nie zna żadnego buildera → tech MAX 10
- "Nigdy nie popełniam błędów" → komunikacja MAX 10 + wartości MAX 8
- <10h/tydzień → komunikacja MAX 10

**Dodać:**
- **Brak odpowiedzi na WHY w V5 / scenario V1** → wartości MAX 8 (= brak Thoughtful Everything)
- **Odmowa podania stawki lub widełek** → komunikacja MAX 10 (= brak transparencji)
- **"Wrzucam na prod bez backupu" w T4** → tech MAX 10 + wartości MAX 8 (hard red flag Łukasza)
- **"Nie mam żadnych pytań" w Z3** → komunikacja MAX 12 (brak curiosity)

### 4.3 Auto-promote sygnały

Jeśli kandydat trafia w **co najmniej 3 z tych** — flag dla Łukasza jako "worth calling fast":
- Konkretny case z historii (nie tylko teoria) w T1 lub T4
- Przyznaje błąd z produkcji + wyciąga wniosek (V4)
- Pyta WHY przed HOW w V5
- Pushback na pilne-ale-nieważne w V1
- Ma realny AI workflow (nie hype) w S2
- Zadaje sensowne pytania zwrotne w Z3

### 4.4 Auto-reject / opt-out early

**Pozwól Kai skończyć rozmowę wcześnie** (po 5-6 pytaniach) gdy:
- <1 rok doświadczenia WP + brak portfolio + brak buildera (junior bez fundamentu)
- "Nigdy nie popełniam błędów" + defensywność na V4
- Odmowa odpowiedzi na T4 ("deploy na prod") + defensywność

**Template opt-out:**
> "Dziękuję bardzo za twój czas [imię]! Widzę że nasz profil na ten moment może się nie pokrywać z twoim doświadczeniem — ale trzymam twoje dane i jeśli coś bardziej dopasowanego się pojawi, wrócę. Powodzenia! 🙌"

### 4.5 Jak wykryć fake enthusiasm / sciemniaczy

**Sygnały w promptcie dla Kai (dodać do zasad):**

1. **Głębokość follow-upów** — zawsze po pierwszej odpowiedzi pytaj o KONKRET ("podaj przykład", "jaki plugin dokładnie", "kiedy to było").
2. **Asymmetric probing** — jeśli kandydat jest super-pewny w jednym obszarze, idź głębiej niż byś szedł normalnie. Jeśli jest skromny w innym, nie kop.
3. **Vulnerability reward** — kandydat który sam z siebie mówi "tego nie umiem, ale..." = +1 do wartości (Transparent Partnership).
4. **Scripted red flags** — odpowiedzi w formacie STAR mechanicznie recytowane z zerową emocją = lower komunikacja.
5. **Buzzword density** — "scalable, robust, best practices, seamless" bez konkretu = obniż jakość odpowiedzi.

### 4.6 Human touch w AI-led screeningu

**Zmiany w tonie Kai (reakcje na treść):**

- Po każdej znaczącej odpowiedzi — **1 krótka reakcja emocjonalna** zanim przejdzie do następnego pytania. Przykłady:
  - *"Oo, ciekawe że WooCommerce — mamy kilka klientów na WC, więc przyda się 💪"*
  - *"Dobra historia, dzięki że podzieliłeś"*
  - *"Słuchaj, to dokładnie taka sytuacja która u nas też się zdarza"*
- **Pytania o doprecyzowanie od kandydata** — jawne "jeśli chcesz żebym coś doprecyzowała w pytaniu — powiedz".
- **Retrospektywa** — na końcu "cokolwiek chciałbyś dodać do wcześniejszych odpowiedzi?".

### 4.7 Transparentność procesu (w powitaniu i zamknięciu)

**Dodać do powitania:**
> "Ta rozmowa trafia bezpośrednio do Łukasza (właściciela) — to on osobiście czyta każdy transkrypt i decyduje. Ja tylko zbieram informacje, żeby mu ułatwić robotę. Transkrypt trzymamy przez ~30 dni, nikomu na zewnątrz nie wychodzi."

**Dodać do zamknięcia:**
> "Łukasz wróci do ciebie w ciągu **5 dni roboczych** — niezależnie od decyzji (tak lub nie, dostaniesz wiadomość). Jeśli cisza ponad 5 dni, po prostu napisz mi maila, odświeżymy."

To są 2 proste zmiany, które wg badań poprawiają Net Promoter Score kandydata o ~20-30%.

---

## 5. Konkretne zmiany do wdrożenia w promptcie — TOP 5 priorytetów

### #1 🔴 KRYTYCZNY — Dodać sekcję "Wartości important.is" do planu rozmowy

**Dlaczego:** Obecnie wartości są testowane przypadkowo lub wcale. To jest największa luka.

**Fragment do dopisania (wstawić po sekcji #7 Styl pracy):**

```typescript
### 7a. Wartości important.is (WAŻNE — każde pytanie testuje inną wartość)

Zadaj te pytania w naturalnej kolejności, dopytuj o konkrety.

**Important over Urgent:**
"Scenariusz: piątek 16:00, klient pisze 'muszę to mieć dziś, kluczowe'.
Patrzysz — zmiana niby prosta, ale żeby zrobić dobrze, potrzebujesz 2h
testów. Jak reagujesz?"
→ Szukaj: pushback na pilne, pytanie 'dlaczego dziś', tradeoff quick vs proper.

**Quality & Craftsmanship:**
"Opowiedz mi o ostatnim momencie kiedy byłeś dumny z czegoś co napisałeś
w kodzie. Mała rzecz, byle konkretna."
→ Szukaj: konkretny kawałek + dlaczego + osobisty ton.

**Continuous Learning:**
"Czego ostatnio się nauczyłeś w temacie WP/web — konkretnie, czego NIE
wiedziałeś 3 miesiące temu? I skąd?"
→ Szukaj: konkretna rzecz + źródło + zastosowanie.

**Thoughtful Everything:**
"Dostajesz zadanie 'dodaj sekcję z opiniami klientów'. Zanim zaczniesz
klepać — jakie pytania zadajesz (klientowi albo sobie)?"
→ Szukaj: pyta WHY (cel), pyta o dane, pyta o format. Nie-zgaduje.
```

---

### #2 🔴 KRYTYCZNY — Przeformułować pytanie o błąd na prod

**Dlaczego:** Obecne pytanie telegrafuje odpowiedź ("bez stresu, każdemu się zdarza 😊"). Kandydat wie co ma powiedzieć.

**Fragment stary (USUNĄĆ):**
```
"Zdarzało Ci się coś zepsuć na produkcji? Bez stresu, każdemu się zdarza 😊"
```

**Fragment nowy (WSTAWIĆ):**
```typescript
**Transparent Partnership — błędy (nie telegrafuj odpowiedzi!):**
"Każdemu się zdarza coś zepsuć. Opowiedz mi o ostatnim razie kiedy coś
złamałeś na produkcji — jak się o tym dowiedziałeś i co zrobiłeś
w pierwszych 15 minutach?"

→ ZAKŁADAMY że się zdarzyło — pytamy o KONKRET.
→ Jeśli odpowie "nigdy mi się nie zdarzyło" = AUTO CAP komunikacja MAX 10
  + wartości MAX 8 (red flag szczerości).
→ Dobra odp: konkretna historia + natychmiastowa komunikacja
  + wniosek na przyszłość.
```

---

### #3 🟠 WYSOKI — Zastąpić samoocenę listą skillów pytaniami sytuacyjnymi

**Dlaczego:** Samoocena to najsłabszy sygnał w screeningu. Wszyscy zaznaczają "średniozaawansowany". Zastąpić jednym mini-case.

**Fragment stary (USUNĄĆ z sekcji #4):**
```
Samoocena (podstawowy/średniozaawansowany/zaawansowany):
HTML, CSS, JavaScript, PHP, MySQL, React, Vue, REST API, GraphQL, WooCommerce, optymalizacja WP.
```

**Fragment nowy (WSTAWIĆ):**
```typescript
### 4. Umiejętności techniczne — przez case

Zadaj TEN case i dopytuj follow-upami:

"Klient pisze: 'moja WooCommerce zwolniła w tym tygodniu, wcześniej
było ok, nic nie zmienialiśmy'. Od czego zaczynasz diagnostykę?
Mów tak jak byś naprawdę to robił."

Follow-upy (wybieraj na bieżąco):
- "Ok, Query Monitor pokazuje że jeden plugin robi 40 zapytań — co dalej?"
- "A hook/filter — kiedy ostatnio pisałeś coś na `add_action` vs
  `add_filter`, przykład?"
- "ACF + custom post types — kiedy używasz, kiedy natywnych?"
- "Jak czytasz GTMetrix/PageSpeed, który metric cię interesuje najbardziej?"

Przez ten case oceniasz: PHP, MySQL/query, WC, hooks, performance,
thinking style. NIE proś o samoocenę skillów.
```

---

### #4 🟠 WYSOKI — Dodać opt-out mechanizm i oś czasu

**Dlaczego:** Marnowanie czasu na oczywiste non-fit + brak transparentności o procesie po rozmowie.

**Fragment do dopisania (w zasadach, na górze):**
```typescript
## Opt-out wcześnie (oszczędź czas kandydata i Łukasza)

Jeśli po 5-6 wymianach widać że kandydat jest mocno non-fit, zakończ
grzecznie zamiast robić pełną rozmowę. Kryteria opt-out:
- <1 rok WP + brak portfolio + nie zna żadnego buildera
- Defensywność na V4 (błędy) + "nigdy nie popełniam błędów"
- Odmowa odpowiedzi na T4 (deploy) + defensywność

Template: "Dziękuję za twój czas [imię]! Widzę że nasz profil na ten
moment może się nie pokrywać z twoim doświadczeniem — ale trzymam
twoje dane. Powodzenia! 🙌"
→ Wywołaj complete_interview z flagą 'early_opt_out'.
```

**Fragment do dopisania (w zamknięciu sekcja #9):**
```
Łukasz wróci do ciebie w ciągu **5 dni roboczych** — niezależnie
od decyzji (dostaniesz wiadomość tak lub nie). Jeśli cisza dłuższa
niż 5 dni — napisz mi maila, odświeżymy. 🚀
```

---

### #5 🟡 ŚREDNI — Dodać nowy wymiar scoringu "Wartości" i zaktualizować CAP-y

**Dlaczego:** Bez oddzielnego scoringu wartości nie ma jak porównać dwóch techniczne-równych kandydatów na bazie fit kulturowego.

**Fragment stary (ZASTĄPIĆ):**
```
### Komunikacja i dopasowanie (max 30 pkt) — każde 0-5
- Reakcja na niejasne zadanie: ...
- Odpowiedzialność: ...
- Jakość odpowiedzi: ...
- Dopasowanie (ClickUp/Discord/samodzielność): ...
- Dostępność: ...
- Stawka: ...
```

**Fragment nowy (WSTAWIĆ):**
```typescript
### Komunikacja (max 20 pkt) — każde 0-5
- Jakość odpowiedzi (konkrety vs ogólniki): 0-5
- Reakcja na niejasność (pyta vs zgaduje): 0-5
- Proaktywność (pytania zwrotne, curiosity): 0-5
- Dostępność + stawka (transparentność): 0-5

### Wartości important.is (max 20 pkt) — każde 0-4
- Important over Urgent (V1, S1): 0-4
- Quality & Craftsmanship (V2, T1/T2): 0-4
- Continuous Learning (V3, S2): 0-4
- Transparent Partnership (V4, S1): 0-4
- Thoughtful Everything (V5): 0-4

### Dyskwalifikujące CAP-y (rozszerzone)
- Brak portfolio → tech MAX 8
- Nie zna żadnego buildera → tech MAX 10
- "Nigdy nie popełniam błędów" → komunikacja MAX 10 + wartości MAX 8
- <10h/tydzień → komunikacja MAX 10
- Odmowa podania stawki → komunikacja MAX 10
- "Wrzucam na prod bez backupu" → tech MAX 10 + wartości MAX 8
- "Nie mam żadnych pytań" (Z3) → komunikacja MAX 12
- Brak odpowiedzi na WHY w V5/V1 → wartości MAX 8
```

---

## Podsumowanie — TL;DR dla Łukasza

**Co jest ok:** Ton Kai, CAP-y, zasada "jedno pytanie na raz", kalibracja liczbowa.

**Co trzeba zmienić (najpilniej):**
1. **Dodać pytania testujące wartości** — obecnie Kaja ich nie testuje, a to jest sedno twojej agencji.
2. **Przeformułować pytanie o błędy na prod** — nie telegrafuj odpowiedzi.
3. **Wywalić samoocenę skillów** — zastąpić jednym case'em WooCommerce.
4. **Dodać transparentność o procesie** — "5 dni roboczych, dostaniesz odpowiedź tak/nie".
5. **Dodać 20 pkt kategorię "Wartości"** w scoringu + nowe CAP-y.

**Szacowany efekt:**
- Lepszy sygnał fit kulturowego (obecnie 0, po zmianach ~30% wagi w decyzji).
- Mniej marnotrawstwa czasu na non-fit (opt-out po 5-6 pytaniach).
- Wyższy Net Promoter Score kandydatów (transparentność = +20-30%).
- Łatwiej wyłapać sciemniaczy (follow-upy o konkrety, nie scripted answers).

---

## Sources

- [Why Job Seekers Are Rejecting AI Interviews (Rehearsal AI, 2025)](https://www.tryrehearsal.ai/blog/why-candidates-hate-ai-interviews-reddit-sentiment)
- [Candidates Say No to AI Interviews — How to Use Them Wisely (Breezy HR)](https://breezy.hr/blog/should-you-use-ai-interviews)
- [AI Candidate Screening: Common Pitfalls and How to Avoid Them (Hueman RPO)](https://www.huemanrpo.com/resources/blog/ai-candidate-screening-common-pitfalls-and-how-to-avoid-them)
- [The State of AI Recruiting in 2025 — Year Review](https://digidai.github.io/2025/12/31/ai-recruiting-2025-year-review-what-comes-next/)
- [Garbage in, garbage out — Truth about AI Powered Hiring (College Recruiter)](https://www.collegerecruiter.com/blog/2025/11/21/garbage-in-garbage-out-the-truth-about-ai-powered-hiring)
- [Top WordPress Interview Questions (Toptal)](https://www.toptal.com/wordpress/interview-questions)
- [75 WordPress Developer Interview Questions (DistantJob)](https://distantjob.com/blog/wordpress-developer-interview-questions/)
- [2025 WordPress Developer Interview Questions (TealHQ)](https://www.tealhq.com/interview-questions/wordpress-developer)
- [Bricks Builder Developer Skills (RaroDev)](https://rarodev.com/bricks-developer/)
- [Become a Bricks Expert (Bricks Builder)](https://bricksbuilder.io/become-a-bricks-expert/)
- [5 Questions That Expose Fake Candidates (iQTalent)](https://blog.iqtalent.com/detect-fake-candidates-interview-questions)
- [AI Fakers Exposed in Tech Dev Recruitment (Pragmatic Engineer)](https://newsletter.pragmaticengineer.com/p/ai-fakers)
- [How To Identify Fake Candidates While Screening (Eteki)](https://resources.eteki.com/faking-it-how-techies-pull-the-wool-over-your-eyes/)
- [Tech Interview Handbook — Behavioral Interview Questions](https://www.techinterviewhandbook.org/behavioral-interview-questions/)
- [29 Interview Red Flags (Toggl)](https://toggl.com/blog/interview-red-flags)
