# Review rekrutacji: Grafik / Designer

**Data:** 2026-04-04
**Autor:** senior HR/talent strategist review
**Plik:** `/Users/lukaszek/Projects/important/hr-chat/src/lib/prompts/grafik.ts`

---

## 1. Audyt obecnego promptu

### Co działa dobrze (zachować)

1. **Ton Kaji** — ciepły, luźny, emoji, "bez stresu" — to rzadkość w AI rekruterach i faktyczny wyróżnik. Research pokazuje że designerzy masowo odrzucają AI interviewy jako "zimne i dehumanizujące" (Reddit, Medium). Kaja jest po dobrej stronie tej linii.
2. **Figma jako MUST z twardym CAP-em** — sensowne, bo cała agencja działa w Figma → Bricks. Kandydat bez Figmy realnie nie wejdzie w workflow.
3. **Hard cap za brak projektów web** → chroni przed "Behance aesthetic designer" który robi tylko mockupy Dribbble i nie ma pojęcia o real content, breakpointach, CMS constraints.
4. **Pytanie o reakcję na "nie podoba mi się"** — bardzo dobre, testuje value #4 (Transparent Partnership). Zostaje.
5. **AI w designie jako osobna sekcja** — zgodne z value #3 (Continuous Learning). Dobrze.
6. **15-25 wymian, jedno pytanie na raz** — właściwy reżim konwersacji.

### Co nie działa / słabe punkty

#### Problem #1: Portfolio deep-dive jest za płytki
Obecne pytania: *"Linki do 3-5 projektów"*, *"Który uważasz za najlepszy i dlaczego"*.

To NIE odróżnia **"pretty pictures designer"** od **"problem solver"**. Każdy junior odpowie "bo jest najładniejszy" albo "bo klient był zadowolony". Brakuje drążenia:
- Jaki był **brief/problem biznesowy** (nie "klient chciał stronę")?
- Jakie były **constrainty** (budżet, content, deadline, istniejący brand)?
- Jakie **decyzje designowe** kandydat podjął i **dlaczego**?
- Jak mierzono **sukces** po wdrożeniu?
- Co by dziś zrobił inaczej?

Bez tego scoring "Portfolio: senior-level=5" jest strzelaniem z biodra — oceniasz wygląd linka, nie myślenie projektowe.

#### Problem #2: "Proces projektowy" to pytanie frameworkowe, nie realne
*"brief → research → wireframe → design?"* — kandydat zrecytuje framework z YouTube. Każdy UX kurs w 2 tygodnie tego uczy. **Recytowanie nie jest dowodem** że kandydat tak pracuje.

Lepsze: pytania **sytuacyjne z własnego projektu** — "opowiedz jak wyglądał ostatni projekt strony od briefu do odbioru". To wymusza konkrety.

#### Problem #3: Zero weryfikacji web-thinking (krytyczne dla important.is)
Prompt o tym pisze, ale pyta tylko: *"Doświadczenie z designem pod WordPress?"*. To za słabe.

Agencja żyje z tego, że grafik **rozumie ograniczenia webu**: breakpointy, real content (nie "Lorem Ipsum w hero"), CMS-friendly komponenty, stany (hover/focus/empty/error/loading), performance. Trzeba to realnie przetestować.

Pytania których brakuje:
- "Masz hero section z headerem — co się dzieje na 375px? Pokaż mi w głowie."
- "Co przekazujesz deweloperowi oprócz Figmy? Spec? Tokeny?"
- "Zaprojektowałeś/aś landing z 3 kartami case studies. Klient ma 7. Co robisz?"
- "Empty state, loading state, error state — projektujesz je z automatu czy tylko happy path?"

#### Problem #4: AI w designie — pytanie za miękkie
Obecne: *"Używasz AI? Do czego?"* → kandydat powie "do moodboardów" i dostaje 3 punkty.

Value #3 to **eksperymentowanie**. Lepsze pytanie: "Jaki jest najbardziej nietypowy sposób w jaki ostatnio użyłeś/aś AI w projekcie?" albo "Gdzie AI Ci **nie pomogło** i dlaczego wróciłeś/aś do ręcznej pracy?" — testuje refleksję, nie hype.

