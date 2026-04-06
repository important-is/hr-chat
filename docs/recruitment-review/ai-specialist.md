# Review rekrutacji: AI Specialist

**Data:** 2026-04-04
**Autor:** Senior HR/Talent Strategist (review)
**Plik źródłowy:** `/Users/lukaszek/Projects/important/hr-chat/src/lib/prompts/ai-specialist.ts`
**Cel:** Wyłowić ludzi którzy BUDUJĄ AI products z realnym ROI — nie entuzjastów którzy "bawili się w ChatGPT" i chcą dopisać "AI Specialist" do LinkedIn.

---

## 1. Audyt obecnego promptu

### Co działa dobrze

- **Jasne rozróżnienie "ChatGPT user vs AI engineer"** — już w powitaniu i w scoringu ("Używam ChatGPT codziennie ≠ AI Specialist"). Mocna postawa.
- **Twarde CAP-y** — brak programowania = max 12 tech, brak API = max 8. To ratuje przed inflacją wyniku.
- **Kalibracja z konkretnymi poziomami** (Senior/Mid/Junior/Enthusiast) — rekruter (AI) ma reference points.
- **Nacisk na portfolio z metrykami** — kategoria "Portfolio/case studies" dobrze ważona.
- **Pytania o stack agencji** (n8n, Cursor, MCP, Vector DB, Claude/OpenAI) — pasują do realnego stacku important.is.
- **"Klient chce 'coś z AI' ale nie wie co"** — świetne pytanie behawioralne, testuje consulting mindset.

### Słabe strony / braki

1. **Pytania są zbyt ogólne i łatwe do "sprzedania bullshitu"**
   - "Promptowanie: jak zaawansowane?" — kandydat odpowie "bardzo zaawansowane, używam chain-of-thought". Nic nie wiemy.
   - "Budowałeś RAG?" — "Tak" i koniec. Brak deep-dive.
   - Brak pytań weryfikujących ROZUMIENIE (dlaczego działa / kiedy zawodzi).

2. **Zero scenariuszy produkcyjnych**
   - Brak pytania o hallucinations i jak je mitygować
   - Brak pytania o cost optimization (token usage, tiered model selection)
   - Brak pytania o evaluation metrics (jak mierzysz że RAG działa lepiej?)
   - Brak o latency / caching / failure modes

3. **Brak "differentiators"** — pytań które odróżniają ChatGPT usera od engineera
   - Nie pyta o różnice między modelami (Claude 4 vs GPT-5 vs Gemini 2.5 — kiedy którego używasz?)
   - Nie pyta o tokenization / context window / structured output (tool use, JSON mode)
   - Nie pyta o embedding strategy / chunking strategy / re-ranking

4. **Portfolio review jest za płytkie**
   - "Opisz 2-3 projekty" → kandydat opowie co zrobił, ale nie MUSI podać metryki baseline → delta.
   - Brak pytania "co byś zrobił inaczej" (testuje samoświadomość — red flag według research: brak samorefleksji = trial-and-error mindset).

5. **Brak mini-testu na żywo**
   - Research jednoznacznie wskazuje: **live prompt challenge** to najlepszy filter. Obecny prompt nie ma żadnego mini-zadania.

6. **Brak weryfikacji wartości important.is**
   - "Important over Urgent", "Transparent Partnership" (honesty o limitach AI) — nie są testowane wcale.
   - Agencja buduje na uczciwości — kandydat powinien umieć powiedzieć klientowi "nie, AI tego nie zrobi dobrze".

7. **Scoring nie premiuje "honesty about limits"**
   - "AI może wszystko" = -score, ale **brak** pozytywnego scoringu za mówienie o limitach, hallucinations, edge cases.

8. **Pytanie o stawkę zbyt wcześnie / bez kontekstu**
   - "80-130 PLN=5" — bez rozróżnienia czy to junior/senior, per hour / per project. W 2026 stawki AI są wyższe niż WordPress dev.

---

## 2. Insights z researchu

Na podstawie 4 web searches (DataCamp, Overture Partners, ThirstySprout, Confident AI, LangChain State of AI Agents 2026, i in.):

### Red flags dla AI engineera (wg research 2026)

