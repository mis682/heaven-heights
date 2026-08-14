// Fire-and-forget Slack notification via an Incoming Webhook. Slack being
// unreachable or unconfigured must never block or fail a real submission.
async function sendSlackMessage(text) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch {
    /* ignore — Slack delivery is best-effort */
  }
}

module.exports = { sendSlackMessage };