#### Problem #5: Wartości important.is są prawie niewidoczne
Prompt opisuje agencję jedną linijką i nie testuje 5 core values explicite. To strata. Przykłady:
- **Important over Urgent** → "Klient chce deploy w piątek, ale masz wątpliwości co do UX jednego flow. Co robisz?"
- **Quality & Craftsmanship** → "Opowiedz o detalu w projekcie z którego jesteś najbardziej dumny/a — czegoś czego nikt nie zauważy poza Tobą."
- **Thoughtful Everything** → "Wybrałeś konkretny font w ostatnim projekcie. Dlaczego ten a nie inny?"

#### Problem #6: CAP-y i scoring mogą odstraszać dobrych ludzi
- "Nie zna terminologii UX (wireframe, user persona) → MAX 15" — to dziwny filtr. Są świetni grafikowie brandingowi którzy robią wireframe ale nie używają słowa "persona" bo to cringe w 2026. Lepiej testować **myślenie** a nie **słownictwo**.
- "Stawka 100+ PLN = 2-3 pkt" — to kara za seniority. Senior 5+ lat Figma expert AI workflow powinien dostać wysoki score nawet przy 120 PLN/h jeśli faktycznie dowozi.

#### Problem #7: Brak pytania o współpracę z devem
Important.is oddaje pliki do Bricks Builder. Grafik który nie rozumie że dev będzie implementował **jego auto-layout i komponenty**, robi kłopoty. Trzeba pytać.

#### Problem #8: Brak mini-zadania / audytu
Najbardziej skuteczna metoda rozpoznania "problem solver vs pixel pusher" to zadanie: "spójrz na tę stronę, co byś zmienił/a i dlaczego?" (3 punkty, 5 minut). Obecny prompt tego nie ma.

---

## 2. Insights z researchu

### Co wiemy z r/graphic_design, Medium, Reddit r/userexperience (2025)

1. **AI recruiter = red flag** dla wielu designerów. Kandydaci piszą że czują się jak na "dystopijnej przesłuchanio-linii montażowej". Rozwiązanie: **jasno zakomunikować na starcie że to pierwsza rozmowa (screening) i że Łukasz rzeczywiście przeczyta notatki**. Kaja już to robi ("Łukasz wróci do Ciebie") — zachować i może wzmocnić.

2. **Najgorsze wzorce AI interviewer** wg kandydatów:
   - brak możliwości wrócenia/sprecyzowania odpowiedzi
   - sztywne skrypty które nie reagują na kontekst
   - brak follow-up questions
   - ocenianie na żywo ("feedback score")
   - zbyt długie (>20 min)

   **Wniosek dla Kaji:** naturalne dopytywanie (już jest), krótko (15-20 min max), NIE pokazywać scoringu, pozwalać cofać się ("mogę wrócić do pytania o portfolio?").

3. **Pixel pusher vs problem solver** — kluczowy sygnał: gdy pytasz "dlaczego ten projekt jest Twój najlepszy", pixel pusher mówi o **wyglądzie** ("kolory", "minimalizm", "clean"), problem solver mówi o **problemie i decyzjach** ("klient miał 40% bounce na pricing, przeprojektowaliśmy hierarchię, spadło do 22%"). To DIAMETRALNY różnicownik.

4. **"Behance designer" red flags**:
   - każdy projekt to landing na full-screen mockupie z laptopem
   - brak "before/after"
   - brak mobile screens
   - brak real content (same "Your Headline Here")
   - brak wzmianki o klientach/kontekście biznesowym
   - każdy projekt wygląda identycznie estetycznie (ten sam szablon Framer/Readymag)

5. **Designerzy nienawidzą** (Reddit):
   - Test tasków bez zapłaty >4h
   - Rekruterów bez pojęcia o projekcie (nie rozumieją pytań zwrotnych)
   - "What's your greatest weakness" (obietnicowo wyłączone w Kaji — dobrze)
   - Ocena stawki przed rozmową techniczną

6. **Figma competency signals** (kluczowe red flags):
   - "Nie używam auto-layout" → junior lub skostniały
   - "Nie robię components, kopiuję" → nie skaluje się w projekcie
   - "Design tokens? Co to?" → nie rozumie design systems
   - "Przesyłam PNG do deva" → katastrofa dla Bricks workflow