| Red flag | Dlaczego źle | Jak wykryć |
|---|---|---|
| **"Magic prompt" mindset** | Wierzą że istnieje idealny prompt do odkrycia — nie iteracyjny engineering | "Opowiedz o prompcie którego iterowałeś 5+ razy — co zmieniałeś i dlaczego?" |
| **Trial-and-error bez wyjaśnienia WHY** | Nie rozumieją model behavior, tylko klikają | "Dlaczego ten prompt działa lepiej od tamtego?" |
| **Vague claims o "improved quality"** | Brak baseline, brak metryk | "Jak zmierzyłeś że po zmianie jest lepiej? Jaki był baseline?" |
| **Traktowanie modeli jako interchangeable** | Nie rozumieją differentiators Claude vs GPT vs Gemini | "Kiedy wybrałbyś Claude vs GPT-5? Daj konkretny przykład" |
| **Tylko teoria, bez production context** | Potrafi wyjaśnić RAG, nie zna kosztów/latencji/failure modes | "Ile kosztował ostatni RAG który zrobiłeś? Jak optymalizowałeś?" |
| **"AI może wszystko"** | Brak świadomości limitów | "Kiedy AI NIE jest dobrym rozwiązaniem?" |
| **Brak samorefleksji** | "Wszystko działa super" = nie produkcyjny | "Co byś zrobił inaczej w tym projekcie?" |

### Must-have topics w 2026 (według DataCamp, InterviewBit, Confident AI)

- RAG architecture end-to-end (chunking, embedding, retrieval, re-ranking, generation)
- Evaluation metrics: **faithfulness, context relevance, answer correctness, hallucination rate**
- LLM observability (tokens, latency, cost per call)
- Prompt engineering **for production** (nie tylko "few-shot") — structured output, tool use, system prompts, guardrails
- Model selection tradeoffs (capability vs cost vs latency)
- Hallucination mitigation (grounding, citations, verification layers)
- Agent design patterns (kiedy agent, a kiedy prosty pipeline)

### Distinguishing question (research): "Live prompt challenge"

> "Daj kandydatowi realistyczne zadanie z Twojego use case. Obserwuj JAK dekomponuje problem, JAKIE zadaje pytania, JAK strukturyzuje prompt, i JAK reaguje gdy nie działa. Proces iteracji = ocena."

W chatbotowej rekrutacji (jak HR chat) możemy to zasymulować: poprosić o **opis podejścia** (text) do konkretnego zadania.

### Insights specyficzne dla AGENCJI (nie product company)

- Agencja rekrutuje AI Specialist który BĘDZIE ROZMAWIAĆ Z KLIENTAMI — communication > teoria ML
- Case studies z ROI są kluczowe bo agencja musi sprzedawać wyniki klientom
- "Full-stack AI" — od dyskovery warsztatu z klientem po deployment + support
- Rzadko fine-tuning, głównie API-based (Claude, GPT, Gemini) + RAG + tooling

---

## 3. Proponowany zestaw pytań (ulepszony)

> **Zasada:** JEDNO pytanie na raz. Dopytuj 1-2x jeśli odpowiedź ogólnikowa. Po serii follow-upów idź dalej (budżet: ~18-20 pytań w 15 min).

### 3.1 Warm-up (2 min)

- "Cześć! Jestem Kaja z important.is. Podaj imię i nazwisko 😊"
- "Email i miasto?"
- "W dwóch zdaniach — czym zajmujesz się w AI na co dzień?"

**Ocena:** jakość komunikacji, konkretność.

### 3.2 Znajomość modeli i API — technical depth (3 min)

1. **"Z jakich modeli korzystasz w pracy? I teraz konkret — kiedy wybierasz Claude, kiedy GPT, kiedy coś innego? Daj przykład decyzji z ostatnich tygodni."**
   - Szukamy: rozróżnia modele (Claude dobry w long-context/coding, GPT w tooluse, Gemini w multimodal), ma racjonalne kryteria
   - Red flag: "używam ChatGPT bo najlepszy", "wszystkie są podobne"

2. **"Co to jest context window i dlaczego jest ważne w produkcyjnym systemie?"** (lekki technical probe)
   - Szukamy: rozumie limity, pricing per token, truncation strategies
   - Red flag: nie wie / "żeby więcej napisać"

3. **"Structured output / tool use / JSON mode — używałeś? Opisz konkretny case."**
   - Szukamy: rozumie function calling, schema validation, output parsing
   - Red flag: "nie trzeba, parsuję tekst regexpami"

### 3.3 Promptowanie — engineering, nie hobby (3 min)

