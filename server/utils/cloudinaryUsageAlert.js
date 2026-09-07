const { cloudinary } = require("../middleware/upload");
const CloudinaryAlertState = require("../models/CloudinaryAlertState");
const { sendAlertEmail } = require("./mailer");

// Alert once when usage first climbs past each of these percentages of the
// plan's credit limit, not on every check — re-armed if usage ever drops
// back below the last-alerted threshold (e.g. Cloudinary's monthly
// bandwidth/transformation reset).
const THRESHOLDS = [50, 75, 90];

// Above this, new uploads fail over to the Housekeeping account rather than
// risk Cloudinary rejecting them outright once the primary account's credits
// run out.
const FALLBACK_THRESHOLD = 90;

function toMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(1);
}

async function checkCloudinaryUsageAndAlert() {
  let usage;
  try {
    usage = await cloudinary.api.usage();
  } catch {
    return; // transient Cloudinary API hiccup — try again next cycle
  }

  const usedPercent = usage.credits?.used_percent ?? 0;

  let state = await CloudinaryAlertState.findOne();
  if (!state) state = await CloudinaryAlertState.create({});

  if (usedPercent < state.lastAlertedThreshold) {
    state.lastAlertedThreshold = 0; // usage dropped — re-arm thresholds
  }

  const nextThreshold = [...THRESHOLDS].reverse().find((t) => usedPercent >= t && t > state.lastAlertedThreshold);

  state.lastUsedPercent = usedPercent;

  if (nextThreshold) {
    state.lastAlertedThreshold = nextThreshold;
    state.lastAlertedAt = new Date();

    const storageMB = toMB(usage.storage?.usage ?? 0);
    const bandwidthMB = toMB(usage.bandwidth?.usage ?? 0);
    const transformations = usage.transformations?.usage ?? 0;
    const creditsUsed = usage.credits?.usage ?? 0;
    const creditsLimit = usage.credits?.limit ?? 25;

    await sendAlertEmail({
      subject: `Cloudinary usage at ${nextThreshold}% — Heaven Heights`,
      text:
        `Cloudinary plan usage has crossed ${nextThreshold}%.\n\n` +
        `Credits used: ${creditsUsed} / ${creditsLimit} (${usedPercent}%)\n` +
        `Storage: ${storageMB} MB\n` +
        `Bandwidth (this cycle): ${bandwidthMB} MB\n` +
        `Transformations (this cycle): ${transformations}\n\n` +
        `If this keeps climbing, guard checkpoint photo uploads could start failing once the free plan limit is hit.`,
      html:
        `<p>Cloudinary plan usage has crossed <b>${nextThreshold}%</b>.</p>` +
        `<ul>` +
        `<li>Credits used: <b>${creditsUsed} / ${creditsLimit}</b> (${usedPercent}%)</li>` +
        `<li>Storage: ${storageMB} MB</li>` +
        `<li>Bandwidth (this cycle): ${bandwidthMB} MB</li>` +
        `<li>Transformations (this cycle): ${transformations}</li>` +
        `</ul>` +
        `<p>If this keeps climbing, guard checkpoint photo uploads could start failing once the free plan limit is hit.</p>`,
    });
  }

  const shouldUseFallback = usedPercent >= FALLBACK_THRESHOLD;
  if (shouldUseFallback !== state.useFallbackAccount) {
    state.useFallbackAccount = shouldUseFallback;
    await sendAlertEmail({
      subject: shouldUseFallback
        ? "Cloudinary switched to backup account — Heaven Heights"
        : "Cloudinary back on primary account — Heaven Heights",
      text: shouldUseFallback
        ? `Primary Cloudinary usage hit ${usedPercent}%, at or above the ${FALLBACK_THRESHOLD}% failover threshold.\n\n` +
          `New uploads (Attendance, Patrol, Night Guard, Fire Mock Drill, Maintenance Staff) are now going to the Housekeeping account instead, so they don't start failing.`
        : `Primary Cloudinary usage dropped back to ${usedPercent}%, below the ${FALLBACK_THRESHOLD}% failover threshold.\n\n` +
          `New uploads have switched back to the primary account.`,
      html: shouldUseFallback
        ? `<p>Primary Cloudinary usage hit <b>${usedPercent}%</b>, at or above the ${FALLBACK_THRESHOLD}% failover threshold.</p>` +
          `<p>New uploads (Attendance, Patrol, Night Guard, Fire Mock Drill, Maintenance Staff) are now going to the <b>Housekeeping account</b> instead, so they don't start failing.</p>`
        : `<p>Primary Cloudinary usage dropped back to <b>${usedPercent}%</b>, below the ${FALLBACK_THRESHOLD}% failover threshold.</p>` +
          `<p>New uploads have switched back to the primary account.</p>`,
    });
  }

  await state.save();
}

module.exports = { checkCloudinaryUsageAndAlert };
