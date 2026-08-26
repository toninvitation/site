/* =========================================================
   TONInvitation — MODELOS E PERSONALIZADOR AUTOMÁTICO

   Todos os modelos vêm de /api/catalog.
   O personalizador é o mesmo para todos os convites.
   ========================================================= */

let selectedTemplate = null;
let layerPositions = {};
let layerSizes = {};
let layerColors = {};
let selectedLayerIndex = null;
let history = [];
let historyIndex = -1;
let restoringHistory = false;

/* Inicializa a página dos modelos. */
function initializeModelsPage() {
  const params = new URLSearchParams(location.search);
  const categoryId = params.get("categoria") || "infantil";
  const themeId = params.get("tema") || "";
  const modelId = params.get("modelo") || "";
  const themeModels = INVITATION_THEMES[themeId] || [];
  const items = modelId
    ? INVITATION_TEMPLATES.filter(item => item.id === modelId)
    : themeModels;

  const themeName = themeModels[0]?.themeName || prettifyClientName(themeId);
  const backLink = document.getElementById("back-link");
  const header = document.getElementById("models-header");
  const grid = document.getElementById("models-grid");

  backLink.href = `categoria.html?categoria=${encodeURIComponent(categoryId)}`;

  header.innerHTML = `
    <div class="category-page-title">
      <span class="eyebrow">${escapeHtml(themeName)}</span>
      <h1>${escapeHtml(themeName)}</h1>
      <div class="title-decoration">
        <span></span>
        <b>♥</b>
        <span></span>
      </div>
      <p>Escolha o convite que deseja personalizar.</p>
    </div>
  `;

  grid.innerHTML = items.length
    ? items.map(createInvitationCard).join("")
    : `
      <div class="empty-category">
        <h2>Ainda não há convites neste tema</h2>
        <p>Coloca as imagens do novo convite na pasta do tema.</p>
      </div>
    `;

  lucide.createIcons();
  setupMenu();
  setupCustomizer();
  setupEditorControls();

  document.querySelectorAll(".customize-template").forEach(button => {
    button.addEventListener("click", () => {
      openCustomizer(button.dataset.template);
    });
  });
}

/* Cria um cartão para cada modelo encontrado automaticamente. */
function createInvitationCard(template) {
  return `
    <article class="invitation-card">
      <div class="invitation-image invitation-image-portrait">
        <img
          src="${template.image}"
          onerror="this.src='${template.fallbackImage || "Images/infantil.jpg"}'"
          alt="${escapeHtml(template.name)}"
        >
      </div>
      <div class="invitation-info">
        <h3>${escapeHtml(template.name)}</h3>
        <p>${escapeHtml(template.description || "")}</p>
        <p class="template-price">€ ${Number(template.priceEUR || 5).toFixed(2)}</p>
        <button
          class="btn btn-primary customize-template"
          data-template="${template.id}"
          type="button"
        >
          Personalizar
        </button>
      </div>
    </article>
  `;
}

/* Configura o menu mobile. */
function setupMenu() {
  const menu = document.getElementById("menu");
  const mobileButton = document.getElementById("menu-mobile");

  mobileButton?.addEventListener("click", () => {
    const open = menu.classList.toggle("ativo");
    mobileButton.classList.toggle("aberto", open);
  });
}

/* Instala no navegador as fontes que pertencem ao modelo selecionado. */
function installTemplateFonts(template) {
  /* Não faz nada se o servidor não encontrou ficheiros de fonte. */
  if (!template?.fontFiles) return;

  /* Remove apenas as fontes dinâmicas instaladas anteriormente pelo editor. */
  document.querySelectorAll("style[data-toninvitation-template-fonts]").forEach(style => {
    style.remove();
  });

  /* Cria uma folha de estilos exclusiva para o modelo atual. */
  const style = document.createElement("style");
  style.dataset.toninvitationTemplateFonts = "true";

  /* Constrói as regras @font-face para todas as fontes encontradas. */
  style.textContent = Object.entries(template.fontFiles)
    .map(([fontFamily, fontUrl]) => {
      const safeFamily = String(fontFamily).replace(/[^a-zA-Z0-9 _-]/g, "");
      const safeUrl = String(fontUrl).replace(/"/g, "\\\"");
      const extension = safeUrl.split("?")[0].split(".").pop().toLowerCase();
      const formatMap = {
        ttf: "truetype",
        otf: "opentype",
        woff: "woff",
        woff2: "woff2"
      };
      const format = formatMap[extension] || "truetype";

      return `@font-face { font-family: "${safeFamily}"; src: url("${safeUrl}") format("${format}"); font-style: normal; font-weight: 100 900; font-display: swap; }`;
    })
    .join("\n");

  document.head.appendChild(style);
}

