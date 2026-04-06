# System scoringu — zasady i kalibracja

Kaja ocenia każdego kandydata w dwóch wymiarach → serwer wylicza sumę i decyzję deterministycznie.

## Architektura

```
┌─────────────────────────┐
│  LLM (Kaja) ocenia:     │
│  - wynik_techniczny     │  0-25
│  - wynik_komunikacja    │  0-30
│  - notatki (3-5 zdań)   │
└───────────┬─────────────┘
            │
            ↓
┌─────────────────────────┐
│  Serwer wylicza:        │
│  wynik_lacznie =        │
│    tech + komunikacja   │
│                         │
│  decyzja =              │
│    >=45: Rozmowa        │
│    >=35: Zadanie tech   │
│    >=25: Do przemyśl.   │
│    <25:  Odrzucony      │
└─────────────────────────┘
```

**Dlaczego serwer nie LLM**: LLM mięknął przy sympatycznych kandydatach — dawał "Rozmowa" zamiast "Zadanie techniczne" itp. Deterministyczne wyliczenie = 100% spójność decyzji.

## Progi decyzji

| Suma | Decyzja | Interpretacja |
|---|---|---|
| 45-55 | **Rozmowa** | Silny kandydat → umów rozmowę z Łukaszem |
| 35-44 | **Zadanie techniczne** | OK ale wymaga weryfikacji praktycznej |
| 25-34 | **Do przemyślenia** | Słabszy profil, potencjał ale duże braki |
| 0-24 | **Odrzucony** | Nie pasuje do wymagań |

## Scoring per rola

### WordPress Developer

**Techniczny (max 25)**:
- Doświadczenie WP: <1r=0, 1-2=2, 3-5=4, 5+=5
- Bricks Builder: nie zna=0, podstawy=2-3, aktywny=4-5
- Stack (PHP, CSS, JS, WooCommerce): 0-5
- Portfolio: brak=0, 1 projekt=2, 2-3=3-4, >3=5
- AI w pracy: nie=0, Cursor codziennie=4-5

**Dyskwalifikujące (CAP)**:
- Brak portfolio → tech MAX **8**
- Nie zna żadnego buildera → tech MAX **10**
- <10h/tydzień → komunikacja MAX **15**

### Project Manager

**Techniczny (max 25)**:
- Doświadczenie PM: <1r=0-1, 1-2r=2-3, 3-5r=4, 5+r=5
- Wielozadaniowość: 1-2 proj=2, 3-5=3, 5-8=4, 8+=5
- Narzędzia (ClickUp+): tylko Trello=2, zna ClickUp=4
- Komunikacja z klientem: tylko mail=2, mail+call=4, trudne rozmowy=5
- Wiedza techniczna WP: zero=0, użytkownik=2, rozumie=3-4

**CAP**:
- <1 rok doświadczenia → tech MAX **12**
- Słaby angielski → komunikacja MAX **20**
- Brak przykładów z życia → komunikacja MAX **18**

### Grafik / Designer

**Techniczny (max 25)**:
- Narzędzia (Figma = MUST): bez=0, uczy się=1, podstawy=2-3, dobrze=4, ekspert=5
- Portfolio: brak=0, 1-2=1-2, 3+=3-4, senior-level=5
- Proces (UX thinking): "szkic"=0-1, brief→design=2, research+wireframe=4, full UX=5
- Doświadczenie web/WP: zero=0, 1 proj=2, kilka=3-4, regularnie=5
- AI (Midjourney, Firefly): nie=0, Canva AI=1, moodboardy=3, workflow=5

**CAP**:
- Bez Figmy (tylko Canva) → tech MAX **10**
- Brak portfolio → tech MAX **12**
- Bez projektów web → tech MAX **14**

### AI Specialist

**Techniczny (max 25)**:
- Znajomość modeli/API: tylko ChatGPT UI=0-1, 1 API=2, 2-3=4, porównuje=5
- Promptowanie: zero shot=0-1, few-shot=2-3, zaawansowane=5
- Integracje (RAG): żadne=0, chatbot bez RAG=1-2, RAG=4, production=5
- Narzędzia (n8n, Cursor, MCP): nic=0, n8n=2, Cursor codziennie=3-4, MCP=5
- Portfolio/case studies: żadne=0, 1 projekt=1, 2-3 z metrykami=4-5

**CAP**:
- Brak programowania (Python/JS) → tech MAX **12**
- Tylko ChatGPT UI → tech MAX **8**
- Brak case studies → tech MAX **15**

### Specjalista od automatyzacji

