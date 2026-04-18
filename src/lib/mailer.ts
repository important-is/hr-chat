import nodemailer from 'nodemailer';

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('[mailer] Missing SMTP env vars — emails will fail');
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface CandidateNotification {
  imie_nazwisko: string;
  email: string;
  role: string;
  wynik_lacznie: number;
  decyzja: string;
  notatki: string;
  notionUrl?: string;
  wczesneZakonczenie?: boolean;
}

const DECISION_EMOJI: Record<string, string> = {
  'Rozmowa': '🟢',
  'Zadanie techniczne': '🟡',
  'Do przemyślenia': '🟠',
  'Odrzucony': '🔴',
};

export async function sendCandidateConfirmation(data: {
  imie_nazwisko: string;
  email: string;
  role: string;
}) {
  await transporter.sendMail({
    from: `"Kaja z important.is" <hi@important.is>`,
    to: data.email,
    subject: `Dzięki za rozmowę, ${data.imie_nazwisko.split(' ')[0]}! ✌️`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; color: #222;">
        <h2 style="font-size: 22px; margin-bottom: 8px;">Hej ${data.imie_nazwisko.split(' ')[0]}! 👋</h2>
        <p>Dzięki za rozmowę na stanowisko <strong>${data.role}</strong> w important.is.</p>
        <p>Łukasz przejrzy Twoje odpowiedzi i odezwie się do Ciebie w ciągu <strong>5 dni roboczych</strong>.</p>
        <p style="color: #666; font-size: 14px;">Jeśli masz pytania — pisz śmiało na <a href="mailto:hi@important.is">hi@important.is</a>.</p>
        <p style="margin-top: 32px;">Do usłyszenia,<br><strong>Kaja</strong><br><span style="color:#666;font-size:13px;">Rekruterka · important.is</span></p>
      </div>
    `,
  });
}

export async function notifyBudgetThreshold(data: {
  currentCost: number;
  limit: number;
  percentage: number;
  date: string;
  interviewCount: number;
}): Promise<void> {
  const subject = `⚠️ Budżet HR chat: ${data.percentage}% ($${data.currentCost.toFixed(4)}/$${data.limit.toFixed(2)})`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px;">
      <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 8px 0; color: #856404;">⚠️ Alert budżetu HR chat</h2>
        <p style="margin: 0; color: #856404;">Dzienny budżet przekroczył <strong>${data.percentage}%</strong> limitu.</p>
      </div>

      <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #eee; color: #666;">Data</td>
          <td style="padding: 8px; border: 1px solid #eee;"><strong>${data.date}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #eee; color: #666;">Aktualny koszt</td>
          <td style="padding: 8px; border: 1px solid #eee;"><strong>$${data.currentCost.toFixed(4)}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #eee; color: #666;">Limit dzienny</td>
          <td style="padding: 8px; border: 1px solid #eee;">$${data.limit.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #eee; color: #666;">Wykorzystanie</td>
          <td style="padding: 8px; border: 1px solid #eee;"><strong>${data.percentage}%</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #eee; color: #666;">Liczba rozmów</td>
          <td style="padding: 8px; border: 1px solid #eee;">${data.interviewCount}</td>
        </tr>
      </table>

      <p style="color: #333; font-size: 14px;">Gdy budżet osiągnie 100%, nowe rozmowy zostaną zablokowane do końca dnia.</p>

      <p><a href="https://rekrutacja.important.is/admin" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px;">Otwórz panel admina →</a></p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Kaja — Rekrutacja" <hi@important.is>`,
    to: 'lukasz.s@important.is',
    subject,
    html,
  });
}

export async function notifyNewCandidate(data: CandidateNotification) {
  const emoji = DECISION_EMOJI[data.decyzja] ?? '⚪';
  const earlyTag = data.wczesneZakonczenie ? ' ⚠️ (przerwana wcześniej)' : '';
  const subject = `${emoji} Nowy kandydat: ${data.imie_nazwisko} — ${data.role}${earlyTag}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px;">
      <h2 style="margin-bottom: 4px;">${emoji} ${data.imie_nazwisko}${earlyTag}</h2>
      <p style="color: #666; margin-top: 0;">Rola: <strong>${data.role}</strong></p>

      <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #eee; color: #666;">Email</td>
          <td style="padding: 8px; border: 1px solid #eee;"><a href="mailto:${data.email}">${data.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #eee; color: #666;">Wynik</td>
          <td style="padding: 8px; border: 1px solid #eee;">${data.wynik_lacznie}/55 pkt</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #eee; color: #666;">Decyzja</td>
          <td style="padding: 8px; border: 1px solid #eee;"><strong>${data.decyzja}</strong></td>
        </tr>
      </table>

      <p style="color: #333;"><strong>Notatki Kai:</strong><br>${data.notatki.replace(/\n/g, '<br>')}</p>

      ${data.notionUrl ? `<p><a href="${data.notionUrl}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px;">Otwórz w Notion →</a></p>` : ''}

      ${data.wczesneZakonczenie ? '<p style="color: #e67e22; font-size: 13px;">⚠️ Kandydat/ka przerwał/a rozmowę wcześniej. Email podany — warto się odezwać.</p>' : ''}
    </div>
  `;

  await transporter.sendMail({
    from: `"Kaja — Rekrutacja" <hi@important.is>`,
    to: 'lukasz.s@important.is',
    subject,
    html,
  });
}
