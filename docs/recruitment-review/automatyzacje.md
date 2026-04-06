# Review rekrutacji: Specjalista od automatyzacji (n8n)

> Deep review promptu `src/lib/prompts/automatyzacje.ts` przygotowany przez senior HR/talent strategist (15+ lat w rekrutacji automation / integration engineerów).
> Data: 2026-04-04
> Cel: wyłowić inżynierów budujących **production-grade n8n workflows** (nie "drag-n-drop hobbystów"), zgodnych z wartościami important.is.

---

## 1. Audyt obecnego promptu

### Co działa dobrze
- **Naturalna, ludzka persona Kai** — ton zgodny z important.is, brak korpo-sztywności.
- **Jedno pytanie na raz + dopytywanie** — dobra heurystyka conversation design.
- **Twarde CAP-y** (np. "<6 miesięcy n8n → MAX 12") — chronią przed inflacją oceny.
- **Podział technical vs komunikacja** — dwuwymiarowy scoring.
- **Kalibracja senior/mid/junior** — sprowadza oceny do wspólnej osi.
- **Konkretne przykłady w rubrykach** (20+ workflow = 5, Uptime Kuma, Notion) — zmniejsza subiektywność.

### Luki i słabości (krytyczne dla tej roli)

1. **Brak pytań wykrywających "production-grade engineer"** vs hobbystę.
   Obecny prompt pyta "ile workflow masz w produkcji" — ale hobbysta też odpowie "15". Nie ma drążenia: **co konkretnie się wysypało, jak naprawiłeś, co zmienił(a)byś dziś**. To jedno pytanie odsiewa 70% słabych kandydatów.

2. **Brak pytań o edge cases w integracjach API**.
   Nie ma nic o: paginacji (cursor vs offset), **rate limitach** (429, backoff), **idempotency keys**, **webhookach bezpieczeństwa** (HMAC signature verification), OAuth refresh tokens, retry strategiach. To serce roli integration engineera — a prompt to pomija.

3. **AI + automatyzacje — powierzchownie**.
   "Łączysz AI z workflow?" to za mało. Brakuje: **kontrola kosztów** (prompt caching, model routing), **hallucinations / guardrails**, **structured output** (JSON schema, function calling), **evals** (jak mierzysz jakość odpowiedzi AI w workflow).

4. **Brak scenariuszy decyzyjnych pod wartości important.is**.
   Wartość #1 "Important over Urgent" — obecny prompt nie pyta **"kiedy ODRADZIŁEŚ automatyzację klientowi?"**. To kluczowe dla thoughtful partnership.

5. **"Workflow się wysypał w nocy" — za płytko**.
   Trzeba drążyć: **jak się dowiedziałeś? jakie alerty? co z danymi które się nie przetworzyły (dead letter queue)? jak zrobiłeś replay?**

6. **Brak pytania o wersjonowanie i deployment**.
   Jak promujesz workflow z dev → prod? Export JSON → git? n8n environments? Kopiujesz ręcznie? To odróżnia juniora od seniora.

7. **Brak mini-testu projektowego (opisowy design exercise)**.
   Samo "opowiedz o workflow" = odfiltrowuje tylko tych, co nic nie mają. Nie odsiewa tych, co mają 20 workflow ale wszystkie są kruche.

8. **Portfolio workflow — brak pytania o skalę i business impact**.
   "20+ workflow" to liczba. A ile z nich **oszczędza klientowi X godzin / tydzień**, ile z nich **żyło >6 miesięcy na produkcji bez większych poprawek**.

9. **Brak pytania o self-hosted n8n specifics**.
   Hetzner Docker — queue mode vs regular, webhook URL + reverse proxy, backup executions DB, upgrade path. important.is hostuje n8n samodzielnie, więc to must-have.

10. **Skrajnie ważne: brak pytania o JavaScript na poziomie code nodes**.
    "Zaawansowany=5" — ale czy kandydat wie co to `$input.all()` vs `$input.first()`, jak obsłużyć async w Code node, jak użyć `$helpers.httpRequest` zamiast zewnętrznego Request, jak debugować code node (logging).

---

## 2. Insights z researchu

### Jak rynek odsiewa hobbystów (synteza z Reddit r/n8n, blogów, Glassdoor n8n.io)

