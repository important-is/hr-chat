import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Regulamin · important.is',
  description: 'Regulamin korzystania z platformy rekrutacyjnej important.is',
};

export default function Regulamin() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-10 sm:py-16">
        <Link href="/" className="text-sm text-gray-400 hover:text-accent transition-colors">
          ← Wróć
        </Link>

        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-6 mb-2">
          Regulamin<span className="text-accent">.</span>
        </h1>
        <p className="text-sm text-gray-400 mb-8">Ostatnia aktualizacja: 18 kwietnia 2026</p>

        <div className="prose prose-sm sm:prose-base text-gray-700 space-y-5">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">§1. Postanowienia ogólne</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Niniejszy regulamin określa zasady korzystania z platformy rekrutacyjnej dostępnej pod adresem <strong>rekrutacja.important.is</strong>.</li>
              <li>Operatorem platformy jest <strong>important.is</strong>, kontakt: <a href="mailto:hi@important.is" className="text-accent underline">hi@important.is</a>.</li>
              <li>Korzystanie z platformy oznacza akceptację niniejszego regulaminu.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">§2. Przedmiot usługi</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Platforma umożliwia przeprowadzenie rozmowy rekrutacyjnej z asystentem AI (Kaja) w celu aplikowania na stanowiska w important.is.</li>
              <li>Rozmowa ma charakter wstępnego screeningu. Ostateczna decyzja o zatrudnieniu należy do osób odpowiedzialnych w important.is.</li>
              <li>Korzystanie z platformy jest bezpłatne.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">§3. Warunki korzystania</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Z platformy może korzystać osoba pełnoletnia, posiadająca pełną zdolność do czynności prawnych.</li>
              <li>Użytkownik zobowiązuje się do podawania prawdziwych danych.</li>
              <li>Zabrania się:
                <ul className="list-disc pl-5 mt-1 space-y-0.5">
                  <li>przekazywania treści bezprawnych, wulgarnych lub obraźliwych,</li>
                  <li>prób manipulacji AI (prompt injection, jailbreak),</li>
                  <li>korzystania z platformy za pomocą botów lub zautomatyzowanych skryptów,</li>
                  <li>podejmowania działań obciążających infrastrukturę serwera (DDoS, spam).</li>
                </ul>
              </li>
              <li>Operator zastrzega sobie prawo zablokowania dostępu w przypadku naruszenia regulaminu.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">§4. AI i zasady rozmowy</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Rozmowa prowadzona jest przez model językowy AI (OpenAI / Anthropic). Treść rozmowy jest przetwarzana przez dostawcę modelu.</li>
              <li>Użytkownik przyjmuje do wiadomości, że AI może popełniać błędy i nie zawsze odpowiada precyzyjnie na pytania.</li>
              <li>Ostateczne oceny i decyzje rekrutacyjne weryfikuje i podejmuje człowiek.</li>
              <li>Nie należy podawać AI danych szczególnie wrażliwych (numery dowodu, PESEL, dane medyczne itp.).</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">§5. Dane osobowe</h2>
            <p>
              Zasady przetwarzania danych osobowych określa{' '}
              <Link href="/polityka-prywatnosci" className="text-accent underline">Polityka prywatności</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">§6. Odpowiedzialność</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Operator dokłada wszelkich starań, aby platforma działała poprawnie, ale nie gwarantuje ciągłej dostępności.</li>
              <li>Operator nie ponosi odpowiedzialności za przerwy w działaniu wynikające z awarii dostawców usług (OpenAI, Anthropic, Notion, hosting).</li>
              <li>Wypełnienie rozmowy rekrutacyjnej nie stanowi gwarancji zatrudnienia.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">§7. Reklamacje</h2>
            <p>
              Reklamacje i pytania dotyczące funkcjonowania platformy można kierować na{' '}
              <a href="mailto:hi@important.is" className="text-accent underline">hi@important.is</a>.
              Odpowiadamy w terminie do 14 dni roboczych.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">§8. Postanowienia końcowe</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Operator zastrzega sobie prawo do zmiany regulaminu. O zmianach informujemy na stronie platformy.</li>
              <li>W sprawach nieuregulowanych stosuje się przepisy prawa polskiego.</li>
              <li>Spory rozstrzyga sąd właściwy dla siedziby operatora.</li>
            </ol>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 text-xs text-gray-400">
          <Link href="/polityka-prywatnosci" className="hover:text-accent underline">Polityka prywatności</Link>
          {' · '}
          <a href="https://important.is" className="hover:text-accent">important.is</a>
        </div>
      </div>
    </div>
  );
}
