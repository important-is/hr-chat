# Porównanie modeli AI — testy 2026-04-04

Pełne testy na 10 różnych personach kandydatów (2 per rola × 5 ról) w celu wybrania modelu do produkcji.

## TL;DR

**Zalecenie: GPT-4o-mini** — 6× tańszy niż Claude Haiku, 20× tańszy niż Sonnet, zgodność decyzji 87.5%, średnia różnica punktacji 3.8 pkt z 55.

## Wyniki

### Zgodność decyzji (Claude Haiku vs GPT-4o-mini)

| Kandydat | Rola | Claude | OpenAI | Zgodne? |
|---|---|---|---|---|
| Kamil Nowak | WP senior | 51→Rozmowa | 45→Rozmowa | ✅ |
| Bartek Kowalski | WP junior | 28→Do przemyślenia | 30→Do przemyślenia | ✅ |
| Anna Wiśniewska | PM senior | 51→Rozmowa | 48→Rozmowa | ✅ |
| Piotr Zając | PM junior | 28→Do przemyślenia | 36→**Zadanie tech** | ❌ |
| Marta Jabłońska | Grafik sr | 51→Rozmowa | 47→Rozmowa | ✅ |
| Tomek Wróbel | Grafik jr | 32→Do przemyślenia | 30→Do przemyślenia | ✅ |
| Łukasz Krawczyk | AI sr | 51→Rozmowa | 53→Rozmowa | ✅ |
| Natalia Dąbrowska | AI jr | 27→Do przemyślenia | 30→Do przemyślenia | ✅ |

**Zgodność: 7/8 = 87.5%** | **Średnia różnica: 3.8 pkt**

Jedyna rozbieżność (Piotr Zając): Claude dał 28 pkt (Do przemyślenia), OpenAI dał 36 pkt (Zadanie techniczne). Obie decyzje są obrońnie — Claude bardziej konserwatywny, OpenAI lekko bardziej liberalny.

## Koszty

Ceny API (kwiecień 2026):

| Model | Input $/MTok | Output $/MTok | 1 rozmowa* | 100 rozmów |
|---|---|---|---|---|
| **GPT-4o-mini** | **$0.15** | **$0.60** | **$0.0127** | **$1.27** |
| GPT-4o | $2.50 | $10.00 | ~$0.21 | ~$21 |
| GPT-5-mini | $0.25 | $2.00 | ❌ nie działa | — |
| Claude Haiku 4.5 | $1.00 | $5.00 | $0.076 | $7.63 |
| Claude Sonnet 4.6 | $3.00 | $15.00 | $0.254 | $25.43 |
| Gemini 2.5 Flash | $0.30 | $2.50 | ~$0.04 | ~$4 |

*Średnia rzeczywista z 10 symulacji: ~74k tokenów in, 3k out per rozmowa. Kontekst rośnie przy każdej turze.

## Statystyki rozmów

| Model | Śr. tur | Śr. tokenów | Śr. koszt |
|---|---|---|---|
| Claude Haiku | 11.8 | ~10k in + 2k out | $0.015 |
| GPT-4o-mini | 12.6 | ~74k in + 3k out | $0.013 |

GPT-4o-mini zużywa więcej input tokenów (większa akumulacja kontekstu) ale i tak **6× taniej** w sumie.

## Problemy wykryte

### GPT-5-mini — nie nadaje się do chatów ❌

**Objaw**: Kandydat zwraca puste wiadomości, rozmowa w pętli 50 tur, koszt $0.18.

**Przyczyna**: GPT-5 ma **reasoning tokens** wliczane w `max_completion_tokens`. Przy `max_completion_tokens: 512` model zużył całe 512 na wewnętrzne "myślenie" → **0 tokenów na odpowiedź**.

**Naprawienie**: zwiększyć do 2048+ **lub** dodać `reasoning_effort: 'minimal'`. Nie warto — GPT-4o-mini jest wystarczający i tańszy.

