import express from "express";
import dotenv from "dotenv";
import { Resend } from "resend";
import { randomUUID } from "crypto";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);
const resend = new Resend(process.env.RESEND_API_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");

app.use(express.json({ limit: "100kb" }));
app.use(express.static(publicDir));

function escapeXml(value = "") {
  return String(value).replace(/[<>&'"]/g, c => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;"
  }[c]);
}

function wrapText(text, maxChars = 18) {
  const words = String(text || "").trim().split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function generateInvitationSvg(order) {
  const main = order.color || "#d98ea2";
  const dark = "#604943";
  const bg = "#fff8f5";
  const lines = wrapText(order.name);
  const startY = 535 - (lines.length - 1) * 32;

  const nameSvg = lines.map((line, i) => `
    <text x="600" y="${startY + i * 64}"
      text-anchor="middle"
      font-family="Georgia, serif"
      font-size="54"
      font-style="italic"
      fill="${escapeXml(main)}">${escapeXml(line)}</text>
  `).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600">
  <rect width="1200" height="1600" fill="${escapeXml(bg)}"/>
  <rect x="45" y="45" width="1110" height="1510" rx="8"
        fill="none" stroke="${escapeXml(main)}" stroke-width="2" opacity=".55"/>
  <rect x="65" y="65" width="1070" height="1470" rx="8"
        fill="none" stroke="${escapeXml(main)}" stroke-width="1" opacity=".35"/>

  <text x="600" y="250" text-anchor="middle"
        font-family="Georgia, serif" font-size="22"
        letter-spacing="8" fill="${escapeXml(main)}">CONVITE</text>

  <text x="600" y="325" text-anchor="middle"
        font-size="34" fill="${escapeXml(main)}">✦</text>

  ${nameSvg}

  <line x1="520" y1="690" x2="680" y2="690"
        stroke="${escapeXml(main)}" stroke-width="2"/>

  <text x="600" y="790" text-anchor="middle"
        font-family="Georgia, serif" font-size="31"
        fill="${escapeXml(dark)}">${escapeXml(order.date)}</text>

  <text x="600" y="845" text-anchor="middle"
        font-family="Georgia, serif" font-size="25"
        fill="${escapeXml(dark)}">${escapeXml(order.time)}</text>

  <text x="600" y="960" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="15"
        letter-spacing="4" fill="${escapeXml(main)}">LOCAL</text>

  <text x="600" y="1015" text-anchor="middle"
        font-family="Georgia, serif" font-size="29"
        fill="${escapeXml(dark)}">${escapeXml(order.place)}</text>

  <text x="600" y="1300" text-anchor="middle"
        font-size="34" fill="${escapeXml(main)}">✦</text>

  <text x="600" y="1370" text-anchor="middle"
        font-family="Georgia, serif" font-size="16"
        fill="${escapeXml(dark)}">Com carinho, esperamos por si.</text>
</svg>`;
}

async function createInvitationPng(order) {
  const svg = generateInvitationSvg(order);
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function sendInvitationEmail(order, pngBuffer) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY não está configurada no .env.");
  }

  if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM não está configurado no .env.");
  }

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: [order.email],
    subject: "O seu convite digital — TONInvitation",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#604943">
        <p>Muito obrigada pela sua compra,</p>
        <p>o seu convite encontra-se em anexo.</p>
      </div>
    `,
    attachments: [{
      filename: "convite-toninvitation.png",
      content: pngBuffer.toString("base64")
    }]
  });

  if (error) {
    throw new Error(error.message || "Erro ao enviar o e-mail.");
  }

  return data;
}

/*
 * TESTE:
 * Clicar em "Confirmar pagamento" chama este endpoint.
 * Aqui assumimos que o pagamento já foi confirmado.
 */
app.post("/api/confirm-payment-test", async (req, res) => {
  try {
    const { templateId, color, name, date, time, place, email } = req.body;

    if (!templateId || !color || !name || !date || !time || !place || !email) {
      return res.status(400).json({
        error: "Preencha todos os campos do convite."
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        error: "O e-mail indicado não é válido."
      });
    }

    const order = {
      id: randomUUID(),
      templateId,
      color,
      name,
      date,
      time,
      place,
      email,
      paymentStatus: "paid"
    };

    console.log("Pagamento de TESTE confirmado:", order);

    // Gera a imagem do convite.
    const png = await createInvitationPng(order);

    // Envia a imagem para o e-mail.
    const emailResult = await sendInvitationEmail(order, png);

    console.log("E-mail enviado:", emailResult?.id);

    return res.json({
      success: true,
      orderId: order.id,
      message: "Pagamento confirmado e convite enviado."
    });

  } catch (error) {
    console.error("ERRO:", error);
    return res.status(500).json({
      error: error.message || "Não foi possível enviar o convite."
    });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(port, () => {
  console.log(`TONInvitation: http://localhost:${port}`);
});
