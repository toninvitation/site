/* =========================================================
   TONInvitation — SERVIDOR PRINCIPAL

   Este servidor faz quatro coisas principais:

   1. Entrega os ficheiros HTML/CSS/JS da loja.
   2. Cria e guarda pedidos com um Order ID único.
   3. Simula a confirmação de pagamento durante os testes.
   4. Depois de um pagamento confirmado, envia automaticamente
      o convite final sem marca d'água para o e-mail do cliente.

   IMPORTANTE:
   O pagamento de teste NÃO movimenta dinheiro.
   Quando escolheres uma plataforma real, o endpoint de teste será
   substituído pelo webhook da plataforma escolhida.
   ========================================================= */

/* Carrega as variáveis existentes no ficheiro .env. */
require("dotenv").config();

/* Carrega a biblioteca usada para criar o servidor. */
const express = require("express");

/* Carrega a biblioteca usada para enviar e-mails através de SMTP. */
const nodemailer = require("nodemailer");

/* Carrega a biblioteca usada para criar a imagem final. */
const sharp = require("sharp");

/* Carrega a biblioteca usada para criar identificadores aleatórios. */
const crypto = require("crypto");

/* Carrega as funções do sistema de ficheiros. */
const fs = require("fs");

/* Carrega as funções para trabalhar com caminhos. */
const path = require("path");

/* Cria a aplicação HTTP. */
const app = express();

/* Define a porta usada pelo servidor. */
const PORT = Number(process.env.PORT || 3000);

/* Define a pasta onde este ficheiro está instalado. */
const ROOT_DIRECTORY = __dirname;

/* Define a pasta onde os pedidos serão guardados. */
const ORDERS_DIRECTORY = path.join(ROOT_DIRECTORY, "data", "orders");

/* Define o tamanho máximo permitido para pedidos JSON. */
const JSON_LIMIT = "25mb";

/* Permite receber JSON enviado pelo personalizador. */
app.use(express.json({ limit: JSON_LIMIT }));

/* Permite receber dados de formulários tradicionais. */
app.use(express.urlencoded({ extended: true, limit: JSON_LIMIT }));

/* Cria a pasta dos pedidos se ainda não existir. */
fs.mkdirSync(ORDERS_DIRECTORY, { recursive: true });

/* =========================================================
   FUNÇÕES DE SEGURANÇA E IDENTIFICAÇÃO
   ========================================================= */

/* Cria um identificador curto e único para cada pedido. */
function createOrderId() {
  /* Obtém a data atual no formato AAAAMMDD. */
  const datePart = new Date()
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");

  /* Cria seis caracteres aleatórios difíceis de repetir. */
  const randomPart = crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()
    .slice(0, 6);

  /* Junta data e código aleatório no identificador final. */
  return `TON-${datePart}-${randomPart}`;
}

/* Verifica se o Order ID tem o formato esperado. */
function isValidOrderId(orderId) {
  /* Aceita apenas o formato TON-AAAAMMDD-XXXXXX. */
  return /^TON-\d{8}-[A-Z0-9]{6}$/.test(String(orderId || ""));
}