**Red flags (zebrane z wielu źródeł):**
- **"Zrobiłem workflow który skanuje maile" — ale nie wie co się stanie przy 10k maili** (pagination, rate limit Gmail API = 250 quota units/user/sec).
- **"Jak naprawiasz błędy?" → "Restartuję workflow"** — zamiast error trigger + dead letter queue + replay mechanism.
- **Nie rozróżnia retry (transient) vs fallback (permanent)**.
- **Jump to "use GPT-4" przy każdym problemie** — zamiast najpierw zapytać o dane, objętość, budżet.
- **Nie umie wyjaśnić prostym językiem** swoich decyzji technicznych.
- **Niechęć do rozmowy o failures** — najlepsi engineers mają listę lessons learned.
- **Tylko jedno narzędzie** (np. "tylko Make") bez zrozumienia kiedy co wybrać.
- **Brak własnego environment** — nigdy nie self-hostował, tylko n8n Cloud trial.

**Green flags (production-grade engineer):**
- Sam z siebie mówi o **monitoring, alerting, SLA** — zanim go zapytasz.
- Pyta **clarifying questions** zanim zacznie projektować workflow ("a co się stanie jak to padnie w weekend? jakie są wolumeny? czy to jest critical path?").
- **Zna swoje granice** — wie kiedy n8n to zły wybór (np. real-time streaming, heavy compute, regulowane dane bez proper audit trail).
- Ma **konkretne liczby** — "workflow X przetwarza 3k eventów/dzień, error rate 0.4%, P95 latency 800ms".
- Mówi o **kosztach** — egzekucji, API calls, AI tokens.
- **Ma opinie** o tools — "Zapier jest lepszy gdy [X], Make gdy [Y], n8n gdy potrzebuję [Z]".

### Struktura rozmowy wg n8n.io hiring process (Glassdoor)

n8n.io ma 4 etapy + homework 2-4h. Dla important.is wystarczy:
1. **Chat z Kają (AI screening)** — 15-20 min, filtrujące
2. **Technical call z Łukaszem** — deep dive + live workflow review
3. **Opcjonalny take-home** — zaprojektuj workflow (max 2h, płatny)

Obecny prompt = etap 1. Powinien maksymalnie skalibrować go tak, żeby **Łukasz nie marnował czasu na etap 2 z hobbystami**.

### API Integration — must-know concepts (z research 2025/2026)

- **Cursor vs offset pagination** — offset faila przy scrollu i insert'ach.
- **Idempotency keys** — retry bez double-charge.
- **Webhook HMAC signature** — verify sender (Stripe, GitHub webhooki).
- **OAuth refresh token rotation** — kiedy token wygasa, co jak się wyzeruje.
- **Rate limiting strategies** — token bucket, exponential backoff + jitter.
- **Dead Letter Queue** — co robisz z eventem który failnął 5x.

---

## 3. Proponowany zestaw pytań (ulepszony)

### A. Warm-up (30-60s)
1. "Cześć! Jestem Kaja z important.is. Fajnie, że tu trafiłeś/aś. Zanim zaczniemy — podaj imię, email i miasto 😊"
2. "Czym zajmujesz się zawodowo? Jak trafiłeś/aś do automatyzacji — z jakiego tła przyszedłeś/aś?"

### B. n8n depth (4-5 pytań)
3. "n8n self-hosted czy cloud? Jeśli self-hosted — gdzie hostujesz, Docker/queue mode?"
4. "Jakich nodów używasz najczęściej? A które celowo omijasz i czemu?"
5. "Kiedy sięgasz po Code node zamiast zbudować to z gotowych nodów? Dasz konkretny przykład?"
6. "Sub-workflows — używasz? Do czego? Jak przekazujesz dane między nimi?"
7. "Jak deployujesz workflow z dev na prod? Git + export JSON? Ręcznie?"

### C. API integrations (5-6 pytań — SERCE ROLI)
8. "Ostatnia nietrywialna integracja API, którą robiłeś — opowiedz krótko."
9. "Workflow ciągnie 10 000 rekordów z API które daje 100 na stronę. Jak to robisz? Co jak API zmieni numerację stron w trakcie?" *(test pagination — cursor vs offset)*
10. "Dostajesz 429 Too Many Requests od API klienta. Co robisz w n8n?" *(test rate limit + backoff)*
11. "Webhook od Stripe wchodzi do n8n. Jak zweryfikujesz że naprawdę jest od Stripe?" *(test HMAC / signature verification)*
12. "OAuth token wygasł o 3 w nocy. Workflow dalej próbuje pullować dane. Co się dzieje i jak to rozwiązujesz?"
13. "Masz idempotency — wyjaśnij mi dlaczego ważne przy automatyzacji płatności."