4. **"Opowiedz o prompcie nad którym pracowałeś iteracyjnie. Jaki był pierwszy draft, co nie działało, co zmieniłeś w kolejnych wersjach i dlaczego to pomogło?"**
   - Szukamy: proces, model behavior understanding, iteration
   - Red flag: "napisałem i działało od razu" / brak wyjaśnienia WHY

5. **"Jak sprawdzasz czy nowa wersja promptu jest LEPSZA od starej? Jakich metryk używasz?"**
   - Szukamy: eval sets, A/B, manual review na próbce, LLM-as-judge, faithfulness score
   - Red flag: "na oko", "testuję i widzę że lepiej"

6. **"System prompt vs user prompt — jak dzielisz odpowiedzialności?"**
   - Szukamy: rozumie hierarchię, role, stabilność instrukcji
   - Red flag: "nie rozróżniam", "wszystko wrzucam do usera"

### 3.4 RAG i integracje (3 min)

7. **"Zbudowałeś system RAG? Przeprowadź mnie przez architekturę — od dokumentu do odpowiedzi."**
   - Szukamy: chunking strategy, embedding model, vector DB, retrieval (top-k, hybrid, re-ranker), grounding w odpowiedzi, citations
   - Red flag: "wrzucam PDF do ChatGPT" / nie rozróżnia embeddings od generation

8. **"Twój RAG zwrócił odpowiedź bez źródła albo zmyślił — jak to wykrywasz i co robisz?"**
   - Szukamy: faithfulness/groundedness checks, citation attribution, fallback, human-in-loop
   - Red flag: "nie zdarza się", "nie testowałem"

9. **"Jak skalowałbyś RAG z 100 dokumentów do 100 000?"** (scenariusz)
   - Szukamy: chunking revisited, hierarchical retrieval, metadata filtering, query routing, koszty
   - Red flag: "zwiększę top-k"

### 3.5 Narzędzia (n8n, Cursor, MCP, Vercel AI SDK, Claude Agent SDK) (2 min)

10. **"Automatyzacje — n8n, Make, Zapier? Pokaż workflow który zbudowałeś z AI node'ami. Co robił, jakie było wyzwanie?"**
    - Szukamy: konkretny flow z biznesowym sensem
    - Red flag: "tylko tutoriale"

11. **"MCP (Model Context Protocol) — używasz? Budowałeś własny MCP server?"**
    - Szukamy: rozumie co to, może dał jakiś konkret
    - Red flag: "nie słyszałem" (OK dla mid, nie OK dla senior)

12. **"Cursor / Claude Code / Cline — który code assistant, dlaczego, i jaki masz flow pracy z nim?"**
    - Szukamy: używa codziennie, ma opinię, widzi limity
    - Red flag: "używałem raz"

### 3.6 Case studies z metrykami — PRODUCTION focus (3 min)

13. **"Opisz jeden projekt AI który wdrożyłeś do produkcji. Baseline ZANIM, co dokładnie zrobiłeś, i jaki był mierzalny efekt?"**
    - Szukamy: przed/po, liczby (czas ↓X%, koszt ↓Y PLN/mc, NPS ↑, ticketów ↓)
    - Red flag: "klientowi się podobało", "szybciej robi X"

14. **"Ile kosztował ten system miesięcznie w API / infrastrukturze? Jak optymalizowałeś koszty?"**
    - Szukamy: zna liczby, wie o caching, prompt compression, mniejsze modele do routing, batching
    - Red flag: "nie wiem, klient płaci"

15. **"Co byś zrobił inaczej w tym projekcie? Jaki był największy fail?"**
    - Szukamy: samoświadomość, post-mortem mindset
    - Red flag: "wszystko wyszło super"

### 3.7 Mini-scenariusz (2 min) — KRYTYCZNE

16. **"Klient agencji ma bloga WordPress z 500 artykułami i chce 'AI chatbota który odpowiada na pytania klientów korzystając z treści bloga'. Masz 5 zdań — jak podchodzisz? Od czego zaczynasz?"**
    - Szukamy:
      - Discovery FIRST ("jakie pytania klienci zadają najczęściej?", "kto użytkownik?")
      - RAG jako default (nie fine-tuning)
      - Konkretny stack (embedding model, vector DB, model generacji)
      - Eval plan (jak zmierzymy że działa)
      - Limity ("to nie zastąpi supportu w N% przypadków")
    - Red flag:
      - "Wrzucę PDFy do ChatGPT Assistant"
      - "Najpierw finetune GPT na artykułach"
      - "Zrobię w Dify w 2h"
      - Zero pytań do klienta