/* Limpa texto que será usado como nome de ficheiro. */
function safeFilePart(value) {
  /* Mantém apenas caracteres seguros para nomes locais. */
  return String(value || "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 80);
}

/* Obtém a pasta de um pedido específico. */
function getOrderDirectory(orderId) {
  /* Valida o identificador antes de criar o caminho. */
  if (!isValidOrderId(orderId)) {
    throw new Error("Order ID inválido.");
  }

  /* Devolve a pasta exclusiva do pedido. */
  return path.join(ORDERS_DIRECTORY, orderId);
}

/* Obtém o caminho do ficheiro JSON de um pedido. */
function getOrderJsonPath(orderId) {
  /* Junta a pasta do pedido ao nome do ficheiro. */
  return path.join(getOrderDirectory(orderId), "order.json");
}

/* Obtém o caminho do PNG final de um pedido. */
function getOrderPngPath(orderId) {
  /* Junta a pasta do pedido ao nome do convite. */
  return path.join(getOrderDirectory(orderId), "convite-final.png");
}

/* Guarda um objeto JSON formatado no disco. */
function saveOrder(order) {
  /* Cria a pasta individual do pedido. */
  const orderDirectory = getOrderDirectory(order.orderId);

  /* Garante que a pasta existe antes de guardar os ficheiros. */
  fs.mkdirSync(orderDirectory, { recursive: true });

  /* Guarda o estado atual do pedido. */
  fs.writeFileSync(
    getOrderJsonPath(order.orderId),
    JSON.stringify(order, null, 2),
    "utf8"
  );
}

/* Lê um pedido existente. */
function readOrder(orderId) {
  /* Obtém o caminho do ficheiro do pedido. */
  const filePath = getOrderJsonPath(orderId);

  /* Informa se o pedido não existir. */
  if (!fs.existsSync(filePath)) {
    return null;
  }

  /* Lê o JSON e converte-o para objeto. */
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

/* =========================================================
   VALIDAÇÃO DOS DADOS DO PEDIDO
   ========================================================= */

/* Valida os dados essenciais enviados pelo navegador. */
function validateOrderInput(input) {
  /* Verifica o modelo escolhido. */
  if (!input.templateId) {
    return "O modelo do convite é obrigatório.";
  }

  /* Verifica o caminho público usado para identificar a imagem privada correspondente. */
  if (!input.previewImage) {
    return "A imagem de pré-visualização do convite é obrigatória.";
  }

  /* Verifica o e-mail do cliente. */
  if (!input.email || !/^\S+@\S+\.\S+$/.test(input.email)) {
    return "Indica um e-mail válido.";
  }

  /* Verifica se foi enviada a camada transparente com os textos. */
  if (!input.textOverlayDataUrl) {
    return "A camada de personalização não foi recebida.";
  }

  /* Aceita apenas PNG em data URL para a camada de texto. */
  if (!/^data:image\/png;base64,/.test(input.textOverlayDataUrl)) {
    return "A camada de personalização tem um formato inválido.";
  }

  /* Não encontrou erros. */
  return null;
}

/* =========================================================
   IMAGEM FINAL SEM MARCA D'ÁGUA
   ========================================================= */

/*
  Converte o caminho público da imagem de pré-visualização para o caminho
  privado da versão sem marca d'água.

  Exemplo:
  Categorias/Infantil/Toy Story/Toy Story1/ToyStory1_com.png
  ->
  Categorias Private/Infantil/Toy Story/Toy Story1/ToyStory1_sem.png
*/
function getPrivateFinalImagePath(previewImagePath) {
  /* Normaliza o caminho recebido do cliente. */
  const normalizedPath = String(previewImagePath || "").replaceAll("\\", "/");

  /* Só permite imagens que pertençam à pasta pública Categorias. */
  if (!normalizedPath.startsWith("Categorias/")) {
    throw new Error("O caminho da imagem de pré-visualização não é válido.");
  }

  /* Retira a pasta pública e cria o caminho equivalente na pasta privada. */
  const relativePath = normalizedPath.slice("Categorias/".length);
  const privateRelativePath = relativePath.replace(/_com(\.[^./]+)$/i, "_sem$1");

  /* Monta o caminho absoluto dentro de Categorias Private. */
  const privatePath = path.join(
    ROOT_DIRECTORY,
    "Categorias Private",
    ...privateRelativePath.split("/")
  );

  /* Impede que um caminho tente sair da pasta privada. */
  const privateRoot = path.resolve(ROOT_DIRECTORY, "Categorias Private");
  const resolvedPrivatePath = path.resolve(privatePath);

  /* Bloqueia caminhos que tentem sair da pasta privada. */
  if (!resolvedPrivatePath.startsWith(privateRoot + path.sep)) {
    throw new Error("O caminho da imagem privada não é seguro.");
  }

  /* Confirma que a versão sem marca d'água existe. */
  if (!fs.existsSync(resolvedPrivatePath)) {
    throw new Error(
      `A imagem sem marca d'água não foi encontrada: ${privateRelativePath}`
    );
  }

  /* Devolve o caminho privado que só o servidor conhece. */
  return resolvedPrivatePath;
}

/* Guarda o convite final usando a imagem privada sem marca d'água. */
async function saveFinalPng(orderId, previewImagePath, textOverlayDataUrl) {
  /* Obtém o caminho privado da imagem sem marca d'água. */
  const privateBackgroundPath = getPrivateFinalImagePath(previewImagePath);

  /* Remove o prefixo da imagem PNG enviada pelo navegador. */
  const base64Data = textOverlayDataUrl.replace(
    /^data:image\/png;base64,/,
    ""
  );

  /* Converte a camada Base64 para bytes. */
  const overlayBuffer = Buffer.from(base64Data, "base64");

  /* Verifica um tamanho mínimo para evitar uma camada inválida. */
  if (overlayBuffer.length < 1000) {
    throw new Error(
      "A camada de personalização recebida é inválida ou está vazia."
    );
  }

  /* Garante que a pasta individual do pedido existe. */
  fs.mkdirSync(getOrderDirectory(orderId), { recursive: true });

  /* Cria a imagem final com exatamente 1080x1920 px. */
  const finalBuffer = await sharp(privateBackgroundPath)
    .resize(1080, 1920, { fit: "fill" })
    .composite([
      {
        input: overlayBuffer,
        left: 0,
        top: 0
      }
    ])
    .png()
    .toBuffer();

  /* Guarda o PNG final dentro da pasta do pedido. */
  fs.writeFileSync(getOrderPngPath(orderId), finalBuffer);

  /* Devolve o tamanho do ficheiro final para o order.json. */
  return finalBuffer.length;
}

/* =========================================================
   E-MAIL GMAIL
   ========================================================= */

/*
  Verifica se as configurações Gmail estão completas.

  Estas variáveis vêm do ficheiro .env:
  EMAIL_HOST
  EMAIL_PORT
  EMAIL_SECURE
  EMAIL_USER
  EMAIL_PASSWORD
  EMAIL_FROM
*/
function emailIsConfigured() {
  /* Confirma todas as variáveis necessárias para o Gmail. */
  return Boolean(
    process.env.EMAIL_HOST &&
    process.env.EMAIL_PORT &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASSWORD &&
    process.env.EMAIL_FROM
  );
}

/* Cria a ligação SMTP ao Gmail. */
function createMailTransport() {
  /* Não cria ligação quando o Gmail não está configurado. */
  if (!emailIsConfigured()) {
    return null;
  }

  /* Cria o transportador SMTP com as informações do .env. */
  /*
    Cria a ligação SMTP ao Gmail.

    EMAIL_ALLOW_SELF_SIGNED=true permite apenas durante o teste local
    aceitar um certificado local que possa estar a ser introduzido pelo
    antivírus, proxy ou rede do computador.

    Para produção, esta opção deve ser removida ou ficar como false.
  */
  const allowSelfSignedCertificate =
    String(process.env.EMAIL_ALLOW_SELF_SIGNED).toLowerCase() === "true";

  /* Cria o transportador SMTP. */
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: String(process.env.EMAIL_SECURE).toLowerCase() === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      /* Aceita certificados locais somente quando explicitamente ativado. */
      rejectUnauthorized: !allowSelfSignedCertificate
    }
  });
}