### D. Error handling & production-readiness (4-5 pytań — DRUGI RDZEŃ)
14. "Workflow wysypał się w nocy. Opowiedz mi **dokładnie** jak się o tym dowiedziałeś i co robisz dalej."
15. "Error Trigger w n8n — używasz? Co robisz z danymi które failnęły? Dead letter queue?"
16. "Retry on Fail vs Continue on Error — kiedy jedno, kiedy drugie? Przykład."
17. "Jak monitorujesz czy workflow w ogóle się odpala (nie tylko błędy)? Co jak cron przestał chodzić?"
18. "Opowiedz o największym failu w production — co się stało, co straciliście, co zmieniłeś potem."

### E. AI + automation (3-4 pytania)
19. "Łączysz Claude/OpenAI z n8n? Najciekawszy use case?"
20. "Jak kontrolujesz koszty AI w workflow? Prompt caching, model routing, limity?"
21. "AI wygenerowało ci śmieci (wrong JSON, halucynacja). Jak się bronisz w workflow?" *(structured output, validation, retry z poprawką)*
22. "Testujesz jakość AI outputu? Jak?" *(evals, spot checks, human-in-the-loop)*

### F. Portfolio & business impact (3 pytania)
23. "Ile workflow masz realnie w produkcji? (~ liczba, nie szacuj w górę)"
24. "Wybierz jeden workflow z którego jesteś dumny — **jakie liczby**: ile przetwarza na dzień, error rate, ile czasu komuś oszczędza?"
25. "Workflow który żyje >6 miesięcy bez większych poprawek — masz taki? Co w nim zrobiłeś dobrze?"

### G. Wartości important.is (2-3 pytania — KRYTYCZNE)
26. "Klient mówi: 'Automatyzuj mi wszystko'. Jak reagujesz?" *(test Important over Urgent)*
27. "Był kiedyś moment że **odradziłeś** klientowi automatyzację? Dlaczego?" *(test thoughtful partnership)*
28. "Jak tłumaczysz nietechnicznemu klientowi że jego workflow może czasem zawieść i co z tym robicie?" *(test transparent partnership)*

### H. Scenariusze (2-3 sytuacje)
29. **"Workflow generuje faktury dla 200 klientów dziennie. Nagle jeden klient dostaje 7 identycznych faktur. Co robisz — krok po kroku?"**
30. **"Klient prosi: 'Chcę żeby każdy lead z formularza szedł automatycznie do Pipedrive, na Slack, do Google Sheets, do CRM, i żeby AI go oceniło'. Zanim cokolwiek kodujesz — jakie 3 pytania zadajesz?"**
31. **"API klienta z którym integrujesz workflow jest padnięty już 3h. Co robisz ze zbierającymi się danymi?"**

### I. Dokumentacja, styl pracy, dostępność
32. "Jak dokumentujesz workflow? Komentarze w n8n, Notion, diagram?"
33. "Jak pracujesz z klientem — raporty, updates? Samodzielny czy lubisz pair?"
34. "Dostępność godzin/tydzień + stawka B2B PLN/h"

### J. Zamknięcie
35. "Ostatnie pytanie — czego oczekujesz od important.is jako partnera?"
36. "Super, to wszystko [imię]! Dzięki 🙌 Łukasz wróci w kilka dni."
    → `complete_interview`

**Łącznie: ~20-25 faktycznie zadanych pytań** (część to dopytywanie, nie wszystkie pytania z listy idą zawsze). Czas: 18-22 min.

---

## 4. Rekomendacje systemowe

### 4.1 Nowe CAP-y (twardsze)

Dodać do istniejących:
- **Nie rozróżnia retry vs fallback vs DLQ** → `wynik_techniczny MAX 13`
- **Na "workflow padł" odpowiada "restartuję"** → `wynik_techniczny MAX 12`
- **Nie wie co to idempotency / HMAC signature / cursor pagination** → `wynik_techniczny MAX 15`
- **Brak monitoringu (nie mierzy czy workflow się odpala)** → `wynik_komunikacja MAX 18`
- **Nigdy nie odradził klientowi automatyzacji** → `wynik_komunikacja MAX 22` *(red flag pod Important over Urgent)*
- **Nie umie podać liczb z własnych workflow** (throughput, error rate, czas oszczędzony) → `wynik_techniczny MAX 16`
- **Nigdy nie self-hostował n8n** → `wynik_techniczny MAX 17` *(important.is hostuje na Hetzner Docker)*

### 4.2 Jak wykryć production-grade engineer vs hobbystę (heurystyki Kaji)

