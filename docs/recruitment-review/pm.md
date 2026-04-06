# Review rekrutacji: Project Manager

**Autor:** Senior HR/Talent Strategist Review
**Data:** 2026-04-04
**Kontekst:** Agencja important.is, stanowisko PM (B2B, WordPress + Bricks Builder, ClickUp)
**Plik źródłowy:** `/Users/lukaszek/Projects/important/hr-chat/src/lib/prompts/pm.ts`

---

## 1. Audyt obecnego promptu

### 1.1 Co działa dobrze

**Mocne strony obecnego promptu:**

1. **Struktura i oszczędność czasu kandydata** — 15 minut to realny budżet. Większość kandydatów B2B ma niski próg tolerancji na długie formularze. Cytat z promptu: *"Ta rozmowa zajmie ok. 15 minut. Zaczynamy?"* — to dobry setup oczekiwań.

2. **Ton Kai jest dobrze zdefiniowany** — *"ciepła ale profesjonalna"*, *"luźny, bez stresu"*, emoji w powitaniu. To obniża stres screeningowy.

3. **Kalibracja seniority jest jawna i ilościowa** (linie 86-90) — dobry sygnał że system jest świadomie tuningowany:
   > "Senior 5+ lat, 5+ projektów równolegle, ClickUp expert, B2+ angielski → 20-25 tech"

4. **CAP-y przeciwko zawyżaniu** (linie 81-84) — świetny mechanizm obronny przed overscoringiem kandydata za sympatyczność:
   > "Brak przykładów z życia w komunikacji z klientem → wynik_komunikacja MAX 18"

5. **Scenariuszowe mini-pytania** w sekcji 4 i 5 (*"Klient zmienia zakres w trakcie projektu — jak reagujesz?"*) — to krok we właściwym kierunku.

6. **Warning przed zawyżaniem** (linia 64) — *"Junior bez doświadczenia PM = 8-14 tech, niezależnie od charyzmy"* — to bardzo ważny anchor przeciwko halo-effectowi.

### 1.2 Co jest słabe / brakuje

**Krytyczne luki:**

#### A. Pytania są płaskie, nie diagnostyczne

Obecny prompt zadaje pytania jak *"Ile lat w roli PM?"*, *"Ile projektów równolegle?"*, *"Jakich narzędzi używasz?"*. To są pytania które **każdy kłamca ogarnie w 3 sekundy**. Nie odróżnisz "paper PM" od realnego PM-a pytaniem "znasz ClickUp?".

Brak **obowiązkowych follow-upów na konkrety** (nazwa projektu, branża klienta, wielkość budżetu, liczba devów, co poszło nie tak). Bez tego wynik jest oparty na deklaracjach.

#### B. Wartości important.is są NIEOBECNE w pytaniach

Zero pytań testujących core values agencji:

| Wartość | Czy testowana? | Komentarz |
|---------|---------------|-----------|
| Important over Urgent | ❌ NIE | Brak pytania o pushback na "pilne" klienta |
| Quality & Craftsmanship | ⚠️ POŚREDNIO | Tylko przez WP tech knowledge |
| Continuous Learning | ❌ NIE | Brak pytania o ostatnio nauczoną rzecz |
| Transparent Partnership | ⚠️ POŚREDNIO | Scope creep dotyka tego, ale bez głębi |
| Thoughtful Everything | ❌ NIE | Brak testu na meetings/komunikację z agendą |

To jest **największy gap**. Rekrutujesz na 5-wartościową kulturę, a pytasz tylko o narzędzia.

#### C. Brak pytań "anty-toxic PM"

Obecny prompt nie wykrywa:
- **Micromanagementu** ("jak kontrolujesz czy dev faktycznie pracuje?")
- **Blame culture** ("kto był winny ostatniej wtopy?")
- **Overpromising** ("obiecałeś coś klientowi czego nie dowiozłeś?")
- **Znikania** (Łukasz to wyraźnie zaznaczył jako dealbreaker — brak pytania o komunikację gdy sam masz problem)

#### D. Sekcja "Reakcja na scope creep" ma zły scoring

Linia 76:
> "gaszę pożar"=0-1, change request=3-4, CR + dokumentacja=5

To jest **za płytkie**. "CR + dokumentacja" może dać każdy kto przeczytał artykuł o scope creep. Brak rozróżnienia: czy PM **edukuje klienta zawczasu** (proaktywnie ustala expectations w kickoff), czy tylko reaguje post-factum. Ten aspekt jest krytyczny dla kultury important.is.

#### E. Brak testu komunikacji pisemnej