### 3.8 Wartości important.is (2 min)

17. **"Klient mówi 'chcę agenta AI który sam napisze wszystkie posty na blog i publikuje bez nadzoru'. Jak odpowiadasz?"**
    - Szukamy: **Transparent Partnership** — mówi o limitach (hallucinations, brand voice, fact-check, SEO quality), proponuje human-in-loop, NIE obiecuje magii
    - Red flag: "OK, n8n + GPT-5 i gotowe" / "tak, da się"

18. **"Kiedy AI NIE jest dobrym rozwiązaniem biznesowym?"**
    - Szukamy: **Thoughtful Everything** — ma opinię (kiedy deterministyczne regułki wystarczą, gdy ryzyko błędu wysokie, gdy koszt > benefit)
    - Red flag: "zawsze jest dobrym"

19. **"AI się zmienia co miesiąc. Jak na bieżąco jesteś? Co przeczytałeś/przetestowałeś w ostatnich 2 tygodniach?"**
    - Szukamy: **Continuous Learning** — konkretne źródła (papers, Simon Willison, Swyx, Anthropic/OpenAI blogs, Discord communities), test new models hands-on
    - Red flag: "LinkedIn" / "Twitter ogólnie"

### 3.9 Styl pracy i zamknięcie (2 min)

20. "Jak organizujesz pracę? Pasuje Ci ClickUp + Discord? Komunikacja async — OK?"
21. "Dostępność tygodniowa? Stawka (godzinowa/projektowa)?"
22. Zamknięcie — "Dzięki za czas! Łukasz wróci w ciągu kilku dni. Trzymaj się 🚀"

---

## 4. Rekomendacje systemowe

### 4.1 Nowe CAP-y (dyskwalifikujące / limitujące)

| Warunek | Max wynik techniczny |
|---|---|
| Brak programowania (Python/JS/TS) | **10** (obniżam z 12 — w 2026 to już baseline) |
| Tylko ChatGPT UI, żadnego API | **6** (obniżam z 8) |
| Brak case studies z metrykami | **14** |
| "AI może wszystko" bez konkretów | cap komunikacja = **16** |
| Nie zna różnic między modelami (Claude/GPT/Gemini traktuje jako = ) | **15** |
| Brak świadomości hallucinations / eval | **14** |
| **NOWY:** Nie wymienia ŻADNYCH metryk eval (faithfulness, answer correctness, hit rate, etc.) | **16** |
| **NOWY:** Obiecuje magię klientowi (Q17) — brak transparency | cap wartości = **3/5 max** |
| **NOWY:** Zero "co byś zrobił inaczej" / brak samorefleksji | cap komunikacja = **17** |

### 4.2 Jak wykryć "ChatGPT user" vs "AI engineer" (5 sygnałów)

| Sygnał | ChatGPT user | AI engineer |
|---|---|---|
| **Pytania 2-3 (API, context window)** | "Używam na stronie OpenAI" | "Claude 200k context, GPT-5 1M, ale effective context drops ~30% po 100k" |
| **Pytanie 4 (iteracja promptu)** | "Dodałem 'please' i było lepiej" | "Zauważyłem że model halucynował na X, dodałem few-shot z negatywnymi przykładami + structured output schema, faithfulness ↑ z 72% do 91%" |
| **Pytanie 5 (jak mierzysz)** | "Na oko", "czuję że lepiej" | Eval set + metryki (LLM-as-judge, human review na próbce N, A/B) |
| **Pytanie 14 (koszty)** | "Nie wiem, klient płaci" | "$180/mc, optymalizowałem przez prompt caching + routing do Haiku dla prostych queries" |
| **Pytanie 17 (obietnice klientowi)** | "Da się zrobić" | "Tu są 3 ryzyka — pokażę na POC co działa, a co wymaga human-in-loop" |

### 4.3 Mini-test: podejście do konkretnego problemu biznesowego

**Wbudowany w pytanie 16** — scenariusz blog chatbot. To "live prompt challenge" zaadaptowany do formatu czatowego.