**Techniczny (max 25)**:
- n8n: <6 mies=1-2, 6+ self-hosted=4, 20+ workflow=5
- Integracje API: gotowce=1, REST=2-3, OAuth+webhooks=4-5
- Programowanie (JS/Python): zero=0, code nodes=3, zaawansowany=5
- AI + automatyzacje: nie łączy=0, proste=3, production=5
- Portfolio workflow: <3=1, 3-10=3, 20+=5

**CAP**:
- <6 miesięcy n8n → tech MAX **12**
- Brak programowania → tech MAX **14**
- Brak error handlingu → komunikacja MAX **18**

## Wspólna komunikacja (max 30)

Identyczna struktura dla wszystkich ról. Każdy element 0-5 pkt:

| Kryterium | 0-1 | 3 | 5 |
|---|---|---|---|
| Reakcja na niejasne zadanie | zgaduje | pyta | pyta + proponuje |
| Odpowiedzialność | "nigdy nie popełniam błędów" | przyznaje błąd | + co wyciągnął |
| Jakość odpowiedzi | ogólniki | konkrety | przykłady z kontekstem |
| Dopasowanie (ClickUp, Discord) | nie zna | zna jedno | używa obu |
| Dostępność | <10h=0, 10-20h=2, 20-30h=3, 30+h=5 |
| Stawka | rola-specific |

## Twarde zasady dla LLM

Każdy prompt zawiera sekcję **"TWARDE ZASADY"**:
- ⚠️ Nie zawyżaj punktów za sympatyczność, motywację, szczerość o brakach
- Szczerość = max +1 do komunikacji, nie rekompensuje braku kompetencji
- Dyskwalifikujące są CAP-ami (nie tylko uwagami)

## Kalibracja (przykłady)

Każdy prompt ma sekcję **"KALIBRACJA"** z 4 przykładowymi poziomami:
- Senior (5+ lat, ekspert w głównym narzędziu) → 22-25 tech
- Mid (2-5 lat, solidny stack) → 15-20 tech
- Junior (1-2 lata, luki) → 6-12 tech
- Niekwalifikowany (<1 rok, brak kluczowego narzędzia) → 0-8 tech

## Safety checks

**Check 1**: Jeśli `wynik_techniczny=0 AND wynik_komunikacja=0 AND turns>5` → odrzuć i poproś model o retry.

**Check 2**: LLM nie otrzymuje pól `decyzja` ani `wynik_lacznie` do wypełnienia — nie może się "pomylić".

## Wyniki testów na 10 personach (2026-04-04)

### Senior (powinni dostać "Rozmowa", ≥45 pkt)

| Kandydat | Claude | OpenAI |
|---|---|---|
| Kamil Nowak (WP) | 51 ✅ | 45 ✅ |
| Anna Wiśniewska (PM) | 51 ✅ | 48 ✅ |
| Marta Jabłońska (Grafik) | 51 ✅ | 47 ✅ |
| Łukasz Krawczyk (AI) | 51 ✅ | 53 ✅ |
| Michał Stępień (Automat.) | — | 49 ✅ |

**Wszyscy seniorzy → "Rozmowa"** ✅

### Junior (powinni dostać "Zadanie tech" lub "Do przemyślenia", 25-44 pkt)

| Kandydat | Claude | OpenAI |
|---|---|---|
| Bartek Kowalski (WP) | 28 (Do przemyśl.) | 30 (Do przemyśl.) |
| Piotr Zając (PM) | 28 (Do przemyśl.) | 36 (Zadanie tech) |
| Tomek Wróbel (Grafik) | 32 (Do przemyśl.) | 30 (Do przemyśl.) |
| Natalia Dąbrowska (AI) | 27 (Do przemyśl.) | 30 (Do przemyśl.) |
| Kasia Malinowska (Autom.) | — | 30 (Do przemyśl.) |

**Żaden junior nie dostał "Rozmowa"** ✅ — CAP-y działają.

### Odrzuceni (<25 pkt)

Żaden z 10 testowanych nie został odrzucony. To oczekiwane — żadna z person nie ma np. <1 roku + brak portfolio + brak buildera.

## Zmiana scoringu

Wszystkie zasady są w `src/lib/prompts/*.ts`. Żeby zmienić:

1. Edytuj prompt (np. `src/lib/prompts/wordpress-dev.ts`)
2. Uruchom symulacje: `node simulate-interview-openai.mjs wordpress-dev senior gpt-4o-mini`
3. Sprawdź czy wyniki są zgodne z oczekiwaniami
4. Deploy

Skrypty symulacji **ładują prompty runtime** z plików `.ts` — jedna zmiana = efekt w prod i w testach.
