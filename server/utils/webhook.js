// Fire-and-forget webhook POST to an n8n workflow (Webhook trigger node).
// n8n is being unreachable or unconfigured must never block or fail a
// real submission — the caller never awaits this.
async function notifyWebhook(payload) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    /* ignore — webhook delivery is best-effort */
  }
}

module.exports = { notifyWebhook };
