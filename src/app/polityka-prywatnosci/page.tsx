import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Polityka prywatności · important.is',
  description: 'Informacje o przetwarzaniu danych osobowych w rekrutacji important.is',
};

export default function PolitykaPrywatnosci() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-10 sm:py-16">
        <Link href="/" className="text-sm text-gray-400 hover:text-accent transition-colors">
          ← Wróć
        </Link>

        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-6 mb-2">
          Polityka prywatności<span className="text-accent">.</span>
        </h1>
        <p className="text-sm text-gray-400 mb-8">Ostatnia aktualizacja: 18 kwietnia 2026</p>

        <div className="prose prose-sm sm:prose-base text-gray-700 space-y-5">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">1. Administrator danych</h2>
            <p>
              Administratorem danych osobowych jest <strong>important.is</strong> z siedzibą w Polsce.
              Kontakt: <a href="mailto:hi@important.is" className="text-accent underline">hi@important.is</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">2. Jakie dane zbieramy</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Dane kontaktowe: imię, nazwisko, email, miasto (opcjonalnie)</li>
              <li>Dane zawodowe: odpowiedzi w rozmowie rekrutacyjnej, oczekiwana stawka, dostępność</li>
              <li>Linki do portfolio: GitHub, Behance, Dribbble (opcjonalnie)</li>
              <li>Dane techniczne: adres IP, timestamp sesji, typ przeglądarki</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">3. Cel i podstawa prawna</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Rekrutacja</strong> (art. 6 ust. 1 lit. a i b RODO) — na podstawie Twojej zgody i w celu przeprowadzenia procesu rekrutacyjnego</li>
              <li><strong>Ochrona przed nadużyciami</strong> (art. 6 ust. 1 lit. f RODO) — nasz prawnie uzasadniony interes (rate limiting, wykrywanie botów)</li>
              <li><strong>Analiza ruchu</strong> (art. 6 ust. 1 lit. f RODO) — anonimowa statystyka użycia serwisu</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">4. Kto ma dostęp</h2>
            <p>Twoje dane przekazujemy tylko podmiotom niezbędnym do realizacji usługi:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>OpenAI</strong> / <strong>Anthropic</strong> — dostawcy modeli AI prowadzących rozmowę (dane przesyłane do USA na podstawie standardowych klauzul umownych)</li>
              <li><strong>Notion Labs Inc.</strong> — platforma do przechowywania zgłoszeń (USA, standardowe klauzule umowne)</li>
              <li><strong>Hetzner / Coolify</strong> — hosting serwera (EU)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">5. Jak długo przechowujemy</h2>
            <p>
              Dane kandydatów przechowujemy maksymalnie <strong>12 miesięcy</strong> od zakończenia rozmowy,
              chyba że zostaniesz zatrudniony/a — wtedy dane przechodzą do dokumentacji pracowniczej.
              Transkrypty rozmów niezakończonych usuwamy po 30 dniach.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">6. Twoje prawa</h2>
            <p>Masz prawo do:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>dostępu do swoich danych</li>
              <li>sprostowania / poprawienia danych</li>
              <li>usunięcia danych (prawo do bycia zapomnianym)</li>
              <li>ograniczenia przetwarzania</li>
              <li>przenoszenia danych</li>
              <li>sprzeciwu wobec przetwarzania</li>
              <li>cofnięcia zgody w dowolnym momencie</li>
              <li>wniesienia skargi do Prezesa UODO</li>
            </ul>
            <p className="mt-3">
              Aby skorzystać z powyższych praw, napisz na{' '}
              <a href="mailto:hi@important.is" className="text-accent underline">hi@important.is</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">7. Cookies</h2>
            <p>
              Używamy plików cookies do zapamiętywania Twoich preferencji (m.in. zgoda cookies, sesja rozmowy).
              Nie używamy cookies reklamowych ani śledzących zewnętrznych. Szczegółowe informacje o używanych
              cookies: <code>important_cookie_consent</code> (12 miesięcy — Twoja decyzja o cookies),
              {' '}<code>hr-chat-session</code> (24h — pozwala wrócić do przerwanej rozmowy, localStorage).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">8. Automatyczne decyzje</h2>
            <p>
              Podczas rozmowy AI (Kaja) automatycznie ocenia Twoje odpowiedzi (wynik 0-55 pkt) i sugeruje
              decyzję (rozmowa / zadanie / do przemyślenia / odrzucony). <strong>To wstępna ocena pomocnicza.</strong>
              Ostateczną decyzję o zaproszeniu na rozmowę zawsze podejmuje człowiek.
              Masz prawo do otrzymania uzasadnienia decyzji i jej zakwestionowania.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 text-xs text-gray-400">
          <Link href="/regulamin" className="hover:text-accent underline">Regulamin</Link>
          {' · '}
          <a href="https://important.is" className="hover:text-accent">important.is</a>
        </div>
      </div>
    </div>
  );
}