7. **Dev-handoff literacy** (z Figma Blog, 2025):
   - Dobry grafik organizuje layery, nazywa je sensownie
   - Używa Inspect mode i przekazuje specy
   - Wie co to breakpoints w Figma (min-width frames)
   - Rozumie że komponent w Figmie ≠ komponent w Bricks, ale mapuje 1:1

---

## 3. Proponowany zestaw pytań (ulepszony)

### Sekcja A: Warm-up (2-3 wymiany)
1. "Cześć! Jestem Kaja z important.is. Podaj mi swoje imię i miasto 😊"
2. "Fajnie! Powiedz mi w 2 zdaniach — skąd w ogóle design u Ciebie? Czego szukasz teraz?"
3. (capture: email, miasto, current status — freelance/etat/szuka)

### Sekcja B: Portfolio deep-dive — serce rozmowy (4-5 wymian)
**Metodologia:** pytaj o JEDEN projekt bardzo głęboko, nie 5 płytko.

4. "Wyślij mi link do portfolio (Behance/Dribbble/strona własna) — którego projektu jesteś najbardziej dumny/a?"
5. "Opowiedz o tym projekcie jak o filmie — **jaki problem rozwiązywał klient**, nie jak wyglądał? Skąd wiedziałeś/aś że to właściwy kierunek?"
6. "Jakie były **constrainty** — budżet, czas, istniejąca marka, ktoś-powiedział-musi-być-niebieski? Co najbardziej ograniczało?"
7. "Jedna **konkretna decyzja designowa** z tego projektu — co wybrałeś/aś i dlaczego **nie coś innego**?" (drąży Thoughtful Everything)
8. "Co byś dzisiaj zrobił/a inaczej?" (testuje learning + self-awareness)

**Dlaczego tak:** to wymusza konkret. Pixel pusher nie ma języka na constraints i trade-offs. Problem solver mówi "chciałem 3 warianty hero, ale mieli tylko 1 fotkę produktu HD, więc…"

### Sekcja C: Narzędzia — Figma literacy (2-3 wymiany)
9. "Figma — na 1-10 jak się czujesz? I konkretnie: **auto-layout, components, variants, design tokens/variables** — które z tych 4 są dla Ciebie chleb powszedni, a które dopiero ogarniasz?"
10. (jeśli mówi że zna) "Ostatni projekt — ile miałeś/aś components w pliku? Używałeś/aś variants do stanów hover/active/disabled?"
11. "A Adobe / Canva / AI gen tools — co używasz do czego?" (mapowanie stacku)

### Sekcja D: Web-thinking (2-3 wymiany) — KLUCZOWE dla important.is
12. "Projektujesz hero section strony firmowej. Desktop 1440px. **Co się dzieje na 375px mobile** — co przesuwasz, co chowasz, co zmieniasz?" (testuje responsive thinking)
13. "Klient daje Ci 3 zdjęcia produktu, ale Twój projekt zakłada 8 kart w sekcji 'produkty'. Co robisz — projektujesz z placeholderami, prosisz o więcej, przerabiasz layout?" (real content thinking)
14. "Empty state, loading state, error state — projektujesz to zawsze, czasem, nigdy?" (craftsmanship)

### Sekcja E: Dev handoff (1-2 wymiany)
15. "Oddajesz projekt deweloperowi — co dokładnie dostaje oprócz linka do Figmy? (spec, tokeny, prototyp, notatki?) Jak wygląda Twoja 'ostatnia mila' przed oddaniem?"
16. (opcjonalne dopytanie) "Zdarzyło Ci się że dev zaimplementował Twój projekt i coś Ci się nie zgadzało? Jak to rozwiązaliście?" (transparent partnership)

### Sekcja F: AI w designie (1-2 wymiany)
17. "Jaki jest **najciekawszy** sposób w jaki użyłeś/aś AI w designie ostatnio? (nie moodboardy-klasyk, coś niestandardowego)"
18. "A gdzie AI Cię zawiodło — próbowałeś/aś i wróciłeś do ręcznej pracy?" (refleksja > hype)

### Sekcja G: Wartości important.is (scenariusze) (2-3 wymiany)
19. **Scenariusz Important over Urgent:** "Piątek 15:00, klient pisze 'deploy dziś, nie ma czasu na review', ale masz wątpliwość co do flow checkoutu. Co robisz konkretnie?"
20. **Scenariusz Transparent Partnership:** "Klient mówi 'nie podoba mi się, zmień wszystko' bez konkretów — co robisz w najbliższych 10 minutach?"
21. **Scenariusz Craftsmanship:** "Opowiedz o detalu z jakiegoś projektu z którego jesteś dumny/a — czegoś czego nikt oprócz Ciebie by nie zauważył."

