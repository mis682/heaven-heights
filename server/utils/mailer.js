const nodemailer = require("nodemailer");

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
  return transporter;
}

// Best-effort — a missing/broken mail config should never crash whatever
// triggered the alert, it should just skip sending (same fire-and-forget
// philosophy as the Slack/n8n webhook).
async function sendAlertEmail({ subject, html, text }) {
  const t = getTransporter();
  if (!t) return;
  try {
    await t.sendMail({
      from: `"Heaven Heights Alerts" <${process.env.GMAIL_USER}>`,
      to: process.env.ALERT_EMAIL_TO || "mis@neotericgrp.in",
      subject,
      text,
      html,
    });
  } catch {
    /* ignore — email delivery is best-effort */
  }
}

module.exports = { sendAlertEmail };