PM w important.is żyje na Discord + ClickUp + mailach. Prompt nie testuje jakości komunikacji pisemnej (TLDR, struktura wiadomości, agenda spotkań — Thoughtful Everything).

#### F. Pytanie o AI jest słabe

Linia 51-52:
> - Używasz AI w pracy? (do czego?)
> - Automatyzacje? (n8n, Zapier, Make?)

To pytanie "na czuja". Nie diagnozuje **jak** używa AI. PM który mówi "używam ChatGPT do pisania maili" to coś innego niż PM który mówi "zautomatyzowałem status reporty przez n8n + Claude". Brak konkretnego follow-upu.

#### G. Stawka i dostępność na końcu — dobrze, ale brak context

Sekcja 8 nie pyta o **dlaczego szuka nowej pracy** i **ile ma już klientów na B2B**. To kluczowe dla PM-a na B2B elastyczne godziny — 30h tygodniowo deklaratywnie to często 10h realnie gdy ma 4 innych klientów.

#### H. Zero pytań o porażki

Żadne pytanie nie pyta: *"Opowiedz o projekcie który się wysypał. Co zrobiłeś?"*. To jest **najlepsze pytanie przesiewowe PM-ów** (źródła w researchu) — ludzie którzy mówią "wszystko było ok" to albo kłamcy, albo junior, albo toxic (blame external).

### 1.3 Wniosek ogólny

Obecny prompt **przesiewa na podstawowe criteria** (lata, narzędzia, języki), ale **nie dopasowuje do kultury** i **nie wykrywa "paper PM"**. Dobra kandydatka z agencji korporacyjnej, gadatliwa i sympatyczna, z 5 lat Jiry w CV, dostanie wysoki score — mimo że w praktyce nie poradzi sobie z chaotycznym klientem WordPressowym i devem który robi sobie żarty na Discord.

---

## 2. Insights z researchu

### 2.1 Kluczowe wnioski (agencja + AI screening)

