/* =========================================================
   TONInvitation — CATÁLOGO AUTOMÁTICO

   Em produção no GitHub Pages, o catálogo é carregado de
   catalog.json, criado automaticamente pelo GitHub Actions.

   Em localhost, o site continua a tentar usar /api/catalog,
   para não quebrar o servidor que já funciona.
   ========================================================= */

let INVITATION_CATEGORIES = [];
let INVITATION_THEMES = {};
let INVITATION_TEMPLATES = [];
let catalogReady = false;

async function loadAutomaticCatalog() {
  try {
    let response;

    /* Primeiro tenta o catálogo estático usado pelo GitHub Pages. */
    response = await fetch("catalog.json", { cache: "no-store" });

    /* Se ainda não existir, tenta o endpoint do servidor local. */
    if (!response.ok) {
      response = await fetch("/api/catalog", { cache: "no-store" });
    }

    if (!response.ok) {
      throw new Error("Não foi possível carregar o catálogo.");
    }

    const catalog = await response.json();

    INVITATION_CATEGORIES = catalog.categories || [];
    INVITATION_THEMES = catalog.themes || {};
    INVITATION_TEMPLATES = catalog.templates || [];
    catalogReady = true;

    window.dispatchEvent(
      new CustomEvent("toninvitation:catalog-ready")
    );
  } catch (error) {
    console.error("Erro ao carregar o catálogo automático:", error);

    document.querySelectorAll("[data-catalog-error]").forEach(element => {
      element.textContent =
        "Não foi possível carregar os convites. Tenta atualizar a página.";
    });
  }
}

loadAutomaticCatalog();
