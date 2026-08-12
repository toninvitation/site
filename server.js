import express from "express";
import dotenv from "dotenv";
import Stripe from "stripe";
import { Resend } from "resend";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");
const dataDir = path.join(__dirname, "data");
const ordersFile = path.join(dataDir, "orders.json");

fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(ordersFile)) fs.writeFileSync(ordersFile, "{}", "utf8");

function readOrders() {
  return JSON.parse(fs.readFileSync(ordersFile, "utf8"));
}
function writeOrders(orders) {
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), "utf8");
}
function saveOrder(order) {
  const orders = readOrders();
  orders[order.id] = order;
  writeOrders(orders);
}
function getOrder(id) {
  return readOrders()[id];
}

function escapeXml(value = "") {
  return String(value).replace(/[<>&'"]/g, c => ({
    "<":"&lt;", ">":"&gt;", "&":"&amp;", "'":"&apos;", '"':"&quot;"
  }[c]));
}

function wrapText(text, maxChars = 26) {
  const words = String(text || "").split(/\s+/);
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

/*
  Geração do ficheiro do convite.
  Esta primeira versão gera um SVG autónomo, nítido em qualquer resolução.
  Cada template pode depois ter o seu próprio layout aqui.
*/
function generateInvitationSvg(order) {
  const main = order.color || "#d98ea2";
  const dark = "#604943";
  const bg = "#fff8f5";
  const nameLines = wrapText(order.name, 18);
  const nameStart = 540 - (nameLines.length - 1) * 32;

  const nameSvg = nameLines.map((line, i) =>
    `<text x="600" y="${nameStart + i*64}" text-anchor="middle" font-family="Georgia,serif" font-size="54" font-style="italic" fill="${escapeXml(main)}">${escapeXml(line)}</text>`
  ).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600">
  <rect width="1200" height="1600" fill="${escapeXml(bg)}"/>
  <rect x="45" y="45" width="1110" height="1510" rx="8" fill="none" stroke="${escapeXml(main)}" stroke-width="2" opacity=".55"/>
  <rect x="65" y="65" width="1070" height="1470" rx="8" fill="none" stroke="${escapeXml(main)}" stroke-width="1" opacity=".35"/>
  <text x="600" y="250" text-anchor="middle" font-family="Georgia,serif" font-size="22" letter-spacing="8" fill="${escapeXml(main)}">CONVITE</text>
  <text x="600" y="325" text-anchor="middle" font-size="34" fill="${escapeXml(main)}">✦</text>
  ${nameSvg}
  <line x1="520" y1="690" x2="680" y2="690" stroke="${escapeXml(main)}" stroke-width="2"/>
  <text x="600" y="790" text-anchor="middle" font-family="Georgia,serif" font-size="31" fill="${escapeXml(dark)}">${escapeXml(order.date)}</text>
  <text x="600" y="845" text-anchor="middle" font-family="Georgia,serif" font-size="25" fill="${escapeXml(dark)}">${escapeXml(order.time)}</text>
  <text x="600" y="960" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" letter-spacing="4" fill="${escapeXml(main)}">LOCAL</text>
  <text x="600" y="1015" text-anchor="middle" font-family="Georgia,serif" font-size="29" fill="${escapeXml(dark)}">${escapeXml(order.place)}</text>
  <text x="600" y="1300" text-anchor="middle" font-size="34" fill="${escapeXml(main)}">✦</text>
  <text x="600" y="1370" text-anchor="middle" font-family="Georgia,serif" font-size="16" fill="${escapeXml(dark)}">Com carinho, esperamos por si.</text>
</svg>`;
}

function svgDataUrl(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}

async function sendInvitationEmail(order) {
  const svg = generateInvitationSvg(order);
  const filename = `TONInvitation-${order.id}.svg`;

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: [order.email],
    subject: "O seu convite digital — TONInvitation",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#604943">
        <h1 style="font-weight:400">O seu convite está pronto! ✨</h1>
        <p>Olá! O pagamento foi confirmado e o seu convite digital já foi gerado.</p>
        <p><strong>${escapeXml(order.name)}</strong></p>
        <p>O ficheiro do convite está em anexo.</p>
        <p>Obrigada por escolher a TONInvitation.</p>
      </div>
    `,
    attachments: [{
      filename,
      content: Buffer.from(svg).toString("base64")
    }]
  });

  if (error) throw new Error(error.message || "Erro ao enviar e-mail.");
  return data;
}

/*
  IMPORTANTÍSSIMO:
  O webhook vem ANTES do express.json porque Stripe precisa do corpo bruto
  para verificar a assinatura do evento.
*/
app.post("/api/stripe-webhook", express.raw({ type: "application/json" }), async (req, res) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook Stripe inválido:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;

      if (!orderId) return res.json({ received: true });

      const order = getOrder(orderId);
      if (!order) return res.status(404).json({ error: "Pedido não encontrado." });

      if (order.status === "paid" && order.emailSentAt) {
        return res.json({ received: true });
      }

      if (session.payment_status !== "paid") {
        return res.json({ received: true });
      }

      order.status = "paid";
      order.paidAt = new Date().toISOString();
      order.stripePaymentId = session.payment_intent || null;

      const emailResult = await sendInvitationEmail(order);

      order.status = "completed";
      order.emailSentAt = new Date().toISOString();
      order.emailId = emailResult?.id || null;
      saveOrder(order);

      console.log(`Pedido ${order.id}: pago e enviado para ${order.email}`);
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("Erro a processar webhook:", err);
    return res.status(500).json({ error: "Falha ao processar o pagamento." });
  }
});

app.use(express.json({ limit: "100kb" }));

app.use(express.static(publicDir));

app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { templateId, color, name, date, time, place, email } = req.body;

    if (!templateId || !color || !name || !date || !time || !place || !email) {
      return res.status(400).json({ error: "Preencha todos os campos." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "E-mail inválido." });
    }

    const orderId = randomUUID();

    const order = {
      id: orderId,
      status: "awaiting_payment",
      templateId,
      color,
      name,
      date,
      time,
      place,
      email,
      createdAt: new Date().toISOString()
    };

    saveOrder(order);

    const priceCents = Number(process.env.INVITATION_PRICE_CENTS || 1500);
    const currency = process.env.CURRENCY || "eur";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency,
          product_data: {
            name: `Convite digital — ${name}`,
            description: `Modelo ${templateId} • Cor personalizada`
          },
          unit_amount: priceCents
        },
        quantity: 1
      }],
      customer_email: email,
      metadata: { orderId },
      success_url: `${baseUrl}/sucesso.html?order=${orderId}`,
      cancel_url: `${baseUrl}/cancelado.html?order=${orderId}`
    });

    order.stripeSessionId = session.id;
    saveOrder(order);

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Não foi possível iniciar o pagamento." });
  }
});

app.get("/api/order-status/:id", (req, res) => {
  const order = getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: "Pedido não encontrado." });

  res.json({
    status: order.status,
    email: order.email
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(port, () => {
  console.log(`TONInvitation a funcionar em ${baseUrl}`);
});
