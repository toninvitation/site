/* =========================================================
   TONInvitation — PÁGINA DE CATEGORIA

   Os temas e convites são carregados automaticamente pelo servidor.
   Não é necessário adicionar novos convites a este ficheiro.
   ========================================================= */

/* Inicializa a página da categoria. */
function initializeCategoryPage() {
  const params = new URLSearchParams(location.search);
  const categoryId = params.get("categoria") || "infantil";
  const category = INVITATION_CATEGORIES.find(item => item.id === categoryId);
  const header = document.getElementById("category-header");
  const content = document.getElementById("category-content");

  if (!category) {
    header.innerHTML = "<h1>Categoria não encontrada</h1>";
    return;
  }

  header.innerHTML = `
    <div class="category-page-title">
      <span class="eyebrow">CATÁLOGO</span>
      <h1>${escapeHtml(category.name)}</h1>
      <div class="title-decoration">
        <span></span>
        <b>♥</b>
        <span></span>
      </div>
      <p>${escapeHtml(category.description)}</p>
    </div>
  `;

  if (category.type === "themes") {
    renderThemeCategory(content, categoryId);
  } else {
    renderDirectCategory(content, categoryId);
  }

  lucide.createIcons();
  setupCategoryMenu();
}

/* Mostra os temas encontrados dentro da pasta da categoria. */
function renderThemeCategory(content, categoryId) {
  const themes = Object.values(INVITATION_THEMES)
    .filter(models => models.some(model => model.category === categoryId))
    .map(models => models[0].themeId)
    .filter((themeId, index, list) => list.indexOf(themeId) === index)
    .map(themeId => {
      const models = INVITATION_THEMES[themeId] || [];
      return {
        id: themeId,
        name: models[0]?.themeName || getThemeName(themeId),
        image: models[0]?.themeImage || models[0]?.image || "Images/infantil.jpg",
        description: models[0]?.themeDescription || `Convites com o tema ${getThemeName(themeId)}.`
      };
    });

  content.innerHTML = `
    <div class="page-intro">
      <h2>Escolha o tema</h2>
      <p>Entre num tema para ver os diferentes convites.</p>
    </div>
    <div class="theme-grid">
      ${themes.map(theme => themeCard(theme, categoryId)).join("")}
    </div>
  `;
}

/* Obtém o nome legível de um tema a partir do seu identificador. */
function getThemeName(themeId) {
  const model = INVITATION_THEMES[themeId]?.[0];
  return model?.themeName || themeId.replace(`${model?.category || ""}-`, "");
}

/* Mostra modelos diretamente quando a categoria não tem temas. */
function renderDirectCategory(content, categoryId) {
  const items = INVITATION_TEMPLATES.filter(
    item => item.category === categoryId && !item.themeId
  );

  content.innerHTML = `
    <div class="page-intro">
      <h2>Escolha o seu convite</h2>
      <p>Personalize o modelo que mais gostar.</p>
    </div>
    <div class="invitation-grid">
      ${items.map(invitationCard).join("")}
    </div>
  `;
}

/* Cria o cartão visual de um tema. */
function themeCard(theme, categoryId) {
  return `
    <a
      class="theme-card"
      href="modelos.html?categoria=${encodeURIComponent(categoryId)}&tema=${encodeURIComponent(theme.id)}"
    >
      <div class="theme-image theme-image-portrait">
        <img
          src="${theme.image}"
          alt="${escapeHtml(theme.name)}"
          onerror="this.src='Images/infantil.jpg'"
        >
      </div>
      <div class="theme-info">
        <h3>${escapeHtml(theme.name)}</h3>
        <p>${escapeHtml(theme.description)}</p>
        <span>Ver convites →</span>
      </div>
    </a>
  `;
}

/* Cria cartões para categorias sem subtemas. */
function invitationCard(template) {
  return `
    <article class="invitation-card">
      <div class="invitation-image invitation-image-portrait">
        <img
          src="${template.image}"
          alt="${escapeHtml(template.name)}"
          onerror="this.src='${template.fallbackImage || "Images/imagem_inicio.png"}'"
        >
      </div>
      <div class="invitation-info">
        <h3>${escapeHtml(template.name)}</h3>
        <p>${escapeHtml(template.description || "")}</p>
        <button
          class="btn btn-primary"
          type="button"
          onclick="window.location.href='modelos.html?categoria=${encodeURIComponent(template.category)}&modelo=${encodeURIComponent(template.id)}'"
        >
          Personalizar
        </button>
      </div>
    </article>
  `;
}

/* Configura o menu mobile da página. */
function setupCategoryMenu() {
  const menu = document.getElementById("menu");
  const mobileButton = document.getElementById("menu-mobile");

  mobileButton?.addEventListener("click", () => {
    const open = menu.classList.toggle("ativo");
    mobileButton.classList.toggle("aberto", open);
  });
}

/* Escapa texto antes de o colocar em HTML. */
function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* Inicializa quando o catálogo automático estiver pronto. */
window.addEventListener("toninvitation:catalog-ready", initializeCategoryPage);