/* Aguarda as fontes do modelo antes de atualizar o convite. */
async function waitForTemplateFonts(template) {
  installTemplateFonts(template);

  if (!document.fonts) return;

  const families = new Set();

  Object.values(template.fontFiles || {}).forEach(fontFamily => {
    families.add(fontFamily);
  });

  (template.textLayers || []).forEach(layer => {
    if (layer.font) {
      families.add(String(layer.font).split(",")[0].replace(/["']/g, "").trim());
    }
  });

  for (const fontFamily of families) {
    try {
      await document.fonts.load(`700 32px "${fontFamily}"`);
    } catch (error) {
      console.warn(`Não foi possível carregar a fonte: ${fontFamily}`);
    }
  }
}

/* Mostra apenas os campos que o modelo realmente utiliza. */
function applyTemplateFormConfiguration(template) {
  const editableFields = new Set(
    template.editableFields || [
      "name",
      "age",
      "date",
      "time",
      "place",
      "adventure",
      "faz",
      "anos",
      "end",
      "otherInfo"
    ]
  );

  const fieldGroupMap = {
    name: "field-group-name",
    age: "field-group-age",
    date: "field-group-date",
    time: "field-group-time",
    place: "field-group-place",
    otherInfo: "field-group-other-info"
  };

  Object.entries(fieldGroupMap).forEach(([field, groupId]) => {
    const group = document.getElementById(groupId);

    if (group) {
      group.hidden = !editableFields.has(field);
    }
  });

  const phraseGroup = document.getElementById("field-group-phrases");

  if (phraseGroup) {
    const phraseFields = ["adventure", "faz", "anos", "end"];
    phraseGroup.hidden = !phraseFields.some(field => editableFields.has(field));
  }
}

/* Abre o personalizador. */
function openCustomizer(id) {
  selectedTemplate = INVITATION_TEMPLATES.find(template => template.id === id);

  if (!selectedTemplate) return;

  applyTemplateFormConfiguration(selectedTemplate);
  fillDefaultFields();
  resetEditorState();
  updatePreview();
  waitForTemplateFonts(selectedTemplate).then(updatePreview);

  const modal = document.getElementById("customizer-modal");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  updateHistoryButtons();
  updateSelectedLayerControls();
}

/* Fecha apenas quando o X for usado. */
function closeCustomizer() {
  const modal = document.getElementById("customizer-modal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelector(".modal-close[data-close-modal]")?.addEventListener("click", closeCustomizer);

/* Preenche os campos com os valores definidos para o modelo. */
function fillDefaultFields() {
  document.getElementById("customizer-title").textContent = `Personalize: ${selectedTemplate.name}`;
  document.getElementById("field-name").value = selectedTemplate.defaultName || "";
  document.getElementById("field-age").value = selectedTemplate.defaultAge || "";
  document.getElementById("field-date").value = selectedTemplate.defaultDate || "";
  document.getElementById("field-time").value = selectedTemplate.defaultTime || "";
  document.getElementById("field-place").value = selectedTemplate.defaultPlace || "";
  document.getElementById("field-adventure").value = selectedTemplate.defaultAdventure || "";
  document.getElementById("field-faz").value = selectedTemplate.defaultFaz || "";
  document.getElementById("field-anos").value = selectedTemplate.defaultAnos || "";
  document.getElementById("field-end").value = selectedTemplate.defaultEnd || "";
  document.getElementById("field-other-info").value = selectedTemplate.defaultOtherInfo || "";
  document.getElementById("field-email").value = "";
  document.getElementById("form-message").textContent = "";
}

/* Repõe posições, tamanhos e cores do modelo. */
function resetEditorState() {
  layerPositions = {};
  layerSizes = {};
  layerColors = {};
  selectedLayerIndex = null;

  (selectedTemplate.textLayers || []).forEach((layer, index) => {
    layerPositions[index] = { x: layer.x, y: layer.y };
    layerSizes[index] = layer.size;
    layerColors[index] = layer.color || "#07588c";
  });

  history = [];
  historyIndex = -1;
  restoringHistory = false;
  pushHistory();
}

/* Obtém os campos editáveis. */
function getEditableFieldIds() {
  return [
    "field-name",
    "field-age",
    "field-date",
    "field-time",
    "field-place",
    "field-adventure",
    "field-faz",
    "field-anos",
    "field-end",
    "field-other-info"
  ];
}

/* Guarda o estado atual para undo/redo. */
function captureState() {
  const fields = {};

  getEditableFieldIds().forEach(id => {
    fields[id] = document.getElementById(id)?.value ?? "";
  });

  return {
    fields,
    positions: cloneObject(layerPositions),
    sizes: cloneObject(layerSizes),
    colors: cloneObject(layerColors)
  };
}

/* Faz uma cópia profunda simples de um objeto. */
function cloneObject(object) {
  return JSON.parse(JSON.stringify(object || {}));
}

/* Compara dois estados. */
function statesAreEqual(first, second) {
  return JSON.stringify(first) === JSON.stringify(second);
}

/* Adiciona uma alteração ao histórico. */
function pushHistory() {
  if (!selectedTemplate || restoringHistory) return;

  const nextState = captureState();
  const currentState = history[historyIndex];

  if (currentState && statesAreEqual(currentState, nextState)) return;

  history = history.slice(0, historyIndex + 1);
  history.push(nextState);
  historyIndex = history.length - 1;
  updateHistoryButtons();
}

/* Repõe um estado anterior. */
function restoreState(state) {
  if (!state) return;

  restoringHistory = true;

  Object.entries(state.fields).forEach(([id, value]) => {
    const input = document.getElementById(id);
    if (input) input.value = value;
  });

  layerPositions = cloneObject(state.positions);
  layerSizes = cloneObject(state.sizes);
  layerColors = cloneObject(state.colors);
  restoringHistory = false;

  updatePreview();
  updateSelectedLayerControls();
  updateHistoryButtons();
}

/* Volta à alteração anterior. */
function undoChange() {
  if (historyIndex <= 0) return;
  historyIndex -= 1;
  restoreState(history[historyIndex]);
}

/* Avança para a alteração seguinte. */
function redoChange() {
  if (historyIndex >= history.length - 1) return;
  historyIndex += 1;
  restoreState(history[historyIndex]);
}

/* Repõe todos os campos e camadas no estado original. */
function resetToDefault() {
  if (!selectedTemplate) return;

  const defaultState = buildDefaultState();

  if (statesAreEqual(captureState(), defaultState)) return;

  restoreState(defaultState);
  pushHistory();
}

/* Cria o estado original do modelo. */
function buildDefaultState() {
  const fields = {};

  getEditableFieldIds().forEach(id => {
    const fieldMap = {
      "field-name": "defaultName",
      "field-age": "defaultAge",
      "field-date": "defaultDate",
      "field-time": "defaultTime",
      "field-place": "defaultPlace",
      "field-adventure": "defaultAdventure",
      "field-faz": "defaultFaz",
      "field-anos": "defaultAnos",
      "field-end": "defaultEnd",
      "field-other-info": "defaultOtherInfo"
    };
    fields[id] = selectedTemplate[fieldMap[id]] || "";
  });

  const positions = {};
  const sizes = {};
  const colors = {};

  (selectedTemplate.textLayers || []).forEach((layer, index) => {
    positions[index] = { x: layer.x, y: layer.y };
    sizes[index] = layer.size;
    colors[index] = layer.color || "#07588c";
  });

  return { fields, positions, sizes, colors };
}

/* Atualiza o estado visual dos botões de histórico. */
function updateHistoryButtons() {
  const undo = document.getElementById("undo-button");
  const redo = document.getElementById("redo-button");
  const reset = document.getElementById("reset-button");

  if (undo) undo.disabled = historyIndex <= 0;
  if (redo) redo.disabled = historyIndex >= history.length - 1;
  if (reset) reset.disabled = !selectedTemplate || statesAreEqual(captureState(), buildDefaultState());
}

/* Configura os controlos do editor. */
function setupEditorControls() {
  document.getElementById("undo-button")?.addEventListener("click", undoChange);
  document.getElementById("redo-button")?.addEventListener("click", redoChange);
  document.getElementById("reset-button")?.addEventListener("click", resetToDefault);

  document.getElementById("decrease-size")?.addEventListener("click", () => {
    changeSelectedLayerSize(-0.5);
  });

  document.getElementById("increase-size")?.addEventListener("click", () => {
    changeSelectedLayerSize(0.5);
  });

  document.getElementById("selected-layer-color")?.addEventListener("input", event => {
    changeSelectedLayerColor(event.target.value);
  });
}

/* Seleciona uma camada de texto. */
function selectLayer(index) {
  selectedLayerIndex = index;
  updateSelectedLayerControls();
  updateLayerSelectionVisuals();
}

/* Atualiza a indicação da camada selecionada. */
function updateLayerSelectionVisuals() {
  document.querySelectorAll(".invitation-text-layer").forEach(element => {
    const index = Number(element.dataset.layerIndex);
    element.classList.toggle("is-selected", index === selectedLayerIndex);
  });
}

/* Aumenta ou diminui o tamanho da camada selecionada. */
function changeSelectedLayerSize(delta) {
  if (selectedLayerIndex === null) return;

  const currentSize = Number(
    layerSizes[selectedLayerIndex] ??
    selectedTemplate.textLayers[selectedLayerIndex]?.size ??
    5
  );

  const nextSize = Math.max(1, Math.min(40, currentSize + delta));

  if (nextSize === currentSize) return;

  layerSizes[selectedLayerIndex] = Number(nextSize.toFixed(1));
  updatePreview();
  pushHistory();
  selectLayer(selectedLayerIndex);
}

/* Atualiza os controlos do texto selecionado. */
function updateSelectedLayerControls() {
  const label = document.getElementById("selected-layer-label");
  const sizeLabel = document.getElementById("selected-layer-size");
  const colorInput = document.getElementById("selected-layer-color");
  const decrease = document.getElementById("decrease-size");
  const increase = document.getElementById("increase-size");

  if (selectedLayerIndex === null || !selectedTemplate?.textLayers?.[selectedLayerIndex]) {
    if (label) label.textContent = "Selecione um texto";
    if (sizeLabel) sizeLabel.textContent = "—";
    if (colorInput) {
      colorInput.value = "#07588c";
      colorInput.disabled = true;
    }
    if (decrease) decrease.disabled = true;
    if (increase) increase.disabled = true;
    return;
  }

  const layer = selectedTemplate.textLayers[selectedLayerIndex];
  const size = layerSizes[selectedLayerIndex] ?? layer.size;
  const color = layerColors[selectedLayerIndex] || layer.color || "#07588c";

  if (label) label.textContent = layer.label || getLayerLabel(layer);
  if (sizeLabel) sizeLabel.textContent = `${Number(size).toFixed(1)}%`;
  if (colorInput) {
    colorInput.value = color;
    colorInput.disabled = false;
  }
  if (decrease) decrease.disabled = size <= 1;
  if (increase) increase.disabled = size >= 40;
}

/* Altera a cor da camada selecionada. */
function changeSelectedLayerColor(color) {
  if (selectedLayerIndex === null) return;
  layerColors[selectedLayerIndex] = color;
  updatePreview();
  pushHistory();
  updateSelectedLayerControls();
}

/* Obtém um nome legível para uma camada. */
function getLayerLabel(layer) {
  const labels = {
    name: "Nome",
    faz: "Faz",
    age: "Idade",
    anos: "Anos",
    adventure: "Frase principal",
    "date-month": "Mês",
    "date-day": "Dia",
    "weekday-time": "Dia e hora",
    place: "Morada",
    end: "Frase final",
    otherInfo: "Outras informações"
  };

  return labels[layer.field] || "Texto";
}

/* Atualiza a imagem e as camadas no mockup. */
function updatePreview() {
  if (!selectedTemplate) return;

  const preview = document.getElementById("invitation-preview");
  preview.innerHTML = "";
  preview.dataset.themeId = selectedTemplate.themeId || selectedTemplate.theme || "";
  preview.style.backgroundImage = selectedTemplate.previewImage
    ? `url("${selectedTemplate.previewImage}")`
    : "none";
  preview.style.backgroundColor = "#fff";

  renderLayeredInvitation(preview);
  updateSelectedLayerControls();
}

/* Desenha todas as camadas de texto. */
function renderLayeredInvitation(preview) {
  (selectedTemplate.textLayers || []).forEach((layer, index) => {
    const element = document.createElement("div");
    const position = layerPositions[index] || { x: layer.x, y: layer.y };
    const size = layerSizes[index] ?? layer.size;
    const value = getLayerValue(layer);

    element.className = `invitation-text-layer ${layer.className || ""}`;
    element.dataset.field = layer.field || "";
    element.dataset.layerIndex = index;
    element.textContent = value;
    element.style.left = `${position.x}%`;
    element.style.top = `${position.y}%`;
    element.style.fontSize = `${size}cqw`;
    element.style.color = layerColors[index] || layer.color || "#07588c";
    element.style.fontFamily = layer.font || "Horta, sans-serif";
    element.style.fontWeight = layer.weight || "700";
    element.style.lineHeight = layer.lineHeight || "1";
    element.style.textAlign = layer.align || "center";
    element.style.textShadow = layer.shadow || "none";
    element.style.letterSpacing = layer.letterSpacing || "normal";
    element.style.transform = `translate(-50%, -50%) rotate(${layer.rotate || 0}deg)`;

    if (!value) element.classList.add("is-empty");

    element.addEventListener("pointerdown", startDraggingLayer);
    element.addEventListener("click", () => selectLayer(index));
    preview.appendChild(element);
  });

  updateLayerSelectionVisuals();
}

/* Permite arrastar uma camada sem impor uma área fixa. */
function startDraggingLayer(event) {
  const layer = event.currentTarget;
  const preview = document.getElementById("invitation-preview");
  const index = Number(layer.dataset.layerIndex);

  if (!Number.isInteger(index)) return;

  event.preventDefault();
  selectLayer(index);
  layer.setPointerCapture?.(event.pointerId);
  layer.classList.add("is-dragging");

  const startX = event.clientX;
  const startY = event.clientY;
  const startPosition = { ...(layerPositions[index] || { x: 50, y: 50 }) };
  let moved = false;

  function move(moveEvent) {
    const rect = preview.getBoundingClientRect();
    const deltaX = ((moveEvent.clientX - startX) / rect.width) * 100;
    const deltaY = ((moveEvent.clientY - startY) / rect.height) * 100;

    if (Math.abs(deltaX) > 0.05 || Math.abs(deltaY) > 0.05) moved = true;

    const nextX = startPosition.x + deltaX;
    const nextY = startPosition.y + deltaY;

    layerPositions[index] = { x: nextX, y: nextY };
    layer.style.left = `${nextX}%`;
    layer.style.top = `${nextY}%`;
  }

  function end() {
    layer.classList.remove("is-dragging");
    layer.releasePointerCapture?.(event.pointerId);
    layer.removeEventListener("pointermove", move);
    layer.removeEventListener("pointerup", end);
    layer.removeEventListener("pointercancel", end);

    if (moved) pushHistory();
    updateHistoryButtons();
  }

  layer.addEventListener("pointermove", move);
  layer.addEventListener("pointerup", end);
  layer.addEventListener("pointercancel", end);
}

/* Obtém o valor atual de uma camada. */
function getLayerValue(layer) {
  if (layer.value !== undefined && !layer.field) return layer.value;

  if (layer.field === "date-month") {
    return formatSelectedDate(getFieldValue("date", "")).month;
  }

  if (layer.field === "date-day") {
    return formatSelectedDate(getFieldValue("date", "")).day;
  }

  if (layer.field === "weekday-time") {
    const dateInfo = formatSelectedDate(getFieldValue("date", ""));
    const time = getFieldValue("time", "").trim();

    if (!dateInfo.weekday && !time) return "";
    if (!dateInfo.weekday) return time.toUpperCase();
    if (!time) return dateInfo.weekday.toUpperCase();

    return `${dateInfo.weekday.toUpperCase()} ÀS ${time.toUpperCase()}`;
  }

  return getFieldValue(layer.field, layer.fallback);
}

/* Converte a data escolhida no calendário para os textos do convite. */
function formatSelectedDate(value) {
  if (!value) return { day: "", month: "", weekday: "" };

  const parts = String(value).split("-").map(Number);

  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return { day: "", month: "", weekday: "" };
  }

  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  const weekday = new Intl.DateTimeFormat("pt-PT", { weekday: "long" }).format(date);
  const monthName = new Intl.DateTimeFormat("pt-PT", { month: "long" }).format(date);

  return {
    day: String(day),
    month: monthName.toUpperCase(),
    weekday
  };
}

/* Liga nomes de campos aos inputs do formulário. */
function getFieldValue(field, fallback = "") {
  const map = {
    name: "field-name",
    age: "field-age",
    date: "field-date",
    time: "field-time",
    place: "field-place",
    adventure: "field-adventure",
    faz: "field-faz",
    anos: "field-anos",
    end: "field-end",
    otherInfo: "field-other-info"
  };

  return document.getElementById(map[field])?.value ?? fallback ?? "";
}

/* Regista alterações feitas nos campos. */
getEditableFieldIds().forEach(id => {
  document.getElementById(id)?.addEventListener("input", () => {
    updatePreview();
    pushHistory();
  });
});

/* Obtém o país aproximado a partir do idioma escolhido no site. */
function getShopifyCountryCode() {
  /* Usa o idioma guardado pelo sistema de traduções. */
  const language = localStorage.getItem("toninvitation-language") || "pt";

  /* Converte os idiomas disponíveis em códigos de país para o checkout. */
  const languageCountryMap = {
    pt: "PT",
    en: "GB",
    fr: "FR",
    es: "ES"
  };

  /* Devolve Portugal como fallback. */
  return languageCountryMap[language] || "PT";
}

/* Configura a criação do pedido. */
function setupCustomizer() {
  const form = document.getElementById("customizer-form");
  if (!form) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const email = document.getElementById("field-email").value.trim();
    const message = document.getElementById("form-message");
    const button = event.currentTarget.querySelector("button[type=submit]");

    if (!email) {
      message.textContent = "Indique o e-mail onde pretende receber o convite.";
      return;
    }

    const selectedDate = getFieldValue("date", "");
    const dateInfo = formatSelectedDate(selectedDate);
    const overlay = await createTextOverlayDataUrl();

    const order = {
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      previewImage: selectedTemplate.previewImage,
      textOverlayDataUrl: overlay,
      name: getFieldValue("name", selectedTemplate.defaultName),
      age: getFieldValue("age", selectedTemplate.defaultAge),
      date: selectedDate,
      weekday: dateInfo.weekday,
      time: getFieldValue("time", selectedTemplate.defaultTime),
      place: getFieldValue("place", selectedTemplate.defaultPlace),
      adventure: getFieldValue("adventure", selectedTemplate.defaultAdventure),
      faz: getFieldValue("faz", selectedTemplate.defaultFaz),
      anos: getFieldValue("anos", selectedTemplate.defaultAnos),
      end: getFieldValue("end", selectedTemplate.defaultEnd),
      otherInfo: getFieldValue("otherInfo", selectedTemplate.defaultOtherInfo),
      positions: cloneObject(layerPositions),
      sizes: cloneObject(layerSizes),
      colors: cloneObject(layerColors),
      editableFields: selectedTemplate.editableFields || [],
      fontFiles: cloneObject(selectedTemplate.fontFiles || {}),
      email
    };

    button.disabled = true;
    button.textContent = "A criar pedido...";

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível criar o pedido.");
      }

      /* Exige que o modelo tenha um produto/variante correspondente na Shopify. */
      if (!selectedTemplate.shopifyVariantId) {
        throw new Error(
          "Este convite ainda não está ligado a um produto Shopify. Adiciona o Shopify Variant ID no config.json deste convite."
        );
      }

      /* Informa o servidor que queremos criar o checkout Shopify para este pedido. */
      button.textContent = "A abrir pagamento seguro...";

      const checkoutResponse = await fetch("/api/shopify/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orderId: data.orderId,
          variantId: selectedTemplate.shopifyVariantId,
          countryCode: getShopifyCountryCode()
        })
      });

      /* Converte a resposta do checkout para JSON. */
      const checkoutData = await checkoutResponse.json();

      /* Mostra o erro caso a Shopify não consiga criar o checkout. */
      if (!checkoutResponse.ok) {
        throw new Error(
          checkoutData.error || "Não foi possível abrir o checkout Shopify."
        );
      }

      /* Guarda o Order ID para podermos mostrá-lo quando o cliente voltar à loja. */
      sessionStorage.setItem("toninvitation-last-order-id", data.orderId);

      /* Mostra a confirmação antes de encaminhar o cliente para a Shopify. */
      message.innerHTML = `
        <strong>Pedido ${escapeHtml(data.orderId)} criado.</strong><br>
        A abrir o pagamento seguro...
      `;

      /* Encaminha o cliente para o checkout oficial da Shopify. */
      window.location.href = checkoutData.checkoutUrl;
    } catch (error) {
      message.textContent = error.message;
      button.disabled = false;
      button.textContent = "Ir para pagamento seguro";
    }
  });
}