**Scoring mini-testu (0-5):**
- 0-1: "wrzucę do ChatGPT Assistant" / "finetune"
- 2: wie że RAG, ale bez kroków
- 3: wymienia stack i eval, ale bez discovery
- 4: discovery → architektura → eval plan → koszt estimate
- 5: j.w. + mówi o limitach i human-in-loop + konkretne modele z uzasadnieniem

### 4.4 Dodanie kategorii do scoringu: **"Production mindset"** (max 10)

Nowa podkategoria w Kompetencje AI (lub osobno):

| Aspekt | 0-2 | 3 | 4-5 |
|---|---|---|---|
| **Evaluation** | "na oko" | wie o metrykach | eval set + monitoring w prod |
| **Koszt / observability** | nie myśli o tym | zna token pricing | aktywnie optymalizuje (caching, routing, compression) |
| **Failure modes / hallucinations** | "nie zdarzają się" | wymienia problemy | ma strategię mitigation (grounding, verification, HITL) |
| **Samoświadomość** | "wszystko działa" | wie co poprawić | ma post-mortemy z nauką |

---

## 5. Konkretne zmiany w promptcie (top 5)

### Zmiana 1: Rozbij pytania "general" na pytania-sondy z follow-upem

**Teraz:**
```
- Promptowanie: jak zaawansowane? Opisz najciekawszy use case.
```

**Nowe:**
```
- "Opowiedz o prompcie nad którym pracowałeś iteracyjnie. Pierwszy draft, co nie działało, co zmieniłeś i dlaczego?"
- [Follow-up 1] "Jak zmierzyłeś że nowa wersja jest lepsza? Jaki był baseline?"
- [Follow-up 2] "System prompt vs user prompt — jak dzielisz odpowiedzialności?"
```

### Zmiana 2: Dodaj mini-scenariusz biznesowy (pytanie 16)

Wstaw po portfolio, przed wartościami:

```
"Klient agencji ma bloga WordPress z 500 artykułami i chce 'AI chatbota
który odpowiada na pytania klientów korzystając z treści bloga'.
Masz 5 zdań — jak podchodzisz? Od czego zaczynasz?"
```

Scoruj osobno (0-5) w kategorii Myślenie biznesowe.

### Zmiana 3: Dodaj pytania weryfikujące WARTOŚCI (Transparent Partnership + Thoughtful)

Nie ma ich w obecnym promptcie. Dodaj:

```
- "Klient chce agenta AI który sam pisze i publikuje na bloga bez nadzoru — co odpowiadasz?"
  (testuje: honesty o limitach, human-in-loop)
- "Kiedy AI NIE jest dobrym rozwiązaniem?"
  (testuje: thoughtful, nie-hype)
- "Co przeczytałeś/przetestowałeś z AI w ostatnich 2 tygodniach?"
  (testuje: continuous learning)
```

### Zmiana 4: Dodaj production-focus do scoringu

**Teraz (sekcja Kompetencje AI):**
```
- Portfolio/case studies: żadne=0, 1 projekt=1-2, 2-3 z metrykami=4-5
```

**Nowe (dodaj jako osobną kategorię lub podkategorię):**
```
### Production mindset (max 5 — nowa kategoria w Kompetencje AI)
- Nie myśli o kosztach/eval/failure modes = 0-1
- Wie że istnieją, nie stosował = 2
- Ma eval set LUB monitoring kosztów = 3
- Ma eval + cost optimization + hallucination mitigation = 5
```

Podnieś max Kompetencje AI do **30** (z 25) — technical depth jest ważniejszy niż był w v1.

### Zmiana 5: Dodaj 3 nowe CAP-y

Do sekcji "Dyskwalifikujące":
```
- **Nie zna różnic Claude/GPT/Gemini (traktuje jako interchangeable)** → wynik_techniczny MAX 15
- **Zero metryk evaluation (faithfulness, hit rate, LLM-as-judge...)** → wynik_techniczny MAX 16
- **Obiecuje magię klientowi (scenariusz "agent pisze sam") bez limitów** → wynik_komunikacja MAX 16
- **Zero samorefleksji ("wszystko wyszło super", brak "co bym zrobił inaczej")** → wynik_komunikacja MAX 17
```

### Bonus: Zmiana tonu powitania

**Teraz:**
> "Szukamy kogoś kto ogarnia AI nie tylko z perspektywy 'popisz prompty'..."