| Pytanie | Hobbysta mówi | Production engineer mówi |
|---|---|---|
| "Workflow padł w nocy" | "Restartuję" / "Sprawdziłem rano" | "Dostałem alert na Slack/Uptime Kuma, sprawdziłem error trigger, replay failed items z DLQ" |
| "Ile w produkcji?" | "Dużo, z 20+" (bez liczb) | "23 aktywne, z czego 8 critical — te monitoruję osobno" |
| "429 od API" | "Czekam i próbuję jeszcze raz" | "Exponential backoff z jitter, respektuję Retry-After header, circuit breaker jeśli >5 min" |
| "Klient: automatyzuj wszystko" | "OK, zaczynam" | "Najpierw mapping procesu, priorytetyzacja po ROI, zaczynamy od 1-2 workflow z highest impact" |
| "AI halucynuje" | "Zmieniam prompt" | "Structured output + JSON schema validation + retry z feedback loop + fallback do human review" |
| "Dokumentacja" | "Mam w głowie" / "Komentarze w workflow" | "Notion: purpose, trigger, inputs, outputs, failure modes, runbook dla on-call" |
| "Kiedy NIE n8n?" | (nie ma opinii) | "Real-time streaming, heavy compute, regulated data bez audit trail, vendor lock-in concerns" |

### 4.3 Mini-test projektowy (opisowy, w chacie)

Jeśli kandydat przechodzi warm-up + n8n depth z wynikiem >15, Kaja może dodać **design exercise** (1 pytanie, 2-3 min na odpowiedź):

> "Szybki design: klient e-commerce chce, żeby każde nowe zamówienie w WooCommerce szło do n8n i:
> (1) poszło fakturowanie do fakturownia.pl,
> (2) powiadomienie na Slack do księgowej,
> (3) update w Google Sheets dla CEO,
> (4) jeśli wartość >5000 PLN, AI ma wygenerować personalizowany email powitalny.
>
> Opisz **architekturę workflow** w 4-6 zdaniach. Co musisz przewidzieć żeby to działało stabilnie przez pół roku?"

**Co oceniamy:**
- Czy wspomina error handling / retry na każdym zewnętrznym call?
- Czy myśli o idempotency (co jeśli webhook przyjdzie 2x)?
- Czy pyta o wolumen (ile zamówień/dzień)?
- Czy sub-workflow / modular design?
- Czy wspomina monitoring / alerts?
- Czy myśli o kosztach AI (tylko >5k PLN = ograniczenie scope)?
- Czy rozdziela logikę — kolejność, zależności, fallbacks?

**Scoring mini-test (0-5):**
- 0-1: linearny happy path, brak error handling
- 2-3: wspomina error handling ale nie idempotency/monitoring
- 4: pyta o wolumen, myśli modularnie, error branches
- 5: production-ready thinking — DLQ, monitoring, cost control, idempotency, sub-workflows

### 4.4 Rozkład czasu rozmowy

- Warm-up: 1 min
- n8n depth: 3 min
- API integrations: **5-6 min** (najwięcej — to serce roli)
- Error handling: **4-5 min** (drugi rdzeń)
- AI + automation: 2-3 min
- Portfolio / liczby: 2 min
- Wartości important.is: 2 min
- Scenariusze: 2-3 min
- Dokumentacja / dostępność / stawka: 1-2 min
- Zamknięcie: 30s
- **RAZEM: 18-22 min**

---

## 5. Konkretne zmiany w promptcie (top 5)

### Zmiana #1 — Dodać sekcję "API integrations — deep dive"
**Obecnie:** jedno zbiorcze pytanie "REST, webhooks, OAuth — doświadczenie?".
**Zmiana:** rozbić na 3-4 konkretne pytania z sekcji C powyżej (paginacja, 429, webhook HMAC, OAuth refresh). To najsilniejszy odsiewacz hobbystów.

### Zmiana #2 — Pogłębić "workflow padł w nocy"
**Obecnie:** "Workflow się wysypał w nocy — jak reagujesz?"
**Zmiana:** 3 pytania zagłębiające:
1. Jak się dowiedziałeś?
2. Co robisz z danymi które failnęły (DLQ, replay)?
3. Opowiedz o największym failu w production — co zmieniłeś potem?

### Zmiana #3 — Dodać pytania o wartości important.is
Dodać sekcję "Wartości" (sekcja G):
- "Kiedy ODRADZIŁEŚ klientowi automatyzację?" *(Important over Urgent)*
- "Jak tłumaczysz klientowi że workflow może zawieść?" *(Transparent Partnership)*

Bez tego Kaja nie mierzy culture fit z top 5 values.

### Zmiana #4 — Pytania o **liczby** z portfolio
**Obecnie:** "Ile workflow masz w produkcji?"
**Zmiana:**
- Ile w produkcji? (konkretna liczba)
- Wybierz 1 workflow: throughput/dzień, error rate, godziny oszczędzone klientowi?
- Masz workflow który żyje >6 mies. bez poprawek?

