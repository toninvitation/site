/* =========================================================
   TONInvitation — CONSTRUTOR DO CATÁLOGO PARA GITHUB PAGES

   Lê automaticamente a pasta Categorias/ e cria catalog.json.
   Este ficheiro é executado pelo GitHub Actions antes da publicação.
   ========================================================= */

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const CATEGORIES_DIR = path.join(ROOT, "Categorias");
const OUTPUT_FILE = path.join(ROOT, "catalog.json");

function catalogId(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function filesIn(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true });
}

function findFile(directory, regex) {
  return filesIn(directory)
    .filter(entry => entry.isFile())
    .map(entry => entry.name)
    .find(name => regex.test(name));
}

function publicPath(parts) {
  return parts
    .map(part => encodeURIComponent(part).replace(/%2F/g, "/"))
    .join("/");
}

function discoverModel(categoryName, themeName, modelDirectory) {
  const modelFiles = filesIn(modelDirectory)
    .filter(entry => entry.isFile())
    .map(entry => entry.name);

  const complete = modelFiles.find(name => /_completo\.(png|jpg|jpeg|webp)$/i.test(name));
  const preview = modelFiles.find(name => /_com\.(png|jpg|jpeg|webp)$/i.test(name));
  const cover = modelFiles.find(name => /_capa\.(png|jpg|jpeg|webp)$/i.test(name));

  if (!complete && !preview && !cover) {
    return null;
  }

  const base = modelDirectory.split(path.sep);
  const modelName = path.basename(modelDirectory);
  const relativeParts = base.slice(base.indexOf("Categorias") + 1);

  const imageFile = preview || complete || cover;
  const image = publicPath(["Categorias", ...relativeParts, imageFile]);
  const completeImage = complete
    ? publicPath(["Categorias", ...relativeParts, complete])
    : image;
  const coverImage = cover
    ? publicPath(["Categorias", ...relativeParts, cover])
    : image;

  return {
    id: catalogId(`${categoryName}-${themeName}-${modelName}`),
    name: modelName,
    category: catalogId(categoryName),
    categoryName,
    themeId: themeName ? catalogId(`${categoryName}-${themeName}`) : "",
    themeName: themeName || "",
    image,
    coverImage,
    completeImage,
    previewImage: image,
    description: `Convite digital ${modelName}.`
  };
}

function discoverCategory(categoryEntry) {
  const categoryName = categoryEntry.name;
  const categoryDirectory = path.join(CATEGORIES_DIR, categoryName);
  const children = filesIn(categoryDirectory).filter(entry => entry.isDirectory());

  const categories = [];
  const themes = {};
  const templates = [];

  for (const child of children) {
    const themeName = child.name;
    const themeDirectory = path.join(categoryDirectory, themeName);
    const models = filesIn(themeDirectory)
      .filter(entry => entry.isDirectory())
      .map(entry => discoverModel(categoryName, themeName, path.join(themeDirectory, entry.name)))
      .filter(Boolean);

    if (models.length === 0) {
      continue;
    }

    const themeCover = findFile(themeDirectory, /_capa\.(png|jpg|jpeg|webp)$/i);
    const themeImage = themeCover
      ? publicPath(["Categorias", categoryName, themeName, themeCover])
      : models[0].coverImage;

    const themeId = catalogId(`${categoryName}-${themeName}`);

    models.forEach(model => {
      model.themeId = themeId;
      model.themeName = themeName;
      model.themeImage = themeImage;
      model.themeDescription = `Convites com o tema ${themeName}.`;
      templates.push(model);
    });

    themes[themeId] = models;
  }

  const directModels = children.length === 0
    ? filesIn(categoryDirectory)
        .filter(entry => entry.isDirectory())
        .map(entry => discoverModel(categoryName, "", path.join(categoryDirectory, entry.name)))
        .filter(Boolean)
    : [];

  directModels.forEach(model => templates.push(model));

  return {
    category: {
      id: catalogId(categoryName),
      name: categoryName,
      image: `Images/${catalogId(categoryName)}.jpg`,
      description: `Convites digitais personalizados para ${categoryName}.`,
      type: Object.keys(themes).length > 0 ? "themes" : "invitations"
    },
    themes,
    templates
  };
}

function buildCatalog() {
  if (!fs.existsSync(CATEGORIES_DIR)) {
    throw new Error("A pasta Categorias não foi encontrada.");
  }

  const categories = [];
  const themes = {};
  const templates = [];

  const entries = filesIn(CATEGORIES_DIR)
    .filter(entry => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name, "pt"));

  for (const entry of entries) {
    const result = discoverCategory(entry);
    categories.push(result.category);
    Object.assign(themes, result.themes);
    templates.push(...result.templates);
  }

  const catalog = { categories, themes, templates };
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(catalog, null, 2), "utf8");

  console.log("=========================================================");
  console.log("TONInvitation — catálogo público criado.");
  console.log(`Categorias: ${categories.length}`);
  console.log(`Temas: ${Object.keys(themes).length}`);
  console.log(`Convites: ${templates.length}`);
  console.log(`Ficheiro: ${OUTPUT_FILE}`);
  console.log("=========================================================");
}

buildCatalog();