**Propozycja:**
> "Szukamy kogoś kto BUDUJE produkty z AI — integruje API, mierzy ROI, potrafi powiedzieć klientowi 'nie, AI tego nie zrobi dobrze'. Nie szukamy entuzjastów, szukamy inżynierów. Rozmowa 15 minut, będę dopytywać o konkrety 😊"

Filtruje kandydatów już na wejściu — entuzjasta bez produktów poczuje się niekomfortowo.

---

## Appendix: Lista czerwonych flag (quick reference dla Kai)

Podczas rozmowy, jeśli usłyszysz — obniż wynik / dopytaj:

| Fraza kandydata | Red flag |
|---|---|
| "Wszystkie modele są podobne" | Brak differentiation |
| "Na oko widać że lepiej" | Brak eval |
| "Nie wiem ile kosztowało" | Brak production exposure |
| "Wszystko wyszło super" | Brak samoświadomości |
| "AI może wszystko" | Over-promising, brak thoughtfulness |
| "Da się zrobić" (bez pytań do klienta) | Brak discovery mindset |
| "ChatGPT / Tidio / Dify i gotowe" | No-code user, nie engineer |
| "Nie testowałem w produkcji" | Hobbyist |
| "Finetune GPT na tym" (do prostego QA use case) | Nie rozumie RAG vs fine-tuning |
| "Copy-paste z Twittera" (gdy pytany o learning) | Powierzchowne info |

## Appendix: Green flags (premiuj w scoringu)

| Fraza kandydata | Green flag |
|---|---|
| "Zrobiłem eval set 50 pytań, mierzyłem faithfulness" | Production mindset |
| "Claude dla long-context/code, GPT dla tool use, Haiku dla routingu" | Model differentiation |
| "Caching obniżył koszt z $X do $Y" | Cost optimization |
| "Wprowadziłem human-in-loop bo w 8% przypadków halucynacja" | Honesty + mitigation |
| "Klient chciał X, ale po discovery okazało się że potrzebuje Y" | Consulting mindset |
| "Testowałem Claude 4.5 w zeszłym tygodniu na tym zadaniu — lepsze od poprzedniej wersji w Z" | Continuous learning |
| "Co bym zrobił inaczej — chunking był za duży, powinienem był..." | Samorefleksja |
| "To nie jest dobry use case dla AI, bo deterministic rules wystarczą" | Thoughtful |

---

**Podsumowanie:** obecny prompt jest solidnym v1 z dobrymi CAP-ami, ale pozwala kandydatowi-entuzjaście "prześlizgnąć się" przez ogólnikowe pytania. Kluczowe zmiany: (1) pytania sondujące WHY/HOW zamiast WHAT, (2) mini-scenariusz biznesowy jako live test, (3) weryfikacja wartości important.is (transparency, thoughtfulness), (4) nowa kategoria scoring "Production mindset", (5) dodatkowe CAP-y na "traktuje modele jako interchangeable", "brak eval", "obiecuje magię".

## Sources (research)

- [AI Engineer Interview Questions 2026 - Careery](https://careery.pro/blog/ai-careers/ai-engineer-interview-questions)
- [LLM Interview Questions 2026 - DataCamp](https://www.datacamp.com/blog/llm-interview-questions)
- [Top 30 RAG Interview Questions 2026 - DataCamp](https://www.datacamp.com/blog/rag-interview-questions)
- [LLM Interview Questions & Answers 2026 - LockedInAI](https://www.lockedinai.com/blog/llm-interview-questions-answers-complete-guide-engineers)
- [How to Vet AI Prompt Engineers - Overture Partners](https://overturepartners.com/it-staffing-resources/how-to-vet-ai-prompt-engineers-before-you-hire)
- [Top 10 AI Engineer Interview Questions - ThirstySprout](https://www.thirstysprout.com/post/ai-engineer-interview-questions)
- [LLM Evaluation Metrics Guide - Confident AI](https://www.confident-ai.com/blog/llm-evaluation-metrics-everything-you-need-for-llm-evaluation)
- [Hallucination Evaluation Frameworks 2025 - Maxim AI](https://www.getmaxim.ai/articles/hallucination-evaluation-frameworks-technical-comparison-for-production-ai-systems-2025/)
- [LLM Observability - Uptrace](https://uptrace.dev/glossary/llm-observability)
- [AI Engineer vs Prompt Engineer 2026 - Zen van Riel](https://zenvanriel.com/job/ai-engineer-vs-prompt-engineer/)