### Sekcja H: Styl pracy (1-2 wymiany)
22. "Jak ogarniasz 3-4 projekty jednocześnie? (kalendarz, ClickUp, Notion, kartka?)"
23. "Jak reagujesz na feedback z którym się nie zgadzasz?"

### Sekcja I: Logistyka (2 wymiany)
24. "Ile godzin tygodniowo możesz dać important.is?"
25. "Jaka stawka netto/h B2B byłaby dla Ciebie OK?"

### Sekcja J: Zamknięcie
26. "Masz do mnie jakieś pytanie zanim skończymy?"
27. "Ekstra [imię]! Dzięki za czas 🙌 Łukasz przeczyta notatki i wróci do Ciebie w tym tygodniu. Trzymaj się! 🚀"

**Razem: 22-27 wymian** (obecne 15-25). Można skrócić sekcję B do 3 pytań jeśli kandydat gada krótko.

---

## 4. Rekomendacje systemowe

### 4.1. Zmiany w CAP-ach

| CAP obecny | Problem | Propozycja |
|---|---|---|
| Nie zna terminologii UX → MAX 15 | Kara za słownictwo, nie myślenie | **Usunąć.** Zastąpić: "nie potrafi opowiedzieć o trade-offach / decyzjach w portfolio → MAX 14" |
| Bez projektów web → MAX 14 | OK, zostaje | Dodać niuans: "chyba że brand/identity designer z 5+ full identities → MAX 18" (bo może rosnąć w web) |
| Stawka 100+ PLN = 2-3 pkt | Kara za seniority | **Usunąć z wyniku_dopasowania.** Stawka to info dla Łukasza, nie kara. Może być osobne pole "stawka_flag" (zielona/żółta/czerwona) |
| Bez Figmy (tylko Canva) → MAX 10 | OK, zostaje | Zostaje |

**Nowy CAP:** "**Nie rozumie responsive / mobile-first**" (nie potrafi opisać co dzieje się z hero na 375px) → **MAX 13 tech**. To agencyjny deal-breaker.

**Nowy CAP:** "**Portfolio = same mockupy w laptopach bez opisu projektu/klienta/problemu**" → flaga "behance_aesthetic=true" i MAX 13 tech (można podbić jeśli rozmowa ratuje).

### 4.2. Jak wykryć "pretty pictures" vs "problem solver" — sygnały

**Czerwone flagi (pretty pictures):**
- Opisując projekt: mówi tylko o estetyce ("clean", "minimal", "nowoczesny kolor")
- Brak referencji do **klienta, biznesu, userów**
- Brak **liczb / metryk / before-after**
- Constrainty: "nie było, klient dał wolną rękę"
- "Co byś zmienił/a?" → "nic, jestem zadowolony/a"
- Odpowiedź na responsive: "scrolluje się w dół" / "robię osobny mobile"
- AI: "tylko do generowania ładnych obrazków"

**Zielone flagi (problem solver):**
- Opisuje **problem** zanim opisze **rozwiązanie**
- Mówi o **trade-offach** ("chciałem X ale musiałem Y bo…")
- Wspomina **users/klienta/kontekst** spontanicznie
- "Co byś zmienił/a?" → konkretna samorefleksja
- Rozróżnia **happy path** vs **edge cases**
- Wspomina o **współpracy z devem** bez pytania
- AI: opowiada o **zintegrowaniu w workflow**, nie "użyłem kiedyś Midjourney"

**Implementacja w promptcie:** dodać do Kaji instrukcję że gdy kandydat opisuje projekt **czysto estetycznie przez 2 wymiany z rzędu**, dopytuje: *"A jaki to rozwiązywało problem dla klienta? Co się zmieniło po wdrożeniu?"* — jeśli **nadal** nie potrafi, to sygnał.

### 4.3. Mini-zadanie — dodać?

**Rekomendacja: TAK, ale opcjonalnie i krótkie (5 min).**

Forma: **"Audit-in-conversation"** — bez wysyłania plików, bez homework.

