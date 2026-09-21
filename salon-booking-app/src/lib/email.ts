import { Resend } from "resend";

type ConfirmationEmailInput = {
  to: string;
  clientName: string;
  serviceName: string;
  date: string; // "2026-09-21"
  startTime: string; // "14:30"
  durationMin: number;
  price: number;
  note?: string | null;
  salon: {
    name: string;
    address: string;
    phone: string;
  };
};

function formatDisplayDate(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDisplayTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

function buildEmailHtml(input: ConfirmationEmailInput) {
  const dateStr = formatDisplayDate(input.date);
  const timeStr = formatDisplayTime(input.startTime);
  return `
  <div style="font-family: Georgia, 'Times New Roman', serif; background:#FBF1EC; padding: 32px 16px;">
    <div style="max-width: 480px; margin: 0 auto; background: #FFFDFB; border-radius: 4px; overflow: hidden; border: 1px solid #EBD8D0;">
      <div style="background:#3B1729; padding: 28px 32px;">
        <p style="margin:0; color:#F3D8CE; font-size: 13px; letter-spacing: 0.08em;">You're booked</p>
        <h1 style="margin:6px 0 0; color:#FBF1EC; font-size: 24px; font-weight: 400;">${input.salon.name}</h1>
      </div>
      <div style="padding: 28px 32px;">
        <p style="font-family: Arial, sans-serif; font-size: 15px; color:#3B1729; margin: 0 0 20px;">
          Hi ${input.clientName}, we've saved your spot. Here are the details:
        </p>
        <table style="width:100%; font-family: Arial, sans-serif; font-size: 14px; color:#3B1729; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color:#8A5B68;">Service</td><td style="padding:6px 0; text-align:right; font-weight:bold;">${input.serviceName}</td></tr>
          <tr><td style="padding: 6px 0; color:#8A5B68;">Date</td><td style="padding:6px 0; text-align:right;">${dateStr}</td></tr>
          <tr><td style="padding: 6px 0; color:#8A5B68;">Time</td><td style="padding:6px 0; text-align:right;">${timeStr}</td></tr>
          <tr><td style="padding: 6px 0; color:#8A5B68;">Duration</td><td style="padding:6px 0; text-align:right;">${input.durationMin} min</td></tr>
          <tr><td style="padding: 6px 0; color:#8A5B68;">Price</td><td style="padding:6px 0; text-align:right;">$${input.price.toFixed(2)}</td></tr>
        </table>
        ${input.note ? `<p style="font-family: Arial, sans-serif; font-size: 13px; color:#8A5B68; margin-top: 16px;">Your note: "${input.note}"</p>` : ""}
        <hr style="border:none; border-top:1px solid #EBD8D0; margin: 24px 0;" />
        <p style="font-family: Arial, sans-serif; font-size: 13px; color:#8A5B68; margin: 0 0 4px;">${input.salon.name}</p>
        <p style="font-family: Arial, sans-serif; font-size: 13px; color:#8A5B68; margin: 0 0 4px;">${input.salon.address}</p>
        <p style="font-family: Arial, sans-serif; font-size: 13px; color:#8A5B68; margin: 0;">${input.salon.phone}</p>
        <p style="font-family: Arial, sans-serif; font-size: 12px; color:#B99CA5; margin-top: 20px;">
          Need to change anything? Just call us.
        </p>
      </div>
    </div>
  </div>`;
}

/**
 * Sends the booking confirmation email if RESEND_API_KEY is configured.
 * Silently logs instead of throwing when it isn't, so booking still succeeds
 * without an email provider set up.
 */
export async function sendBookingConfirmation(input: ConfirmationEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(
      `[email] RESEND_API_KEY not set — skipping confirmation email to ${input.to}`
    );
    return { sent: false };
  }

  const resend = new Resend(apiKey);
  const from = process.env.EMAIL_FROM || "Salon <onboarding@resend.dev>";

  try {
    await resend.emails.send({
      from,
      to: input.to,
      subject: `You're booked at ${input.salon.name} — ${formatDisplayDate(input.date)}`,
      html: buildEmailHtml(input),
    });
    return { sent: true };
  } catch (err) {
    console.error("[email] Failed to send confirmation:", err);
    return { sent: false };
  }
}