**Insight 1: PM z agencji ≠ PM z korpo.** PM w agencji musi mieć **commercial sense** (rozumie że projekt kosztuje, change order to pieniądze, retainer to relacja) + **client-facing skills** (potrafi powiedzieć "nie" klientowi). W korpo PM może być "administratorem Jiry". [Sakas & Company](https://sakasandcompany.com/pm-interview-questions/) podkreśla: *"there are plenty of organized people but not all have strong client skills"*.

**Insight 2: Najlepsze pytanie screeningowe to "In the past, have your projects come in on time and on budget?"** Kandydat który mówi "zawsze" to **red flag** (brak samoświadomości albo kłamie). Kandydat który mówi "większość tak, ale miałem projekty które poszły o 30% nad budżet bo..." — to realny PM. [Sam Barnes](https://thesambarnes.com/leadership/questions-to-ask-digital-project-manager-candidates/)

**Insight 3: Scope creep — odróżniaj "reaguje" od "zapobiega".** Najlepsi PM-owie **edukują klienta ZAWCZASU** (kickoff meeting z jasnym scope, change request process pokazany na starcie). Gorsi tylko gaszą pożary gdy scope creep już nastąpił.

**Insight 4: "Paper PM" vs real PM — differentiator to KONKRETY.** Prawdziwi PM-owie mówią nazwiskami (imię dewa), liczbami (budżet 45k, 3 tygodnie delay), konkretami (klient chciał X, ja zaproponowałem Y). Paper PM mówi ogólnikami: "komunikowałem się z zespołem", "pilnowałem terminów".

**Insight 5: AI chatbot screening — candidate experience matters.** Z researchu:
- 52% kandydatów odrzuci dobrą ofertę jeśli proces był "painful" ([BCG survey via HeroHunt](https://www.herohunt.ai/blog/ai-driven-candidate-screening-the-2025-in-depth-guide/))
- Dehumanizacja (czucie się "data point") to #1 żal wobec AI screeningu
- Ale: personalizacja + możliwość zadawania pytań przez kandydata = NPS rośnie

### 2.2 Co zniechęca dobrych PM-ów w rekrutacji

Na podstawie researchu + doświadczenia:

1. **Długie formularze przed rozmową** — 15 min Kai to dobry limit. Nie przedłużać.
2. **Pytania szkolne** ("wymień 3 metodologie PM") — senior PM to obraża.
3. **Brak reciprocity** — kandydat nie może zadać pytań. Dodaj slot "masz do mnie pytania?"
4. **Brak transparentności o stawce/widełkach** — seniorzy mają ograniczony czas, nie chcą grać w "zgadnij ile płacimy".
5. **Generic pytania** ("opowiedz o sobie") bez follow-upu — nudzi.

### 2.3 Jak odróżnić realnego PM od "klikacza w ClickUp"

| Sygnał | Paper PM / Klikacz | Realny PM |
|--------|-------------------|-----------|
| **Opisuje projekt** | "Prowadziłem projekt web dla klienta z branży X" | "Prowadziłem redesign sklepu Maczek, 8 tygodni, 3 devów, budżet 65k, slipnął o 2 tyg bo klient zmienił brand w 4. tygodniu" |
| **Opisuje delay** | "Czasem były opóźnienia" | "Dev zachorował na 5 dni, ja natychmiast zadzwoniłem do klienta, przesunęliśmy deadline o 1 tydz, bez renegocjacji ceny bo to nasz risk" |
| **Opisuje konflikt** | "Rozwiązałem konflikt" | "Grafik twierdził że brief jest słaby, account że brief jest ok — ja zrobiłem 15-min call, okazało się że grafik nie dostał brand book, wysłaliśmy, dalej poszło" |
| **Opisuje narzędzia** | "Używam ClickUp do tasków" | "W ClickUp mam Space per klient, custom statuses: Review/Client Review/Ready, automacje które pingują mnie gdy task > 3 dni w Review" |
| **Opisuje porażkę** | "Wszystko szło dobrze" / "Winny był dev" | "Obiecałem klientowi że zdążymy na Black Friday, nie zdążyliśmy. Mój błąd — nie zbudowałem bufora. Od tamtej pory zawsze daję +20% bufor." |
| **Opisuje klienta trudnego** | "Klient był trudny" (i koniec) | "Klient dzwonił 3x dziennie, odpowiadał na taski po 4 dniach. Umówiłem regularny call co wtorek 10:00, jako jedyny kanał pytań 'nie-pilnych', i to zadziałało" |

**Złota zasada researchu:** PM który nie potrafi wymyślić **konkretnych** przykładów w 10 sekund to PM który ich nie ma.

---

## 3. Proponowany zestaw pytań (ulepszony)

### Format dla każdego pytania
- **Pytanie** (treść dla Kai)
- **Co testuje**
- **Dobre sygnały** / **Złe sygnały**
- **Follow-up obowiązkowy**

---

### WARM-UP (2 pytania)

#### W1. "Cześć! Jestem Kaja z important.is — fajnie, że tu trafiłeś/aś! ☕️ Szukamy kogoś, kto będzie mostem między klientem a zespołem dev/design na projektach WordPress. Rozmowa zajmie około 15 min. Zacznijmy od podstaw — podaj imię, miasto i adres email 😊"

#### W2. "Opowiedz mi w 2-3 zdaniach co teraz robisz zawodowo — nad czym pracujesz, jak wyglądają twoje typowe dni?"
- **Co testuje:** ownership, świeżość doświadczenia (czy aktywnie pracuje jako PM czy "był kiedyś")
- **Dobre sygnały:** konkretna rola, konkretni klienci/projekty, energia
- **Złe sygnały:** "szukam czegoś nowego bo poprzednia firma była toxic" (bez konkretów), ogólniki typu "zarządzam projektami"
- **Follow-up:** (jeśli ogólnikowo) "Jaki jest twój aktualny największy projekt? Nad czym pracowałeś w tym tygodniu?"

---

### DOŚWIADCZENIE PM — REALNE PROJEKTY, OWNERSHIP (4 pytania)

#### D1. "Opisz mi dokładnie ostatni projekt który prowadziłeś od początku do końca. Chcę konkrety: jaki klient, jaki budżet, ile osób w zespole, ile trwał, i co dokładnie było twoją odpowiedzialnością."
- **Co testuje:** realne doświadczenie, ownership, scope responsibility, commercial sense
- **Dobre sygnały:** nazwa klienta/branża, liczby (budżet, tygodnie, devów), jasny opis własnej roli ("ja negocjowałem zakres", "ja pisałem brief")
- **Złe sygnały:** ogólniki, brak liczb, brak jasności kto co robił, "koordynowałem" bez dalszych szczegółów
- **Follow-up OBOWIĄZKOWY:** "Czy ten projekt zmieścił się w budżecie i terminie? Jeśli nie — dlaczego i co zrobiłeś?"

#### D2. "Ile projektów równolegle prowadzisz teraz i jak to się zmieniało w twojej karierze?"
- **Co testuje:** realna pojemność, historia wzrostu
- **Dobre sygnały:** konkretna liczba + komentarz ("3 aktywne + 2 w retainerze, kiedyś robiłem 8 ale to był koszmar")
- **Złe sygnały:** "10-15" bez kwalifikacji, albo "1-2" przy deklaracji 5 lat doświadczenia
- **Follow-up:** "Co robisz gdy dostajesz 6-ty projekt a masz już pełne ręce?"

#### D3. "Opowiedz o projekcie który się NIE udał — poszedł nad budżet, czas, albo klient był niezadowolony. Co się stało i co zrobiłeś?"
- **Co testuje:** samoświadomość, learning, transparentność (wartość important.is!), brak blame culture
- **Dobre sygnały:** bierze część winy na siebie, opisuje co się nauczył, konkretny wniosek wdrożony w kolejnych projektach
- **Złe sygnały:**
  - "Nie miałem takich projektów" → **czerwona flaga** (brak samoświadomości LUB kłamie)
  - "Winny był dev/klient/grafik" bez autorefleksji → **czerwona flaga (blame culture)**
  - ogólniki bez konkretów
- **Follow-up OBOWIĄZKOWY:** "Co zmieniłeś po tym doświadczeniu w sposobie w jaki prowadzisz projekty?"

#### D4. "Jakich narzędzi używasz do zarządzania i dlaczego właśnie tych? Pokaż mi jak masz skonfigurowany swój główny tool."
- **Co testuje:** głębokość znajomości narzędzi (ClickUp kluczowy), opinia (seniority sygnał)
- **Dobre sygnały:** konkretna konfiguracja (custom fields, automacje, widoki, statusy), opinia ("ClickUp tak bo X, Asana odpadła bo Y")
- **Złe sygnały:** "używam bo tak zastałem", wymienia narzędzia bez rozwinięcia
- **Follow-up:** "Czy kiedyś wdrażałeś nowy tool w zespole? Jak?"

---

### KOMUNIKACJA Z KLIENTEM (4 pytania scenariuszowe)

#### K1. "Scenariusz: klient dzwoni w piątek o 17:00 i mówi 'potrzebuję zmiany X na poniedziałek rano'. Zmiana jest realna technicznie ale wymaga przepisania scope'u i zaangażowania dewa na weekend. Co robisz konkretnie? Opisz krok po kroku."
- **Co testuje:** Important over Urgent, pushback skills, Transparent Partnership, protection of devs
- **Dobre sygnały:**
  - Pyta **dlaczego** to pilne (edukuje klienta)
  - Proponuje alternatywy (część na poniedziałek, reszta później)
  - Nie obiecuje bez konsultacji z devem
  - Jasno mówi co to kosztuje (czas/pieniądze)
- **Złe sygnały:**
  - "Robię żeby klient był zadowolony" → **red flag (overpromising, brak pushback)**
  - "Każę devowi pracować w weekend" → **red flag (nie chroni zespołu)**
  - "Odmawiam" (bez negocjacji) → **red flag (brak client skills)**
- **Follow-up:** "A jeśli klient naciska że to 'kwestia życia i śmierci'?"

#### K2. "Jak komunikujesz klientowi że projekt się opóźni? Opowiedz mi konkretną sytuację z życia."
- **Co testuje:** Transparent Partnership, timing komunikacji, honesty
- **Dobre sygnały:** informuje **wcześnie** (nie w deadline), z **powodem** + **nowym terminem** + **planem nadrobienia**
- **Złe sygnały:** czeka do ostatniej chwili, obwinia zespół/klienta, "uzupełniam status w ClickUp"
- **Follow-up:** "Ile dni przed deadline musisz wiedzieć że coś się nie dowiezie?"

#### K3. "Klient jest nietechniczny i prosi o 'prostą zmianę' która jest w rzeczywistości 3 dni developmentu. Jak to komunikujesz?"
- **Co testuje:** edukowanie klienta (important.is value), translation tech → business
- **Dobre sygnały:** tłumaczy **dlaczego** (analogią, bez żargonu), pokazuje trade-off, proponuje opcje
- **Złe sygnały:** "wyceniam i wysyłam", "przepraszam i robię", nie edukuje
- **Follow-up:** "Masz przykład z życia kiedy klient po takim wyjaśnieniu zrezygnował z funkcji?"

#### K4. "Twój angielski — jak się czujesz na spotkaniu z anglojęzycznym klientem? Skala 1-10 + ostatni przykład."
- **Co testuje:** realny poziom angielskiego (nie deklaratywny)
- **Dobre sygnały:** konkretna ocena + przykład ("robię weekly call po angielsku z klientem UK")
- **Złe sygnały:** "pisany tak, mówiony gorzej" bez przykładu, "nie miałem okazji"
- **Follow-up (jeśli słaby):** "Czy uczysz się teraz? Jak?"

---

### TRUDNE SYTUACJE (3 pytania)

#### T1. "Dev nie dowozi na czas drugi raz z rzędu. Jak to rozwiązujesz?"
- **Co testuje:** przywództwo, czy robi 1:1, czy eskaluje, ochrona zespołu vs accountability
- **Dobre sygnały:**
  - Rozmowa 1:1 (nie na kanale publicznym)
  - Szuka **przyczyny** (blokery? brief? wypalenie?)
  - Proponuje pomoc zanim eskaluje
  - Dopiero potem eskaluje do tech leada/Łukasza
- **Złe sygnały:**
  - "Piszę na Discordzie że się spóźnia" → **red flag (public shaming)**
  - "Eskaluję do szefa" od razu → **red flag (brak ownership)**
  - "Monitoruję go częściej" → **red flag (micromanagement)**
- **Follow-up:** "Jak często robisz 1:1 z devami w trakcie projektu?"

#### T2. "Dwóch klientów prosi o coś 'na już' w tym samym momencie. Jak priorytetyzujesz?"
- **Co testuje:** Important over Urgent, honesty vs overpromising
- **Dobre sygnały:** kryteria decyzji (SLA/kontrakt, impact biznesowy klienta, realna pilność vs panika), **informuje oba klientów** o sytuacji
- **Złe sygnały:** "robię oba na raz", "kto głośniej krzyczy", "ten który więcej płaci" (bez dalszej niuansu)
- **Follow-up:** "Zdarzyło ci się powiedzieć klientowi 'to poczeka do jutra'?"

#### T3. "Klient wysyła wiadomość w niedzielę wieczorem 'urgent'. Odpowiadasz?"
- **Co testuje:** work-life boundaries, edukowanie klienta, Important over Urgent
- **Dobre sygnały:** ma ustalone godziny pracy i komunikuje je klientom, odpowiada w pn rano (chyba że true emergency jak site down), edukuje co to "urgent"
- **Złe sygnały:**
  - "Zawsze odpowiadam" → **red flag (wypalenie, burnout risk)**
  - "Nigdy nie odpowiadam" → **red flag (brak elastyczności)**
- **Follow-up:** "Jak definiujesz co jest prawdziwie pilne?"

---

### WARTOŚCI IMPORTANT.IS (5 pytań — po 1 na wartość)

#### V1. (Important over Urgent) "Kiedy ostatnio powiedziałeś klientowi 'nie' albo 'nie teraz'? Co się stało?"
- **Co testuje:** pushback skills, edukacja klienta
- **Dobre sygnały:** konkretna sytuacja, klient zrozumiał albo wycofał request
- **Złe sygnały:** "nie pamiętam", "staram się nie mówić nie klientowi" → **red flag**
- **Follow-up:** "Jak zareagował klient?"

#### V2. (Quality & Craftsmanship) "Opisz sytuację gdy zespół oddał coś 'wystarczająco dobrego' a ty uznałeś że trzeba poprawić. Co zrobiłeś?"
- **Co testuje:** bar na jakość, zdolność do pushback na własnym zespole
- **Dobre sygnały:** konkretny przykład, jak argumentował, rozmowa bez blame
- **Złe sygnały:** "oddaję do klienta żeby się wypowiedział" (brak własnej opinii), "nie mam takich sytuacji"
- **Follow-up:** "Jak rozpoznajesz że coś jest 'wystarczająco dobre' vs 'dobre'?"

#### V3. (Continuous Learning) "Czego nauczyłeś się w ostatnim miesiącu? Coś konkretnego — tool, technika, książka, podcast."
- **Co testuje:** ciekawość, rozwój, challenge own assumptions
- **Dobre sygnały:** konkret z ostatnich 30 dni, zastosowanie w pracy
- **Złe sygnały:** "nie miałem czasu", ogólnik ("czytam o AI"), rzecz sprzed roku
- **Follow-up:** "Jak dzielisz się wiedzą z zespołem?"

#### V4. (Transparent Partnership) "Opowiedz o sytuacji w której musiałeś przyznać klientowi błąd. Jak to zrobiłeś?"
- **Co testuje:** honesty, transparentność (KLUCZOWE dla Łukasza), nie-overpromising
- **Dobre sygnały:** konkret, przyznanie błędu + rozwiązanie + learning (dla siebie + dla klienta)
- **Złe sygnały:** "zwalałem na technikalia", "staram się nie popełniać błędów" → **red flag**
- **Follow-up:** "Czy kiedyś ukryłeś problem przed klientem? Dlaczego?"

#### V5. (Thoughtful Everything) "Jak przygotowujesz się do spotkania z klientem? Co wysyłasz przed, co po?"
- **Co testuje:** dbałość o purposeful communication, agenda, TLDR
- **Dobre sygnały:** agenda przed, notatki po, jasne next steps, czasowy boks
- **Złe sygnały:** "zależy od spotkania", "klient wie po co przyszedł" → **red flag**
- **Follow-up:** "Jak długie są twoje typowe status maile do klientów?"

---

### NARZĘDZIA I PROCES (2 pytania)

#### N1. "Znasz WordPress — jak dobrze? Konkretnie: rozumiesz co to staging, czym różni się wtyczka od motywu, co to builder, dlaczego robi się backup przed updatem?"
- **Co testuje:** tech literacy WP (ważne w important.is)
- **Dobre sygnały:** rozumie staging workflow, zna typowe pluginy, rozumie ryzyka
- **Złe sygnały:** "korzystam jako user", nie rozumie stagingu
- **Follow-up:** "Potrafisz sam zrobić prostą zmianę w Bricks / Gutenberg?"

#### N2. "Jak używasz AI w codziennej pracy? Konkretne use case'y, nie ogólniki."
- **Co testuje:** adopcja AI, automacja, Continuous Learning
- **Dobre sygnały:** konkretne workflow (np. "Claude do draftu briefu, sprawdzam ręcznie", "n8n łączy ClickUp z Discordem"), świadomość ograniczeń AI
- **Złe sygnały:** "czasem pytam ChatGPT", "nie używam bo nie ufam"
- **Follow-up:** "Zautomatyzowałeś coś ostatnio w procesie PM?"

---

### ZAMKNIĘCIE (3 kroki)

#### Z1. "Dostępność — ile godzin tygodniowo realnie możesz dać important.is? Ilu masz już innych klientów/projektów B2B?"
- **Co testuje:** realna dostępność (nie deklaratywna)
- **Follow-up:** "Jakie są twoje godziny pracy na co dzień?"

#### Z2. "Stawka godzinowa netto B2B jaką szukasz?"

#### Z3. "Masz do mnie jakieś pytania o important.is, zespół, sposób pracy?"
- **Co testuje:** zaangażowanie, przygotowanie, seniority
- **Dobre sygnały:** 2-3 konkretne pytania (nie o benefity od razu)
- **Złe sygnały:** "nie, raczej nie" → sygnał niskiej motywacji

**Zakończenie:** "Super, dzięki za rozmowę [imię]! 🙌 Łukasz przejrzy twoje odpowiedzi i wróci w ciągu kilku dni. Do usłyszenia! 🚀"

---

## 4. Rekomendacje systemowe (proces + scoring)

### 4.1 Zmiany w CAP-ach

**Obecne CAP-y (linia 81-84) są OK ale niekompletne.** Dodaj:

| Nowy CAP | Trigger | Efekt |
|----------|---------|-------|
| **Blame culture** | Na pytanie D3 (porażka) kandydat obwinia tylko innych, bez własnej odpowiedzialności | wynik_dopasowanie MAX 15 |
| **Brak samoświadomości** | "Nie miałem projektów które się nie udały" | wynik_dopasowanie MAX 18 |
| **Overpromising** | W K1/K2 obiecuje bez konsultacji z zespołem, nigdy nie mówi "nie" klientowi | wynik_dopasowanie MAX 18 |
| **Micromanagement** | W T1 mówi o "monitorowaniu", "kontrolowaniu", "sprawdzaniu co godzinę" | wynik_dopasowanie MAX 15 |
| **Ogólniki wszędzie** | <3 konkretne przykłady (nazwy klientów, liczby, daty) w całej rozmowie | wynik_techniczny MAX 14 |
| **Brak warunkowej odmowy klientowi** | Na V1 nie potrafi przypomnieć sytuacji kiedy powiedział "nie" | wynik_dopasowanie MAX 20 |

### 4.2 Czerwone flagi (instant fail / eskalacja do Łukasza)

Sygnały które powinny trafić do pola `czerwone_flagi` w raporcie:

1. **"Nigdy nie popełniam błędów"** / "Nigdy nie miałem porażek" → **HARD RED FLAG**
2. **"Zawsze odpowiadam klientowi, nawet w nocy"** → burnout risk + brak edukacji klienta
3. **"Obsługuję 10+ projektów równolegle"** bez kontekstu → nierealistyczne lub kłamstwo
4. **Blame culture** w opisie porażki ("to była wina devów/klienta/designera")
5. **Brak pytań na końcu** do firmy → niska motywacja
6. **Stawka < 40 PLN/h** lub > 150 PLN/h przy B2B mid-senior → misfit budżetowy
7. **"Nie znam WordPress"** i jednocześnie "nie chcę się uczyć" → dealbreaker
8. **Ukrywanie problemów przed klientem** ("klient nie musi wiedzieć o błędach") → konflikt z Transparent Partnership

### 4.3 Jak wykryć "toxic PM" w tym promptcie

| Typ toxica | Sygnał w rozmowie | Pytanie które go ujawnia |
|-----------|-------------------|--------------------------|
| **Micromanager** | Monitoring, kontrolowanie, "sprawdzam co godzinę" | T1 (dev nie dowozi) |
| **Blame culture** | "Winny był X" bez autorefleksji | D3 (porażka) |
| **Overpromisser** | "Klient zawsze ma rację", "robię wszystko" | K1 (piątek 17:00), V1 (kiedy powiedziałeś nie) |
| **Ghoster** | Niska responsywność, unikanie trudnych rozmów | K2 (komunikacja delay) |
| **Prima donna** | Wszystko "ja", brak wspomnienia zespołu | D1 (opisz projekt) |
| **Passive aggressive** | "Nie lubię konfliktów", unika 1:1 | T1 (dev nie dowozi) |

### 4.4 Scenariusze testowe (opcjonalne rozszerzenie)

Dla kandydatów seniorskich można dodać opcjonalne scenariusze:

**Scenariusz 1 (komunikacja):**
> "Napisz mi w 2-3 zdaniach wiadomość do klienta: Paulina (klient niesprecyzowany), projekt o tydzień opóźniony, powód: dev zachorował. Jak to piszesz?"

Testuje: TLDR, honesty, ton, strukturę komunikacji.

**Scenariusz 2 (priorytety):**
> "Masz 3 taski w kolejce: (A) klient A chce 'urgent' fix który jest kosmetyczny, (B) klient B ma site down, (C) trzeba oddać estymatę nowego projektu do 18:00. Jak porządkujesz i dlaczego?"

Testuje: Important over Urgent, priorytyzacja.

### 4.5 Candidate experience — co DODAĆ do promptu

1. **Walidacja emocjonalna po trudnych pytaniach:** *"Dzięki za szczerość 🙌"* po D3 (porażka)
2. **Przezroczystość o AI:** w powitaniu dodać *"Jestem Kaja, AI-asystent rekrutacyjny Łukasza — dzięki temu szybciej dostaniesz odpowiedź"*
3. **Reciprocity:** obowiązkowe Z3 (masz pytania?)
4. **Transparentność widełek:** jeśli kandydat pyta o stawkę, Kaja może powiedzieć widełki (50-100 PLN/h)

---

## 5. Konkretne zmiany do wdrożenia w promptcie (TOP 5 priorytet)

### Zmiana #1 — Wymuś konkrety przez follow-upy (KRYTYCZNE)

Dodaj do sekcji "Zasady":

```typescript
## Zasady konkretów — OBOWIĄZKOWE

Przy KAŻDEJ odpowiedzi kandydata o doświadczeniu MUSI być follow-up o konkrety:
- Nazwa klienta / branża
- Liczba (budżet, tygodnie, osoby w zespole)
- Konkretna sytuacja (data / projekt)

Jeśli kandydat odpowiada ogólnikami 2x z rzędu → ZANOTUJ i obniż wynik_techniczny o 2-3 pkt.

Przykłady follow-upów:
- "Możesz podać konkretny przykład?"
- "Jaki to był projekt — nazwa/branża?"
- "Ile to było tygodni / jaki budżet?"
- "Co dokładnie powiedziałeś klientowi?"
```

### Zmiana #2 — Dodaj pytanie o porażkę (KRYTYCZNE)

W sekcji "Doświadczenie PM" dodaj jako pytanie #3:

```typescript
### 3. Doświadczenie PM
- Ostatni projekt od początku do końca — konkrety (klient, budżet, zespół, czas, twoja rola)
- **Projekt który się NIE udał — co się stało i co zrobiłeś?** [OBOWIĄZKOWE follow-up: "Co zmieniłeś po tym doświadczeniu?"]
- Ile projektów równolegle teraz?
- Narzędzia PM — konkretna konfiguracja (nie tylko nazwa)
```

### Zmiana #3 — Dodaj sekcję wartości important.is

```typescript
### 7. Wartości important.is (KRYTYCZNE — testuj wszystkie 5)

- **Important over Urgent:** "Kiedy ostatnio powiedziałeś klientowi 'nie' albo 'nie teraz'? Co się stało?"
- **Quality:** "Sytuacja gdy zespół oddał coś 'wystarczająco dobrego' a ty uznałeś że trzeba poprawić?"
- **Continuous Learning:** "Czego nauczyłeś się w ostatnim miesiącu? Konkret."
- **Transparent Partnership:** "Opowiedz o sytuacji gdy musiałeś przyznać klientowi błąd."
- **Thoughtful Everything:** "Jak przygotowujesz się do spotkania z klientem? Co wysyłasz przed, co po?"
```

### Zmiana #4 — Rozbuduj CAP-y i dodaj czerwone flagi

```typescript
### Dyskwalifikujące (= CAP)
- **Brak przykładów z życia** (2x ogólniki z rzędu) → wynik_techniczny MAX 14
- **<1 rok doświadczenia PM** → wynik_techniczny MAX 12
- **Angielski słaby** → wynik_komunikacja MAX 20
- **Blame culture** (winni tylko inni) → wynik_dopasowanie MAX 15
- **"Nigdy nie miałem porażek"** → wynik_dopasowanie MAX 18
- **Overpromising** (nie mówi "nie" klientowi) → wynik_dopasowanie MAX 18
- **Micromanagement** (monitoring, kontrolowanie) → wynik_dopasowanie MAX 15

### Czerwone flagi (→ pole czerwone_flagi w raporcie)
- Brak samoświadomości błędów
- Ukrywanie problemów przed klientem
- "Zawsze odpowiadam nawet w nocy" (burnout risk)
- Public shaming devów
- Brak pytań do firmy na końcu
```

### Zmiana #5 — Dodaj scenariusz konfliktowy

W sekcji "Trudne sytuacje":

```typescript
### 5. Trudne sytuacje — scenariusze konkretne

SCENARIUSZ 1: "Klient dzwoni w piątek 17:00 — potrzebuje zmiany na pn rano, dev musiałby pracować w weekend. Jak reagujesz? Krok po kroku."
[Szukasz: pushback, ochrona zespołu, edukacja klienta, alternatywy]

SCENARIUSZ 2: "Dev nie dowozi drugi raz z rzędu. Co robisz?"
[Szukasz: 1:1, szukanie przyczyny, NIE micromanagement, NIE public shaming]

SCENARIUSZ 3: "Klient wysyła wiadomość w niedzielę 'urgent'. Odpowiadasz?"
[Szukasz: zdrowe boundaries, edukacja klienta, definicja 'pilne']
```

---

## Podsumowanie — Executive Summary

**Obecny prompt:** 6/10. Dobry na screening juniorów i mid-level, ma CAP-y, ale przepuści "paper PM" który zna terminologię ale nie ma realnego doświadczenia. **Kluczowa luka:** zero testu wartości important.is.

**Po wdrożeniu zmian TOP 5:** 9/10. Prompt będzie:
- Wymuszał konkrety (odsiew "klikaczy")
- Testował wszystkie 5 wartości important.is
- Wykrywał toxic patterns (blame, micromanagement, overpromising)
- Zachowywał dobre candidate experience (15 min, ton Kai, pytania zwrotne)

**Priorytet wdrożenia:**
1. Zmiana #1 (konkrety) — natychmiast
2. Zmiana #4 (CAP-y + red flags) — natychmiast
3. Zmiana #2 (porażka) — ten tydzień
4. Zmiana #3 (wartości) — ten tydzień
5. Zmiana #5 (scenariusze) — następny sprint

---

## Źródła

- [Sam Barnes — Questions to Ask Digital PM Candidates](https://thesambarnes.com/leadership/questions-to-ask-digital-project-manager-candidates/)
- [Sakas & Company — PM Interview Questions for Digital Agencies](https://sakasandcompany.com/pm-interview-questions/)
- [The Knowledge Academy — 30+ Digital PM Interview Questions](https://www.theknowledgeacademy.com/blog/digital-project-manager-interview-questions/)
- [HeroHunt — AI-Driven Candidate Screening 2025 Guide](https://www.herohunt.ai/blog/ai-driven-candidate-screening-the-2025-in-depth-guide/)
- [Willo — AI Candidate Screening Best Practices](https://www.willo.video/blog/ai-candidate-screening)
- [Medium — Recognizing Blame Culture in PM (Søren Porskrog)](https://porskrog.medium.com/recognizing-the-signs-of-a-blame-culture-in-project-management-42f539e1239c)
- [HRtechDepot — Toxic Behavior and Micromanagement](https://www.hrtechdepot.com/articles/toxic-behavior-and-micromanagement-the-silent-killers-of-work-culture/)
- [CNBC — No.1 Sign of Toxic Workplace (Micromanagement)](https://www.cnbc.com/2023/08/30/the-biggest-sign-of-a-toxic-workplace-to-watch-out-for.html)