W trakcie rozmowy (po sekcji B/C) Kaja rzuca:
> "Daj mi adres **jakiejkolwiek strony WordPress którą lubisz** (klienta, swojej, random). Powiedz mi 2 rzeczy które są tam dobrze zrobione i 2 które byś zmienił/a + dlaczego."

To:
- testuje **design eye** w realnym kontekście
- wymusza **uzasadnienie** (Thoughtful Everything)
- nie wymaga dodatkowego czasu (wszystko w rozmowie)
- odróżnia "lubię bo ładne" od "lubię bo rozwiązuje X"

**Scoring mini-zadania (max 5 pkt):**
- 0: nie potrafi znaleźć strony / same ogólniki
- 1-2: "ładne/brzydkie" bez uzasadnienia
- 3: konkretne elementy + estetyczne uzasadnienie
- 4: konkretne elementy + UX/business uzasadnienie
- 5: konkretne + UX + propozycja alternatywy + refleksja nad constraintami

### 4.4. Scoring — rekomendowane zmiany struktury

**Nowa struktura (25 tech + 30 dopasowanie = 55):**

**Kompetencje techniczne (25):**
- Figma competence (auto-layout, components, variants, tokens) — 0-5
- Portfolio quality (web + branding) — 0-5
- **Design thinking (trade-offy, decyzje, constrainty)** — 0-5 ← NOWE, zastępuje "proces projektowy"
- Web/responsive literacy — 0-5 ← NOWE, wydzielone
- AI integration w workflow — 0-5

**Dopasowanie (30):**
- **Problem-solver mindset** (pretty vs problem) — 0-5 ← NOWE, zastępuje "jakość odpowiedzi"
- Transparent Partnership (feedback reaction) — 0-5
- Important over Urgent (deadline scenario) — 0-5 ← NOWE
- Organizacja / multi-project — 0-5
- Komunikatywność (jasność, konkret) — 0-5
- Dostępność godzinowa — 0-5

**Stawka → osobne pole `stawka_flag` (green/yellow/red) + komentarz**, NIE w scoringu.

---

## 5. Konkretne zmiany w promptcie (top 5)

### Zmiana 1: Dodać deep-dive portfolio jako rdzeń (zastępuje pkt 4 obecnego)
**Stary pkt 4:**
```
- Linki do 3-5 najlepszych projektów z opisem
- Behance/Dribbble/strona własna?
- "Który projekt uważasz za swój najlepszy i dlaczego?"
```

**Nowy pkt 4 (Portfolio deep-dive):**
```
### 4. Portfolio — ZAWSZE 5 wymian minimum
Zapytaj o link + wybierz JEDEN projekt i drąż:
1. "Wyślij link do portfolio — którego projektu jesteś najbardziej dumny/a?"
2. "Opowiedz o tym jak o filmie — jaki problem biznesowy rozwiązywał klient?"
3. "Jakie były constrainty (budżet, czas, istniejąca marka)?"
4. "Jedna konkretna decyzja designowa — co wybrałeś i dlaczego NIE coś innego?"
5. "Co byś dziś zrobił/a inaczej?"

⚠️ Jeśli kandydat 2x z rzędu opisuje TYLKO estetykę bez wzmianki o problemie/userze/kliencie
→ dopytaj wprost: "A jaki to rozwiązywało problem? Co się zmieniło po wdrożeniu?"
Jeśli nadal nie potrafi → flaga "behance_aesthetic=true".
```

### Zmiana 2: Dodać web-thinking jako osobną sekcję (krytyczne)
**Nowy pkt 5 (Web-thinking):**
```
### 5. Web-thinking (KLUCZOWE - agencja WP)
- "Hero section 1440px — co się dzieje na 375px mobile? Co chowasz, przesuwasz, zmieniasz?"
- "Klient daje 3 zdjęcia, projekt zakłada 8 kart — co robisz?"
- "Empty state, loading state, error state — zawsze projektujesz czy tylko happy path?"
- "Co przekazujesz deweloperowi oprócz linka Figma? (spec, tokeny, prototyp?)"
```