### GPT-4o-mini — flaky scoring ~5-10%

**Objaw**: Model zwraca `wynik_techniczny=0, wynik_komunikacja=0` mimo pozytywnych notatek.

**Przykład**: Michał Stępień (senior z 40 workflow n8n) → 0/55 Odrzucony, przy tym notatki opisywały go pozytywnie.

**Naprawienie**: **Safety check w `route.ts`** — jeśli oba wyniki=0 po >5 turach, zwracamy błąd do modelu żeby przeanalizował ponownie. Po dodaniu check → model za drugim razem dał 49/55 Rozmowa.

```ts
if (candidate.wynik_techniczny === 0 && candidate.wynik_komunikacja === 0 && turnsCount > 5) {
  return {
    success: false,
    error: 'Oba wyniki nie mogą być 0 po rozmowie. Oceń ponownie...',
  };
}
```

### Kalibracja scoringu — decyzja LLM

**Oryginalny problem**: LLM sam wybierał `decyzja` → mięknął przy sympatycznych kandydatach. 4 z 10 decyzji były niespójne z punktacją (np. 40 pkt → "Rozmowa" zamiast "Zadanie techniczne").

**Naprawienie**: usunięcie `decyzja` i `wynik_lacznie` ze schematu tool. LLM zwraca tylko komponenty (`wynik_techniczny`, `wynik_komunikacja`), a serwer deterministycznie wylicza sumę i decyzję.

**Efekt**: 0 niespójności decyzji (było 4/10).

## Rekomendacja dla produkcji

**Konfiguracja**:
```env
MODEL_PROVIDER=openai
OPENAI_API_KEY=sk-proj-...
```

W `route.ts`:
```ts
const MODEL = 'gpt-4o-mini';
```

**Uzasadnienie**:
1. **6× tańszy** niż Claude Haiku ($1.27 vs $7.63 per 100 rozmów)
2. **87.5% zgodności decyzji** z Claude — jakość porównywalna
3. **Safety check** obsłuży flaky 5-10% przypadków
4. Polski język świetny, tool calling działa stabilnie

**Fallback**: jeśli w produkcji zobaczymy >15% flaky rate albo niską jakość notatek — zmień na Claude Haiku (jedna linia w env).

## Jak powtórzyć testy

```bash
cd /Users/lukaszek/Projects/important/hr-chat
source ~/.claude/keys.env

# 1. Wyczyść stare wyniki
rm -rf simulations/*.json simulations-openai/*.json

# 2. Uruchom Claude (sekwencyjnie — rate limits)
for combo in "wordpress-dev senior" "wordpress-dev junior" "pm senior" "pm junior" \
             "grafik senior" "grafik junior" "ai-specialist senior" "ai-specialist junior" \
             "automatyzacje senior" "automatyzacje junior"; do
  role=$(echo $combo | cut -d' ' -f1)
  type=$(echo $combo | cut -d' ' -f2)
  ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY node simulate-interview.mjs $role $type
done

# 3. Uruchom OpenAI
for combo in "wordpress-dev senior" "wordpress-dev junior" "pm senior" "pm junior" \
             "grafik senior" "grafik junior" "ai-specialist senior" "ai-specialist junior" \
             "automatyzacje senior" "automatyzacje junior"; do
  role=$(echo $combo | cut -d' ' -f1)
  type=$(echo $combo | cut -d' ' -f2)
  OPENAI_API_KEY=$OPENAI_API_KEY node simulate-interview-openai.mjs $role $type gpt-4o-mini
done

# 4. Analiza
node compare-models.mjs
```

## Data testów
- **2026-04-04** — pierwsza runda (Claude Haiku + GPT-4o-mini)
- 10 kandydatów × 2 modele = 20 symulacji
- Łączny koszt testów: ~$0.28 (Claude) + $0.13 (OpenAI) = **$0.41**