To jedno pytanie o **konkretne liczby** = natychmiastowy red flag jeśli kandydat szacuje w górę.

### Zmiana #5 — Nowe CAP-y (sekcja 4.1) + mini design exercise (sekcja 4.3)
Dodać do promptu:
- twarde CAP-y wykrywające hobbystów (9 nowych reguł)
- opcjonalny design exercise jeśli kandydat >15 pkt po sekcji n8n depth
- heurystyki Kaji (tabela hobbysta vs engineer) jako wewnętrzny guide

---

## Załącznik: fragment zaktualizowanego promptu (draft do wdrożenia)

```typescript
// Fragment — sekcja Scoring — TWARDE ZASADY (rozszerzona)

### Dyskwalifikujące (= CAP) — ROZSZERZONE
- **<6 miesięcy n8n** → wynik_techniczny MAX 12
- **Brak programowania JS** → wynik_techniczny MAX 14
- **Brak error handling/monitoring** → wynik_komunikacja MAX 18
- **Brak dokumentacji workflow** → wynik_komunikacja MAX 22
- **"Restartuję" jako odpowiedź na failure** → wynik_techniczny MAX 12
- **Nie zna idempotency / HMAC / cursor pagination** → wynik_techniczny MAX 15
- **Nigdy nie self-hostował n8n** → wynik_techniczny MAX 17
- **Nigdy nie odradził klientowi automatyzacji** → wynik_komunikacja MAX 22
- **Brak konkretnych liczb z portfolio** → wynik_techniczny MAX 16
- **Jump to "use GPT-4" bez pytania o dane/wolumen** → wynik_techniczny MAX 15
```

---

## TL;DR dla Łukasza

**3 najważniejsze zmiany (jeśli masz 10 minut):**

1. **Dodaj 4 pytania o API integrations** (paginacja, 429, webhook HMAC, OAuth refresh) — to 90% odsiewu hobbystów.
2. **Drąż "failure stories"** — "opowiedz o największym failu, co zmieniłeś potem" wykrywa Continuous Learning i Craftsmanship.
3. **Dodaj 2 pytania pod wartości** — "kiedy odradziłeś automatyzację?" + "jak tłumaczysz ryzyko klientowi?" — to Important over Urgent + Transparent Partnership.

Obecny prompt ma solidny szkielet, ale **nie ma nic co odróżnia kogoś kto zbudował 5 kruchych workflow od kogoś, kto prowadzi 20 production systemów przez rok bez incydentów**. Powyższe zmiany to naprawiają.

---

## Źródła

- [n8n.io Interview Experience & Questions — Glassdoor](https://www.glassdoor.com/Interview/n8n-io-Interview-Questions-E3416349.htm)
- [How to Hire a Remote n8n Expert — hireinsouth.com](https://www.hireinsouth.com/post/need-an-n8n-expert-a-step-by-step-guide-to-hiring-automation-talent)
- [n8n Development Company: What to Look For — lowcode.agency](https://www.lowcode.agency/blog/n8n-development-company)
- [Hire Top AI Automation Engineers — secondtalent.com](https://www.secondtalent.com/hire-developers/ai-automation-engineer/)
- [How to Hire an Automation Engineer — hirecruiting.com](https://www.hirecruiting.com/newsroom/how-to-hire-an-automation-engineer/)
- [API Design Interview Framework 2026 — prachub.com](https://prachub.com/resources/api-design-interview-framework-step-by-step-guide-2026)
- [10 critical REST API interview questions — merge.dev](https://www.merge.dev/blog/rest-api-interview-questions)
- [REST API Interview Questions 2026 — DataCamp](https://www.datacamp.com/blog/rest-api-interview-questions)
- [15 best practices for deploying AI agents in production — n8n Blog](https://blog.n8n.io/best-practices-for-deploying-ai-agents-in-production/)
- [n8n Error Handling — n8n Docs](https://docs.n8n.io/flow-logic/error-handling/)
- [n8n Best Practices — till-freitag.com](https://till-freitag.com/en/blog/n8n-best-practices-guide-en)
- [n8n Monitoring and Alerting Setup — wednesday.is](https://www.wednesday.is/writing-articles/n8n-monitoring-and-alerting-setup-for-production-environments)
- [n8n Error Handling Complete Guide 2026 — nextgrowth.ai](https://nextgrowth.ai/n8n-workflow-error-alerts-guide/)
- [10 n8n Best Practices for Reliable Workflow Automation — Contabo](https://contabo.com/blog/10-n8n-best-practices-for-reliable-workflow-automation/)