### Zmiana 3: Scenariusze testujące 5 core values
**Nowy pkt 7 (Wartości — scenariusze):**
```
### 7. Wartości important.is (scenariusze)
- [Important over Urgent] "Piątek 15:00, klient chce deploy dziś, ale masz wątpliwość co do flow. Co robisz?"
- [Transparent Partnership] "'Nie podoba mi się, zmień wszystko' bez konkretów — co robisz?"
- [Craftsmanship] "Opowiedz o detalu z którego jesteś dumny/a — czegoś czego nikt nie zauważy."
```

### Zmiana 4: Zaktualizować CAP-y i usunąć karę za stawkę
**Stare CAP-y:**
```
- Nie zna terminologii UX → MAX 15
- Stawka 100+ PLN = 2-3 pkt
```

**Nowe:**
```
- Nie potrafi opisać trade-offów / decyzji w portfolio → MAX 14 tech
- Nie rozumie responsive (mobile-first) → MAX 13 tech
- Portfolio = same laptop-mockupy bez kontekstu projektu → flaga behance_aesthetic + MAX 13 tech
- (USUNIĘTE) Kara za stawkę — teraz osobne pole stawka_flag: green (<80), yellow (80-110), red (>110)
```

### Zmiana 5: Dodać mini-audyt strony w rozmowie
**Nowy pkt 6 (Design eye audit):**
```
### 6. Design eye (mini-audyt w rozmowie)
"Podaj adres jakiejkolwiek strony WWW którą lubisz. Powiedz 2 rzeczy
dobrze zrobione + 2 które byś zmienił/a i dlaczego."

Scoring 0-5:
- 0: ogólniki / nie potrafi znaleźć
- 2: "ładne/brzydkie" bez uzasadnienia
- 3: konkrety + estetyczne "dlaczego"
- 4: konkrety + UX/business "dlaczego"
- 5: konkrety + UX + alternatywa + refleksja nad constrainami
```

---

## Podsumowanie

**Obecny prompt:** solidna baza, Kaja ma dobry ton, scoring ma właściwe intencje, ale jest **za płytki w portfolio** i **niedostatecznie testuje web-thinking** — a to jest core competency dla agencji WP.

**Po zmianach:** Kaja będzie potrafiła odróżnić pixel pushera od problem solvera w 3-4 wymianach, realnie wyłapie "behance aesthetic designers", i przetestuje wartości important.is przez scenariusze (nie przez deklaracje).

**Ryzyko rozmowy po zmianach:** wydłuża się do 22-27 wymian (~20 min). Jeśli to za dużo — skrócić sekcję B z 5 do 3 pytań dla juniorów oraz usunąć sekcję F (AI) dla kandydatów bez doświadczenia z AI (Kaja pyta raz, nie drąży).

**Next steps:**
1. Zaimplementować top-5 zmian w `grafik.ts`
2. Przerobić `completeInterviewTool` schema żeby obsłużyć: `stawka_flag`, `behance_aesthetic` flag, nowe pola scoringu
3. Przetestować na 2-3 symulowanych kandydatach (junior, mid, senior)
4. Porównać wyniki ze starą wersją

---

## Sources

- [Pixel Pusher vs. Problem Solver — Tom Froese (Medium)](https://tomfroese.medium.com/pixel-pusher-vs-problem-solver-4b48f9b57b4)
- [Design Chronicles #2: Pixel Pusher or Problem Solver (UX Planet)](https://uxplanet.org/design-chronicles-2-1d5c2af15a6d)
- [Why Job Seekers Are Rejecting AI Interviews (Rehearsal AI)](https://www.tryrehearsal.ai/blog/why-candidates-hate-ai-interviews-reddit-sentiment)
- [I Had a Job Interview With an AI Recruiter — It Was a Mess (Medium)](https://medium.com/design-bootcamp/i-had-a-job-interview-with-an-ai-recruiter-it-was-a-mess-e0f4fda9e3de)
- [Why AI Interviews Could Be Bad News for Honest Designers — Andy Budd (Medium)](https://medium.com/the-design-coach/why-ai-interviews-could-be-bad-news-for-honest-designers-d693261bb9d0)
- [The Designer's Handbook for Developer Handoff (Figma Blog)](https://www.figma.com/blog/the-designers-handbook/)
- [Web Designer Interview Questions 2025 (TealHQ)](https://www.tealhq.com/interview-questions/web-designer)
- [Figma Interview Questions 2026 (MentorCruise)](https://mentorcruise.com/questions/figma/)
