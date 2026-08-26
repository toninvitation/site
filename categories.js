/* =========================================================
   TONInvitation — CATÁLOGO AUTOMÁTICO

   No site publicado pelo GitHub Pages, o catálogo é carregado
   do ficheiro público catalog.json.

   Quando o site está em localhost, continuamos a usar /api/catalog
   para que o servidor local continue a descobrir automaticamente
   as pastas sem alterar o funcionamento que já tens.

   Para adicionar novos convites:
   1. Coloca as imagens na pasta Categorias.
   2. Coloca o config.json do convite, se necessário.
   3. Faz push para o GitHub.
   4. O GitHub Actions reconstrói o catalog.json automaticamente.
   ========================================================= */

/* Guarda as categorias descobertas. */
let INVITATION_CATEGORIES = [];

/* Guarda os temas descobertos. */
let INVITATION_THEMES = {};

/* Guarda os modelos descobertos. */
let INVITATION_TEMPLATES = [];

/* Indica se o catálogo já foi carregado. */
let catalogReady = false;

/* Indica se estamos a executar o site no computador local. */
function isLocalEnvironment() {
  /* Obtém o hostname atual. */
  const hostname = window.location.hostname;

  /* Considera localhost e 127.0.0.1 ambientes de desenvolvimento. */
  return hostname === "localhost" || hostname === "127.0.0.1";
}

/* Carrega o catálogo a partir da origem correta. */
async function loadAutomaticCatalog() {
  try {
    /* Escolhe a API local ou o JSON público do GitHub Pages. */
    const catalogUrl = isLocalEnvironment()
      ? "/api/catalog"
      : "catalog.json";

    /* Pede o catálogo ao servidor local ou ao GitHub Pages. */
    const response = await fetch(catalogUrl, {
      cache: "no-store"
    });

    /* Interrompe se o ficheiro/API devolver um erro. */
    if (!response.ok) {
      throw new Error(`Não foi possível carregar ${catalogUrl}.`);
    }

    /* Converte a resposta para objeto JavaScript. */
    const catalog = await response.json();

    /* Guarda as categorias encontradas. */
    INVITATION_CATEGORIES = catalog.categories || [];

    /* Guarda os temas encontrados. */
    INVITATION_THEMES = catalog.themes || {};

    /* Guarda os convites encontrados. */
    INVITATION_TEMPLATES = catalog.templates || [];

    /* Marca o catálogo como pronto. */
    catalogReady = true;

    /* Informa todas as páginas de que o catálogo está disponível. */
    window.dispatchEvent(
      new CustomEvent("toninvitation:catalog-ready")
    );
  } catch (error) {
    /* Mostra o erro no terminal do navegador. */
    console.error("Erro ao carregar o catálogo automático:", error);

    /* Mostra uma mensagem simples na página. */
    document.querySelectorAll("[data-catalog-error]").forEach(element => {
      element.textContent = isLocalEnvironment()
        ? "Não foi possível carregar os convites. Confirme que o servidor está ligado."
        : "Não foi possível carregar os convites. Tente atualizar a página.";
    });
  }
}

/* Inicia o carregamento do catálogo. */
loadAutomaticCatalog();