/* Cria uma camada PNG transparente com os textos personalizados. */
async function createTextOverlayDataUrl() {
  /* Instala e carrega as fontes reais do modelo antes de desenhar. */
  await waitForTemplateFonts(selectedTemplate);

  /* Aguarda o carregamento geral das fontes do navegador. */
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const context = canvas.getContext("2d");

  (selectedTemplate.textLayers || []).forEach((layer, index) => {
    const value = getLayerValue(layer);
    if (!value) return;

    const position = layerPositions[index] || { x: layer.x, y: layer.y };
    const size = layerSizes[index] ?? layer.size;
    const fontFamily = layer.font || "Horta";
    const pixelSize = size / 100 * 1080;

    context.save();
    context.translate(position.x / 100 * 1080, position.y / 100 * 1920);
    context.rotate((layer.rotate || 0) * Math.PI / 180);
    context.font = `${layer.weight || 700} ${pixelSize}px "${String(fontFamily).split(",")[0].replace(/["']/g, "").trim()}"`;
    context.fillStyle = layerColors[index] || layer.color || "#07588c";
    context.textAlign = layer.align || "center";
    context.textBaseline = "middle";

    if (layer.shadow) {
      context.shadowColor = "#00538b";
      context.shadowOffsetX = pixelSize * 0.04;
      context.shadowOffsetY = pixelSize * 0.05;
      context.shadowBlur = 0;
    }

    const lines = String(value).split("\n");
    const lineHeight = pixelSize * Number(layer.lineHeight || 1);
    const startOffset = -(lines.length - 1) * lineHeight / 2;

    lines.forEach((line, lineIndex) => {
      context.fillText(line, 0, startOffset + lineIndex * lineHeight);
    });

    context.restore();
  });

  return canvas.toDataURL("image/png");
}

/* Mostra um texto legível para o tema. */
function prettifyClientName(value) {
  return String(value || "Convites")
    .replace(/^[^-]+-/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

/* Escapa texto antes de o inserir em HTML. */
function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* Inicializa quando o catálogo estiver carregado. */
window.addEventListener("toninvitation:catalog-ready", initializeModelsPage);