/* Envia o convite final automaticamente para o e-mail do cliente. */
async function deliverOrderEmail(order) {
  /* Obtém o caminho do PNG final. */
  const imagePath = getOrderPngPath(order.orderId);

  /* Verifica se o PNG existe antes de tentar enviar. */
  if (!fs.existsSync(imagePath)) {
    throw new Error("O convite final não existe.");
  }

  /* Cria o transportador Gmail. */
  const transporter = createMailTransport();

  /* Impede a entrega automática quando o Gmail não está configurado. */
  if (!transporter) {
    throw new Error(
      "O Gmail não está configurado. Verifica o ficheiro .env."
    );
  }

  /* Define o assunto do e-mail. */
  const subject = "O seu convite digital está pronto!";

  /* Cria o conteúdo HTML do e-mail. */
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:auto;">
      <h2>O seu convite digital está pronto!</h2>

      <p>Olá!</p>

      <p>
        O seu convite digital personalizado está pronto.
      </p>

      <p>
        O convite final, <strong>sem marca d'água</strong>,
        encontra-se em anexo neste e-mail.
      </p>

      <p>
        <strong>Número do pedido:</strong> ${order.orderId}
      </p>

      <p>
        Obrigado por escolher a TONInvitation!
      </p>
    </div>
  `;

  /* Envia o e-mail através do Gmail. */
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: order.email,
    subject,
    html,
    attachments: [
      {
        filename: `${safeFilePart(order.orderId)}-convite.png`,
        path: imagePath,
        contentType: "image/png"
      }
    ]
  });

  /* Devolve o resultado do envio para o order.json. */
  return {
    sent: true,
    mode: "gmail-smtp",
    messageId: info.messageId
  };
}

/* =========================================================
   API — CRIAR PEDIDO
   ========================================================= */

app.post("/api/orders", async (request, response) => {
  try {
    /* Obtém os dados enviados pelo personalizador. */
    const input = request.body || {};

    /* Valida os dados mínimos antes de criar o pedido. */
    const validationError = validateOrderInput(input);

    /* Devolve erro de validação quando necessário. */
    if (validationError) {
      return response.status(400).json({
        error: validationError
      });
    }

    /* Cria um Order ID novo. */
    const orderId = createOrderId();

    /* Cria o PNG final usando a imagem privada sem marca d'água. */
    const imageSize = await saveFinalPng(
      orderId,
      input.previewImage,
      input.textOverlayDataUrl
    );

    /* Cria o objeto que representa o pedido. */
    const order = {
      orderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentStatus: "PENDING_PAYMENT",
      deliveryStatus: "WAITING_FOR_PAYMENT",
      imageSizeBytes: imageSize,
      previewImage: input.previewImage,
      finalImageSource: "Categorias Private/*_sem.png",
      email: String(input.email).trim(),
      templateId: input.templateId,
      templateName: input.templateName || input.templateId,
      name: input.name || "",
      age: input.age || "",
      date: input.date || "",
      weekday: input.weekday || "",
      time: input.time || "",
      place: input.place || "",
      adventure: input.adventure || "",
      faz: input.faz || "",
      anos: input.anos || "",
      end: input.end || "",
      otherInfo: input.otherInfo || "",
      positions: input.positions || {},
      sizes: input.sizes || {},
      colors: input.colors || {}
    };

    /* Guarda o pedido no disco. */
    saveOrder(order);

    /* Devolve o Order ID e o link de teste ao navegador. */
    return response.status(201).json({
      success: true,
      orderId,
      paymentStatus: order.paymentStatus,
      testPaymentUrl: `/test-payment.html?orderId=${encodeURIComponent(orderId)}`
    });
  } catch (error) {
    /* Regista o erro completo no terminal do servidor. */
    console.error("Erro ao criar pedido:", error);

    /* Devolve a mensagem do erro para facilitar os testes locais. */
    return response.status(500).json({
      error: `Não foi possível criar o pedido. ${error.message}`
    });
  }
});

/* =========================================================
   API — PAGAMENTO DE TESTE
   ========================================================= */

app.post("/api/test-payment", async (request, response) => {
  try {
    /* Obtém o Order ID enviado pela página de pagamento. */
    const orderId = String(request.body?.orderId || "");

    /* Valida o formato do Order ID. */
    if (!isValidOrderId(orderId)) {
      return response.status(400).json({
        error: "Order ID inválido."
      });
    }

    /* Procura o pedido no armazenamento local. */
    const order = readOrder(orderId);

    /* Impede pagamentos de pedidos inexistentes. */
    if (!order) {
      return response.status(404).json({
        error: "Pedido não encontrado."
      });
    }

    /* Evita processar duas vezes o mesmo pagamento. */
    if (order.paymentStatus === "PAID") {
      return response.json({
        success: true,
        orderId,
        paymentStatus: order.paymentStatus,
        deliveryStatus: order.deliveryStatus,
        emailSent: order.deliveryStatus === "EMAIL_SENT"
      });
    }

    /* Marca o pedido como pago. */
    order.paymentStatus = "PAID";

    /* Guarda a data e hora da confirmação do pagamento. */
    order.paidAt = new Date().toISOString();

    /* Atualiza a data da última alteração. */
    order.updatedAt = new Date().toISOString();

    /* Guarda imediatamente o estado pago. */
    saveOrder(order);

    /*
      Depois de confirmar o pagamento, envia automaticamente
      o convite final para o e-mail do cliente.
    */
    const emailResult = await deliverOrderEmail(order);

    /* Marca o pedido como entregue por e-mail. */
    order.deliveryStatus = "EMAIL_SENT";

    /* Guarda o resultado do envio. */
    order.emailResult = emailResult;

    /* Atualiza a data da última alteração. */
    order.updatedAt = new Date().toISOString();

    /* Guarda o pedido atualizado. */
    saveOrder(order);

    /* Devolve a confirmação ao navegador. */
    return response.json({
      success: true,
      orderId,
      paymentStatus: order.paymentStatus,
      deliveryStatus: order.deliveryStatus,
      emailSent: true
    });
  } catch (error) {
    /* Regista o erro completo do envio no terminal. */
    console.error("Erro no pagamento de teste:", error);

    /* Devolve o erro sem esconder a causa durante os testes. */
    return response.status(500).json({
      error:
        "O pagamento foi confirmado, mas o e-mail não foi enviado. " +
        error.message
    });
  }
});

/* =========================================================
   API — CONSULTAR PEDIDO
   ========================================================= */

app.get("/api/orders/:orderId", (request, response) => {
  /* Obtém o Order ID da URL. */
  const orderId = String(request.params.orderId || "");

  /* Valida o identificador. */
  if (!isValidOrderId(orderId)) {
    return response.status(400).json({
      error: "Order ID inválido."
    });
  }

  /* Procura o pedido. */
  const order = readOrder(orderId);

  /* Informa quando não existe. */
  if (!order) {
    return response.status(404).json({
      error: "Pedido não encontrado."
    });
  }

  /* Devolve apenas informações necessárias para consulta. */
  return response.json({
    orderId: order.orderId,
    templateId: order.templateId,
    paymentStatus: order.paymentStatus,
    deliveryStatus: order.deliveryStatus,
    email: order.email,
    createdAt: order.createdAt,
    paidAt: order.paidAt || null
  });
});



/* =========================================================
   CATÁLOGO AUTOMÁTICO A PARTIR DAS PASTAS
   ========================================================= */

/* Converte um nome de pasta num identificador estável para o navegador. */
function createCatalogId(...parts) {
  return parts
    .join("-")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* Cria uma URL pública segura a partir de partes de caminho. */
function createPublicCategoryPath(...parts) {
  return ["Categorias", ...parts].join("/");
}

/* Procura um ficheiro dentro de uma pasta sem depender de maiúsculas/minúsculas. */
function findFileCaseInsensitive(directory, predicate) {
  if (!fs.existsSync(directory)) {
    return null;
  }

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const file = entries.find(entry => entry.isFile() && predicate(entry.name));

  return file ? file.name : null;
}

/* Procura a imagem com um sufixo específico. */
function findImageBySuffix(directory, suffix) {
  return findFileCaseInsensitive(
    directory,
    fileName => new RegExp(`${suffix}\\.(png|jpg|jpeg|webp)$`, "i").test(fileName)
  );
}

/* Converte o nome de uma pasta de modelo num nome apresentado ao cliente. */
function prettifyModelName(folderName) {
  return String(folderName || "Convite")
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([0-9])/gi, "$1 $2")
    .trim();
}

/* Cria camadas de texto genéricas para novos modelos. */
function createDefaultTextLayers() {
  return [
    { field: "name", x: 50, y: 18, size: 10, font: "Sigmar One, sans-serif", color: "#ffc000", weight: 700, lineHeight: 0.9, align: "center" },
    { field: "faz", x: 50, y: 28, size: 6, font: "HortaRegular, Horta, sans-serif", color: "#f0f0f0", weight: 700, lineHeight: 0.9, align: "center" },
    { field: "age", x: 50, y: 38, size: 15, font: "Sigmar One, sans-serif", color: "#ffc000", weight: 700, lineHeight: 0.85, align: "center" },
    { field: "anos", x: 50, y: 46, size: 6, font: "Sigmar One, sans-serif", color: "#ffc000", weight: 700, lineHeight: 0.9, align: "center" },
    { field: "adventure", x: 50, y: 55, size: 5, font: "HortaRegular, Horta, sans-serif", color: "#07588c", weight: 700, lineHeight: 0.95, align: "center" },
    { field: "date-month", x: 38, y: 64, size: 4, font: "HortaRegular, Horta, sans-serif", color: "#f0f0f0", weight: 700, lineHeight: 0.9, align: "center" },
    { field: "date-day", x: 38, y: 70, size: 8, font: "HortaRegular, Horta, sans-serif", color: "#ffc000", weight: 700, lineHeight: 0.85, align: "center" },
    { field: "weekday-time", x: 67, y: 64, size: 3.5, font: "HortaRegular, Horta, sans-serif", color: "#ffc000", weight: 700, lineHeight: 0.9, align: "center" },
    { value: "LOCAL", className: "small-white place-label", x: 67, y: 69, size: 3.5, font: "HortaRegular, Horta, sans-serif", color: "#f0f0f0", weight: 700, lineHeight: 0.9, align: "center" },
    { field: "place", x: 67, y: 73, size: 2.5, font: "HortaRegular, Horta, sans-serif", color: "#ffc000", weight: 700, lineHeight: 0.95, align: "center" },
    { field: "end", x: 50, y: 81, size: 5, font: "HortaRegular, Horta, sans-serif", color: "#07588c", weight: 700, lineHeight: 0.9, align: "center" },
    { field: "otherInfo", x: 50, y: 89, size: 3.5, font: "HortaRegular, Horta, sans-serif", color: "#07588c", weight: 600, lineHeight: 1, align: "center" }
  ];
}

/* Lê um eventual config.json opcional sem obrigar o utilizador a criá-lo. */
function readOptionalModelConfig(modelDirectory) {
  const configPath = path.join(modelDirectory, "config.json");

  if (!fs.existsSync(configPath)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch (error) {
    console.warn(`Configuração inválida ignorada: ${configPath}`);
    return {};
  }
}

/* Descobre automaticamente todos os modelos existentes dentro de um tema. */
function discoverThemeModels(categoryFolderName, themeFolderName, themeDirectory) {
  const models = [];
  const entries = fs.readdirSync(themeDirectory, { withFileTypes: true });

  entries
    .filter(entry => entry.isDirectory())
    .forEach(modelEntry => {
      const modelDirectory = path.join(themeDirectory, modelEntry.name);
      const completeFile = findImageBySuffix(modelDirectory, "_completo");
      const publicFile = findImageBySuffix(modelDirectory, "_com");

      if (!completeFile && !publicFile) {
        return;
      }

      const config = readOptionalModelConfig(modelDirectory);
      const modelId = createCatalogId(categoryFolderName, themeFolderName, modelEntry.name);
      const previewFile = publicFile || completeFile;

      models.push({
        id: modelId,
        name: config.name || prettifyModelName(modelEntry.name),
        category: createCatalogId(categoryFolderName),
        theme: themeFolderName ? createCatalogId(categoryFolderName, themeFolderName) : null,
        themeId: themeFolderName ? createCatalogId(categoryFolderName, themeFolderName) : null,
        themeName: themeFolderName || null,
        image: createPublicCategoryPath(
          categoryFolderName,
          themeFolderName,
          modelEntry.name,
          completeFile || previewFile
        ),
        previewImage: createPublicCategoryPath(
          categoryFolderName,
          themeFolderName,
          modelEntry.name,
          previewFile
        ),
        fallbackImage: "Images/infantil.jpg",
        description: config.description || `Convite personalizado — ${prettifyModelName(modelEntry.name)}.`,
        priceEUR: Number(config.priceEUR || 5),
        defaultName: config.defaultName || "João",
        defaultAge: config.defaultAge || "3",
        defaultDate: config.defaultDate || "2026-05-10",
        defaultTime: config.defaultTime || "15H",
        defaultPlace: config.defaultPlace || "Local da festa",
        defaultAdventure: config.defaultAdventure || "VEM PARTICIPAR\nNESSA AVENTURA!",
        defaultFaz: config.defaultFaz || "FAZ",
        defaultAnos: config.defaultAnos || "ANOS",
        defaultEnd: config.defaultEnd || "ESPERAMOS POR TI!",
        defaultOtherInfo: config.defaultOtherInfo || "",
        defaultOtherInfoColor: config.defaultOtherInfoColor || "#07588c",
        textLayers: Array.isArray(config.textLayers)
          ? config.textLayers
          : createDefaultTextLayers()
      });
    });

  return models;
}

/* Descobre automaticamente categorias, temas e modelos da pasta Categorias. */
function discoverCatalog() {
  const categoriesDirectory = path.join(ROOT_DIRECTORY, "Categorias");

  if (!fs.existsSync(categoriesDirectory)) {
    return {
      categories: [],
      themes: {},
      templates: []
    };
  }

  const categoryImageMap = {
    "Adultos": "Images/adultos.jpg",
    "Infantil": "Images/infantil.jpg",
    "Outros": "Images/outros eventos.jpg",
    "Batizados": "Images/batizados.jpg",
    "Chá de bebé": "Images/cha_bebe.jpg",
    "Casamentos": "Images/casamentos.jpg",
    "Formaturas": "Images/formaturas.jpg"
  };

  const categoryDescriptionMap = {
    "Adultos": "Aniversários e celebrações para adultos.",
    "Infantil": "Temas divertidos para festas dos mais pequenos.",
    "Outros": "Convites para outras ocasiões especiais.",
    "Batizados": "Convites delicados para um momento especial.",
    "Chá de bebé": "Modelos delicados para celebrar a chegada do bebé.",
    "Casamentos": "Convites românticos e elegantes para o grande dia.",
    "Formaturas": "Modelos para celebrar uma grande conquista."
  };

  const categories = [];
  const themes = {};
  const templates = [];
  const categoryEntries = fs.readdirSync(categoriesDirectory, { withFileTypes: true });

  categoryEntries
    .filter(entry => entry.isDirectory())
    .forEach(categoryEntry => {
      const categoryName = categoryEntry.name;
      const categoryId = createCatalogId(categoryName);
      const categoryDirectory = path.join(categoriesDirectory, categoryName);
      const childDirectories = fs
        .readdirSync(categoryDirectory, { withFileTypes: true })
        .filter(entry => entry.isDirectory());

      const themeList = [];
      const directModels = discoverThemeModels(
        categoryName,
        "",
        categoryDirectory
      );

      childDirectories.forEach(childEntry => {
        const childDirectory = path.join(categoryDirectory, childEntry.name);
        const nestedDirectories = fs
          .readdirSync(childDirectory, { withFileTypes: true })
          .filter(entry => entry.isDirectory());

        const nestedModels = discoverThemeModels(
          categoryName,
          childEntry.name,
          childDirectory
        );

        if (nestedModels.length > 0) {
          const themeId = createCatalogId(categoryName, childEntry.name);
          const coverFile =
            findFileCaseInsensitive(
              childDirectory,
              fileName => /_capa\.(png|jpg|jpeg|webp)$/i.test(fileName)
            ) ||
            findImageBySuffix(childDirectory, "_capa");

          const firstModel = nestedModels[0];
          const themeImage = coverFile
            ? createPublicCategoryPath(categoryName, childEntry.name, coverFile)
            : firstModel.image;

          nestedModels.forEach(model => {
            model.themeImage = themeImage;
            model.themeDescription = `Convites com o tema ${childEntry.name}.`;
          });

          themeList.push({
            id: themeId,
            name: childEntry.name,
            image: themeImage,
            description: `Convites com o tema ${childEntry.name}.`,
            folder: childEntry.name
          });

          themes[themeId] = nestedModels;
          templates.push(...nestedModels);
          return;
        }

      });

      if (themeList.length > 0) {
        categories.push({
          id: categoryId,
          name: categoryName,
          image: categoryImageMap[categoryName] || "Images/imagem_inicio.png",
          description: categoryDescriptionMap[categoryName] || "Convites digitais personalizados.",
          type: "themes"
        });
        return;
      }

      const modelsInCategory = directModels.length > 0
        ? directModels
        : discoverThemeModels(categoryName, "", categoryDirectory);

      categories.push({
        id: categoryId,
        name: categoryName,
        image: categoryImageMap[categoryName] || "Images/imagem_inicio.png",
        description: categoryDescriptionMap[categoryName] || "Convites digitais personalizados.",
        type: "invitations"
      });

      templates.push(...modelsInCategory);
    });

  return {
    categories,
    themes,
    templates
  };
}

/* Entrega ao navegador apenas o catálogo público. */
app.get("/api/catalog", (request, response) => {
  try {
    return response.json(discoverCatalog());
  } catch (error) {
    console.error("Erro ao construir catálogo automático:", error);
    return response.status(500).json({
      error: "Não foi possível carregar o catálogo."
    });
  }
});

/* =========================================================
   PROTEÇÃO DE FICHEIROS PRIVADOS
   ========================================================= */

/*
  A pasta "Categorias Private" contém as imagens sem marca d'água.
  Esta pasta NUNCA pode ser servida diretamente pelo navegador.

  A pasta "data" contém pedidos e dados de clientes e também
  não pode ficar acessível através do servidor de ficheiros estáticos.
*/
app.use((request, response, next) => {
  /* Obtém o caminho solicitado pelo navegador. */
  const requestedPath = decodeURIComponent(request.path || "")
    .replaceAll("\\", "/")
    .toLowerCase();

  /* Bloqueia qualquer tentativa de abrir a pasta privada. */
  if (
    requestedPath === "/categorias private" ||
    requestedPath.startsWith("/categorias private/") ||
    requestedPath === "/data" ||
    requestedPath.startsWith("/data/")
  ) {
    return response.status(404).send("Not found");
  }

  /* Continua para o servidor de ficheiros estáticos. */
  return next();
});

/* Entrega os ficheiros públicos do site a partir da raiz do projeto. */
app.use(express.static(ROOT_DIRECTORY));

/* =========================================================
   TRATAMENTO DE ERROS
   ========================================================= */

/* Trata rotas inexistentes de API sem devolver HTML. */
app.use("/api", (request, response) => {
  response.status(404).json({
    error: "Endpoint da API não encontrado."
  });
});

/* Inicia o servidor. */
app.listen(PORT, () => {
  console.log("=========================================================");
  console.log("TONInvitation iniciado.");
  console.log(`Site: http://localhost:${PORT}`);
  console.log(`Pagamento de teste: http://localhost:${PORT}/test-payment.html`);
  console.log("=========================================================");

  /* Informa se o Gmail está configurado. */
  if (emailIsConfigured()) {
    console.log("E-mail: Gmail SMTP configurado.");
    console.log(`E-mail remetente: ${process.env.EMAIL_FROM}`);
  } else {
    console.log("E-mail: Gmail NÃO configurado.");
    console.log("Verifica o ficheiro .env.");
  }
});
