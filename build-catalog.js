/* =========================================================
   TONInvitation — GERADOR DO CATÁLOGO PARA GITHUB PAGES

   Este ficheiro cria catalog.json a partir da pasta Categorias.

   IMPORTANTE:
   - As imagens públicas ficam em Categorias/.
   - As imagens privadas NUNCA devem ser colocadas no GitHub.
   - Para adicionar um novo convite, basta colocar a pasta/imagens
     no sítio certo e voltar a gerar o catálogo.
   ========================================================= */

const fs = require("fs");
const path = require("path");

/* Define a pasta principal do projeto. */
const ROOT_DIRECTORY = __dirname;

/* Define a pasta pública onde estão os convites. */
const CATEGORIES_DIRECTORY = path.join(ROOT_DIRECTORY, "Categorias");

/* Define o ficheiro JSON que o GitHub Pages vai disponibilizar. */
const OUTPUT_FILE = path.join(ROOT_DIRECTORY, "catalog.json");

/* Cria um identificador estável a partir dos nomes das pastas. */
function createCatalogId(...parts) {
  return parts
    .join("-")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* Cria um caminho relativo para uma imagem pública. */
function createPublicPath(...parts) {
  return ["Categorias", ...parts].join("/");
}

/* Procura um ficheiro que corresponda a uma condição. */
function findFile(directory, predicate) {
  if (!fs.existsSync(directory)) {
    return null;
  }

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const match = entries.find(entry => entry.isFile() && predicate(entry.name));

  return match ? match.name : null;
}

/* Procura uma imagem pelo sufixo indicado. */
function findImageBySuffix(directory, suffix) {
  return findFile(
    directory,
    fileName => new RegExp(`${suffix}\\.(png|jpg|jpeg|webp)$`, "i").test(fileName)
  );
}

/* Procura recursivamente uma fonte dentro de uma pasta. */
function findFontFile(directory, fontName) {
  const wanted = String(fontName || "")
    .split(",")[0]
    .replace(/["']/g, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

  if (!wanted || !fs.existsSync(directory)) {
    return null;
  }

  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isFile() && /\.(ttf|otf|woff|woff2)$/i.test(entry.name)) {
      const fileName = path
        .basename(entry.name, path.extname(entry.name))
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");

      if (fileName.includes(wanted) || wanted.includes(fileName)) {
        return entryPath;
      }
    }

    if (entry.isDirectory()) {
      const nested = findFontFile(entryPath, fontName);

      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

/* Converte o caminho de uma fonte para um caminho público relativo. */
function publicFontPath(fontPath) {
  const relative = path.relative(CATEGORIES_DIRECTORY, fontPath);
  return createPublicPath(...relative.split(path.sep));
}

/* Lê o config.json opcional de um convite. */
function readModelConfig(modelDirectory) {
  const configPath = path.join(modelDirectory, "config.json");

  if (!fs.existsSync(configPath)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch (error) {
    console.warn(`Config inválido ignorado: ${configPath}`);
    return {};
  }
}

/* Converte o nome técnico da pasta para um nome mais bonito. */
function prettifyModelName(name) {
  return String(name || "Convite")
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([0-9])/gi, "$1 $2")
    .trim();
}

/* Descobre as fontes usadas por um convite. */
function discoverFonts(modelDirectory, config) {
  const fontNames = new Set();

  if (config.fontFamily) {
    fontNames.add(String(config.fontFamily).split(",")[0].trim());
  }

  Object.values(config.fontByField || {}).forEach(font => {
    if (font) {
      fontNames.add(String(font).split(",")[0].trim());
    }
  });

  (config.textLayers || []).forEach(layer => {
    if (layer.font) {
      fontNames.add(String(layer.font).split(",")[0].trim());
    }
  });

  const result = {};

  fontNames.forEach(fontName => {
    let fontPath = findFontFile(modelDirectory, fontName);

    if (!fontPath) {
      fontPath = findFontFile(CATEGORIES_DIRECTORY, fontName);
    }

    if (fontPath) {
      result[fontName] = publicFontPath(fontPath);
    }
  });

  return result;
}

/* Cria as camadas genéricas quando o convite não tem textLayers. */
function createDefaultTextLayers(config) {
  const defaultFont = config.fontFamily || "HortaRegular, Horta, sans-serif";
  const fontByField = config.fontByField || {};
  const getFont = field => fontByField[field] || fontByField.default || defaultFont;

  return [
    { field: "name", x: 50, y: 18, size: 10, font: getFont("name"), color: "#ffc000", weight: 700, lineHeight: 0.9, align: "center" },
    { field: "faz", x: 50, y: 28, size: 6, font: getFont("faz"), color: "#f0f0f0", weight: 700, lineHeight: 0.9, align: "center" },
    { field: "age", x: 50, y: 38, size: 15, font: getFont("age"), color: "#ffc000", weight: 700, lineHeight: 0.85, align: "center" },
    { field: "anos", x: 50, y: 46, size: 6, font: getFont("anos"), color: "#ffc000", weight: 700, lineHeight: 0.9, align: "center" },
    { field: "adventure", x: 50, y: 55, size: 5, font: getFont("adventure"), color: "#07588c", weight: 700, lineHeight: 0.95, align: "center" },
    { field: "date-month", x: 38, y: 64, size: 4, font: getFont("date-month"), color: "#f0f0f0", weight: 700, lineHeight: 0.9, align: "center" },
    { field: "date-day", x: 38, y: 70, size: 8, font: getFont("date-day"), color: "#ffc000", weight: 700, lineHeight: 0.85, align: "center" },
    { field: "weekday-time", x: 67, y: 64, size: 3.5, font: getFont("weekday-time"), color: "#ffc000", weight: 700, lineHeight: 0.9, align: "center" },
    { value: "LOCAL", className: "small-white place-label", x: 67, y: 69, size: 3.5, font: getFont("place-label"), color: "#f0f0f0", weight: 700, lineHeight: 0.9, align: "center" },
    { field: "place", x: 67, y: 73, size: 2.5, font: getFont("place"), color: "#ffc000", weight: 700, lineHeight: 0.95, align: "center" },
    { field: "end", x: 50, y: 81, size: 5, font: getFont("end"), color: "#07588c", weight: 700, lineHeight: 0.9, align: "center" },
    { field: "otherInfo", x: 50, y: 89, size: 3.5, font: getFont("otherInfo"), color: "#07588c", weight: 600, lineHeight: 1, align: "center" }
  ];
}

/* Descobre os convites existentes dentro de um tema. */
function discoverThemeModels(categoryName, themeName, themeDirectory) {
  const models = [];

  if (!fs.existsSync(themeDirectory)) {
    return models;
  }

  const entries = fs.readdirSync(themeDirectory, { withFileTypes: true });

  entries
    .filter(entry => entry.isDirectory())
    .forEach(entry => {
      const modelDirectory = path.join(themeDirectory, entry.name);
      const completeFile = findImageBySuffix(modelDirectory, "_completo");
      const publicFile = findImageBySuffix(modelDirectory, "_com");

      if (!completeFile && !publicFile) {
        return;
      }

      const config = readModelConfig(modelDirectory);
      const previewFile = publicFile || completeFile;
      const modelId = createCatalogId(categoryName, themeName, entry.name);

      models.push({
        id: modelId,
        name: config.name || prettifyModelName(entry.name),
        category: createCatalogId(categoryName),
        theme: themeName ? createCatalogId(categoryName, themeName) : null,
        themeId: themeName ? createCatalogId(categoryName, themeName) : null,
        themeName: themeName || null,
        image: createPublicPath(categoryName, themeName, entry.name, completeFile || previewFile),
        previewImage: createPublicPath(categoryName, themeName, entry.name, previewFile),
        fallbackImage: "Images/infantil.jpg",
        description: config.description || `Convite personalizado — ${prettifyModelName(entry.name)}.`,
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
        editableFields: Array.isArray(config.editableFields) ? config.editableFields : [
          "name", "age", "date", "time", "place", "adventure", "faz", "anos", "end", "otherInfo"
        ],
        fontFiles: discoverFonts(modelDirectory, config),
        textLayers: Array.isArray(config.textLayers) ? config.textLayers : createDefaultTextLayers(config)
      });
    });

  return models;
}

/* Descrições e imagens usadas nos cartões das categorias. */
const CATEGORY_IMAGES = {
  "Adultos": "Images/adultos.jpg",
  "Infantil": "Images/infantil.jpg",
  "Outros": "Images/outros eventos.jpg",
  "Batizados": "Images/batizados.jpg",
  "Chá de bebé": "Images/cha_bebe.jpg",
  "Casamentos": "Images/casamentos.jpg",
  "Formaturas": "Images/formaturas.jpg"
};

const CATEGORY_DESCRIPTIONS = {
  "Adultos": "Aniversários e celebrações para adultos.",
  "Infantil": "Temas divertidos para festas dos mais pequenos.",
  "Outros": "Convites para outras ocasiões especiais.",
  "Batizados": "Convites delicados para um momento especial.",
  "Chá de bebé": "Modelos delicados para celebrar a chegada do bebé.",
  "Casamentos": "Convites românticos e elegantes para o grande dia.",
  "Formaturas": "Modelos para celebrar uma grande conquista."
};

/* Descobre todo o catálogo público. */
function discoverCatalog() {
  const categories = [];
  const themes = {};
  const templates = [];

  if (!fs.existsSync(CATEGORIES_DIRECTORY)) {
    return { categories, themes, templates };
  }

  const categoryEntries = fs
    .readdirSync(CATEGORIES_DIRECTORY, { withFileTypes: true })
    .filter(entry => entry.isDirectory());

  categoryEntries.forEach(categoryEntry => {
    const categoryName = categoryEntry.name;
    const categoryId = createCatalogId(categoryName);
    const categoryDirectory = path.join(CATEGORIES_DIRECTORY, categoryName);
    const themeList = [];

    const childDirectories = fs
      .readdirSync(categoryDirectory, { withFileTypes: true })
      .filter(entry => entry.isDirectory());

    childDirectories.forEach(themeEntry => {
      const themeDirectory = path.join(categoryDirectory, themeEntry.name);
      const models = discoverThemeModels(categoryName, themeEntry.name, themeDirectory);

      if (!models.length) {
        return;
      }

      const themeId = createCatalogId(categoryName, themeEntry.name);
      const coverFile = findImageBySuffix(themeDirectory, "_capa");
      const themeImage = coverFile
        ? createPublicPath(categoryName, themeEntry.name, coverFile)
        : models[0].image;

      models.forEach(model => {
        model.themeImage = themeImage;
        model.themeDescription = `Convites com o tema ${themeEntry.name}.`;
      });

      themeList.push({
        id: themeId,
        name: themeEntry.name,
        image: themeImage,
        description: `Convites com o tema ${themeEntry.name}.`,
        folder: themeEntry.name
      });

      themes[themeId] = models;
      templates.push(...models);
    });

    if (themeList.length) {
      categories.push({
        id: categoryId,
        name: categoryName,
        image: CATEGORY_IMAGES[categoryName] || "Images/imagem_inicio.png",
        description: CATEGORY_DESCRIPTIONS[categoryName] || "Convites digitais personalizados.",
        type: "themes"
      });
    }
  });

  return { categories, themes, templates };
}

/* Gera o ficheiro JSON final. */
const catalog = discoverCatalog();
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(catalog, null, 2), "utf8");

console.log(`Catálogo criado: ${OUTPUT_FILE}`);
console.log(`Categorias: ${catalog.categories.length}`);
console.log(`Temas: ${Object.keys(catalog.themes).length}`);
console.log(`Convites: ${catalog.templates.length}`);
