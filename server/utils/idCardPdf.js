const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");

const LOGO_PATH = path.join(__dirname, "..", "assets", "logo.png");
const GREEN = "#c3d825";
const DARK = "#4a4635";

// Standard CR80 ID card size in points (72pt = 1in): 3.375in x 2.125in
const CARD_WIDTH = 243;
const CARD_HEIGHT = 153;

async function fetchImageBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function drawFooterBars(doc) {
  doc.rect(0, CARD_HEIGHT - 8, CARD_WIDTH, 4).fill(DARK);
  doc.rect(0, CARD_HEIGHT - 4, CARD_WIDTH, 2).fill(GREEN);
}

function drawLogo(doc, y, width) {
  if (fs.existsSync(LOGO_PATH)) {
    const x = (CARD_WIDTH - width) / 2;
    doc.image(LOGO_PATH, x, y, { width });
  }
}

async function drawFront(doc, staff) {
  doc.rect(0, 0, CARD_WIDTH, CARD_HEIGHT).fill("#ffffff");
  drawLogo(doc, 10, 130);

  const photoBuffer = staff.photo ? await fetchImageBuffer(staff.photo).catch(() => null) : null;
  const photoX = 14;
  const photoY = 48;
  const photoSize = 68;

  if (photoBuffer) {
    doc.save();
    doc.rect(photoX, photoY, photoSize, photoSize).clip();
    doc.image(photoBuffer, photoX, photoY, { cover: [photoSize, photoSize], align: "center", valign: "center" });
    doc.restore();
  } else {
    doc.rect(photoX, photoY, photoSize, photoSize).fillAndStroke("#f3f4f6", "#d1d5db");
    doc.fillColor("#9ca3af").fontSize(7).text("No Photo", photoX, photoY + photoSize / 2 - 4, { width: photoSize, align: "center" });
  }
  doc.lineWidth(1).rect(photoX, photoY, photoSize, photoSize).stroke("#d1d5db");

  const textX = photoX + photoSize + 12;
  const textWidth = CARD_WIDTH - textX - 10;
  let ty = photoY + 2;

  doc.fillColor("#111827").font("Helvetica-Bold").fontSize(12).text(staff.name, textX, ty, { width: textWidth });
  ty += 16;
  doc.fillColor("#4b5563").font("Helvetica").fontSize(9).text(staff.designation, textX, ty, { width: textWidth });
  ty += 13;
  doc.fillColor("#6b7280").fontSize(8).text(`E. ID: ${staff.employeeId}`, textX, ty, { width: textWidth });
  ty += 11;
  doc.text(`Site: ${staff.siteName}`, textX, ty, { width: textWidth });

  drawFooterBars(doc);
}

async function drawBack(doc, staff) {
  doc.rect(0, 0, CARD_WIDTH, CARD_HEIGHT).fill("#ffffff");
  drawLogo(doc, 10, 110);

  const qrDataUrl = await QRCode.toDataURL(staff.employeeId, { margin: 1, width: 300 });
  const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");
  const qrSize = 92;
  doc.image(qrBuffer, (CARD_WIDTH - qrSize) / 2, 48, { width: qrSize, height: qrSize });

  drawFooterBars(doc);
}

// Front and back are placed side by side on one landscape page so the sheet
// can be folded down the middle and laminated as a single two-sided card.
// The back half is mirrored horizontally — once folded behind the front
// half, it reads correctly instead of backwards.
async function buildIdCardPdf(staff) {
  const doc = new PDFDocument({ size: [CARD_WIDTH * 2, CARD_HEIGHT], margin: 0 });

  doc.save();
  await drawFront(doc, staff);
  doc.restore();

  doc.save();
  doc.dash(3, { space: 2 }).lineWidth(0.75).moveTo(CARD_WIDTH, 0).lineTo(CARD_WIDTH, CARD_HEIGHT).stroke("#9ca3af");
  doc.undash();
  doc.restore();

  doc.save();
  doc.translate(CARD_WIDTH * 2, 0).scale(-1, 1);
  await drawBack(doc, staff);
  doc.restore();

  return doc;
}

module.exports = { buildIdCardPdf, CARD_WIDTH, CARD_HEIGHT };
