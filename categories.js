/* =========================================================
   TONInvitation — CATÁLOGO AUTOMÁTICO

   Este ficheiro NÃO contém a lista manual dos convites.
   O servidor lê a pasta Categorias e envia automaticamente
   categorias, temas e modelos para o navegador.

   Para adicionar um novo convite:
   1. Cria a pasta do modelo.
   2. Coloca as imagens com os sufixos esperados.
   3. Reinicia o servidor.

   Nenhum código do catálogo precisa de ser alterado.
   ========================================================= */

/* Guarda as categorias descobertas pelo servidor. */
let INVITATION_CATEGORIES = [];

/* Guarda os temas descobertos pelo servidor. */
let INVITATION_THEMES = {};

/* Guarda os modelos descobertos pelo servidor. */
let INVITATION_TEMPLATES = [];

/* Indica se o catálogo já foi carregado. */
let catalogReady = false;

/* Carrega o catálogo automático a partir do servidor. */
async function loadAutomaticCatalog() {
  try {
    const response = await fetch("/api/catalog", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Não foi possível carregar o catálogo.");
    }

    const catalog = await response.json();

    INVITATION_CATEGORIES = catalog.categories || [];
    INVITATION_THEMES = catalog.themes || {};
    INVITATION_TEMPLATES = catalog.templates || [];
    catalogReady = true;

    /* Informa todas as páginas de que os dados já estão disponíveis. */
    window.dispatchEvent(
      new CustomEvent("toninvitation:catalog-ready")
    );
  } catch (error) {
    console.error("Erro ao carregar o catálogo automático:", error);

    /* Mostra uma mensagem simples caso o servidor não esteja ligado. */
    document.querySelectorAll("[data-catalog-error]").forEach(element => {
      element.textContent =
        "Não foi possível carregar os convites. Confirme que o servidor está ligado.";
    });
  }
}

/* Inicia o carregamento do catálogo. */
loadAutomaticCatalog();
