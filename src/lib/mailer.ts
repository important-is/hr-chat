import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'mail.important.is',
  port: Number(process.env.SMTP_PORT ?? 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER ?? 'hi@important.is',
    pass: process.env.SMTP_PASS ?? 'Adminimportant!1',
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
