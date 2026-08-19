/* =========================================================
   PÁGINA DE MODELOS / PERSONALIZADOR

   Toy Story 1:
   - a imagem completa aparece no cartão do modelo;
   - a imagem "_com.png" é o fundo do convite;
   - os textos são camadas independentes;
   - cada camada pode ser arrastada e redimensionada;
   - existe histórico para voltar/avançar alterações;
   - "Default" repõe textos, posições e tamanhos originais.
   ========================================================= */

/* =========================================================
   ESTADO GLOBAL DO PERSONALIZADOR
   ========================================================= */

let selectedTemplate = null;
let layerPositions = {};
let layerSizes = {};
let layerColors = {};
let selectedLayerIndex = null;

/* Histórico de alterações. */
let history = [];
let historyIndex = -1;
let restoringHistory = false;

/* =========================================================
   INICIALIZAÇÃO DA PÁGINA
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const categoryId = params.get("categoria") || "infantil";
  const themeId = params.get("tema") || "";

  const theme = (INVITATION_THEMES[categoryId] || []).find(
    item => item.id === themeId
  );

  const backLink = document.getElementById("back-link");
  const header = document.getElementById("models-header");
  const grid = document.getElementById("models-grid");

  backLink.href = `categoria.html?categoria=${encodeURIComponent(categoryId)}`;

  header.innerHTML = `
    <div class="category-page-title">
      <span class="eyebrow">${theme?.name || "CONVITES"}</span>
      <h1>${theme?.name || "Convites"}</h1>
      <div class="title-decoration">
        <span></span>
        <b>♥</b>
        <span></span>
      </div>
      <p>Escolha o convite que deseja personalizar.</p>
    </div>
  `;

  const items = INVITATION_TEMPLATES.filter(
    item => item.category === categoryId && item.theme === themeId
  );

  grid.innerHTML = items.length
    ? items.map(createInvitationCard).join("")
    : `
      <div class="empty-category">
        <h2>Ainda não há convites neste tema</h2>
        <p>Adiciona o novo convite ao templates.js.</p>
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
});

/* =========================================================
   CARTÃO DO MODELO
   ========================================================= */

function createInvitationCard(template) {
  return `
    <article class="invitation-card">
      <div class="invitation-image invitation-image-portrait">
        <img
          src="${template.image}"
          onerror="this.src='${template.fallbackImage}'"
          alt="${template.name}"
        >
      </div>

      <div class="invitation-info">
        <h3>${template.name}</h3>
        <p>${template.description}</p>
        <button
          class="btn btn-primary customize-template"
          data-template="${template.id}"
        >
          Personalizar
        </button>
      </div>
    </article>
  `;
}

/* =========================================================
   MENU MOBILE
   ========================================================= */

function setupMenu() {
  const menu = document.getElementById("menu");
  const mobileButton = document.getElementById("menu-mobile");

  mobileButton?.addEventListener("click", () => {
    const open = menu.classList.toggle("ativo");
    mobileButton.classList.toggle("aberto", open);
  });
}

/* =========================================================
   ABRIR / FECHAR PERSONALIZADOR
   ========================================================= */

function openCustomizer(id) {
  selectedTemplate = INVITATION_TEMPLATES.find(
    template => template.id === id
  );

  if (!selectedTemplate) return;

  fillDefaultFields();
  resetEditorState();
  updatePreview();

  const modal = document.getElementById("customizer-modal");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  updateHistoryButtons();
  updateSelectedLayerControls();
}

function closeCustomizer() {
  const modal = document.getElementById("customizer-modal");

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelector(".modal-close[data-close-modal]")?.addEventListener(
  "click",
  closeCustomizer
);

/* =========================================================
   ESTADO DEFAULT
   ========================================================= */

function resetEditorState() {
  layerPositions = {};
  layerSizes = {};
  layerColors = {};
  selectedLayerIndex = null;

  (selectedTemplate.textLayers || []).forEach((layer, index) => {
    layerPositions[index] = {
      x: layer.x,
      y: layer.y
    };

    layerSizes[index] = layer.size;
    layerColors[index] = layer.field === "otherInfo"
      ? (selectedTemplate.defaultOtherInfoColor || layer.color || "#07588c")
      : (layer.color || "#07588c");
  });

  history = [];
  historyIndex = -1;
  restoringHistory = false;

  pushHistory();
}

function fillDefaultFields() {
  document.getElementById("customizer-title").textContent =
    `Personalize: ${selectedTemplate.name}`;

  document.getElementById("field-name").value =
    selectedTemplate.defaultName || "";

  document.getElementById("field-age").value =
    selectedTemplate.defaultAge || "";

  document.getElementById("field-date").value =
    selectedTemplate.defaultDate || "";

  document.getElementById("field-time").value =
    selectedTemplate.defaultTime || "";

  document.getElementById("field-place").value =
    selectedTemplate.defaultPlace || "";

  document.getElementById("field-adventure").value =
    selectedTemplate.defaultAdventure || "";

  document.getElementById("field-faz").value =
    selectedTemplate.defaultFaz || "";

  document.getElementById("field-anos").value =
    selectedTemplate.defaultAnos || "";

  document.getElementById("field-end").value =
    selectedTemplate.defaultEnd || "";

  document.getElementById("field-other-info").value =
    selectedTemplate.defaultOtherInfo || "";

  document.getElementById("field-email").value = "";
  document.getElementById("form-message").textContent = "";
}

/* =========================================================
   HISTÓRICO: VOLTAR / AVANÇAR
   ========================================================= */

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

function cloneObject(object) {
  return JSON.parse(JSON.stringify(object || {}));
}

function statesAreEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function pushHistory() {
  if (!selectedTemplate || restoringHistory) return;

  const nextState = captureState();
  const currentState = history[historyIndex];

  if (currentState && statesAreEqual(currentState, nextState)) {
    return;
  }

  /* Uma nova alteração depois de "voltar" elimina o ramo de redo. */
  history = history.slice(0, historyIndex + 1);
  history.push(nextState);
  historyIndex = history.length - 1;

  updateHistoryButtons();
}

function restoreState(state) {
  if (!state) return;

  restoringHistory = true;

  Object.entries(state.fields).forEach(([id, value]) => {
    const input = document.getElementById(id);
    if (input) input.value = value;
  });

  layerPositions = cloneObject(state.positions);
  layerSizes = cloneObject(state.sizes);
  layerColors = cloneObject(state.colors || {});

  restoringHistory = false;

  updatePreview();
  updateSelectedLayerControls();
  updateHistoryButtons();
}

function undoChange() {
  if (historyIndex <= 0) return;

  historyIndex -= 1;
  restoreState(history[historyIndex]);
}

function redoChange() {
  if (historyIndex >= history.length - 1) return;

  historyIndex += 1;
  restoreState(history[historyIndex]);
}

function resetToDefault() {
  if (!selectedTemplate) return;

  /*
    O default é exatamente o estado inicial definido no templates.js:
    textos, posições e tamanhos.
  */
  const defaultState = buildDefaultState();

  if (statesAreEqual(captureState(), defaultState)) return;

  restoringHistory = true;

  Object.entries(defaultState.fields).forEach(([id, value]) => {
    const input = document.getElementById(id);
    if (input) input.value = value;
  });

  layerPositions = cloneObject(defaultState.positions);
  layerSizes = cloneObject(defaultState.sizes);
  layerColors = cloneObject(defaultState.colors);
  selectedLayerIndex = null;

  restoringHistory = false;

  pushHistory();
  updatePreview();
  updateSelectedLayerControls();
}

function buildDefaultState() {
  const fields = {};

  fields["field-name"] = selectedTemplate.defaultName || "";
  fields["field-age"] = selectedTemplate.defaultAge || "";
  fields["field-date"] = selectedTemplate.defaultDate || "";
  fields["field-time"] = selectedTemplate.defaultTime || "";
  fields["field-place"] = selectedTemplate.defaultPlace || "";
  fields["field-adventure"] = selectedTemplate.defaultAdventure || "";
  fields["field-faz"] = selectedTemplate.defaultFaz || "";
  fields["field-anos"] = selectedTemplate.defaultAnos || "";
  fields["field-end"] = selectedTemplate.defaultEnd || "";
  fields["field-other-info"] = selectedTemplate.defaultOtherInfo || "";

  const positions = {};
  const sizes = {};
  const colors = {};

  (selectedTemplate.textLayers || []).forEach((layer, index) => {
    positions[index] = {
      x: layer.x,
      y: layer.y
    };

    sizes[index] = layer.size;
    colors[index] = layer.field === "otherInfo"
      ? (selectedTemplate.defaultOtherInfoColor || layer.color || "#07588c")
      : (layer.color || "#07588c");
  });

  return {
    fields,
    positions,
    sizes,
    colors
  };
}

function updateHistoryButtons() {
  const undo = document.getElementById("undo-button");
  const redo = document.getElementById("redo-button");
  const reset = document.getElementById("reset-button");

  if (undo) undo.disabled = historyIndex <= 0;
  if (redo) redo.disabled = historyIndex >= history.length - 1;
  if (reset) reset.disabled = statesAreEqual(captureState(), buildDefaultState());
}

/* =========================================================
   FERRAMENTAS DE TAMANHO
   ========================================================= */

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

function selectLayer(index) {
  selectedLayerIndex = index;
  updateSelectedLayerControls();
  updateLayerSelectionVisuals();
}

function updateLayerSelectionVisuals() {
  document.querySelectorAll(".invitation-text-layer").forEach(element => {
    const index = Number(element.dataset.layerIndex);
    element.classList.toggle("is-selected", index === selectedLayerIndex);
  });
}

function changeSelectedLayerSize(delta) {
  if (selectedLayerIndex === null) return;

  const currentSize = Number(
    layerSizes[selectedLayerIndex] ??
    selectedTemplate.textLayers[selectedLayerIndex]?.size ??
    5
  );

  const nextSize = Math.max(1, Math.min(30, currentSize + delta));

  if (nextSize === currentSize) return;

  layerSizes[selectedLayerIndex] = Number(nextSize.toFixed(1));

  pushHistory();
  updatePreview();
  selectLayer(selectedLayerIndex);
}

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
  if (increase) increase.disabled = size >= 30;
}

function changeSelectedLayerColor(color) {
  if (selectedLayerIndex === null) return;

  layerColors[selectedLayerIndex] = color;
  updatePreview();
  pushHistory();
  updateSelectedLayerControls();
}

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
    "place-label": "Título do local",
    place: "Morada",
    end: "Frase final"
  };

  return labels[layer.field] || "Texto";
}

/* =========================================================
   PRÉ-VISUALIZAÇÃO
   ========================================================= */

function updatePreview() {
  if (!selectedTemplate) return;

  const preview = document.getElementById("invitation-preview");
  const isLayered = Array.isArray(selectedTemplate.textLayers);

  preview.innerHTML = "";
  preview.style.backgroundImage = selectedTemplate.previewImage
    ? `url("${selectedTemplate.previewImage}")`
    : "none";
  preview.style.backgroundColor = selectedTemplate.previewImage
    ? "#fff"
    : "#fff7f4";

  if (isLayered) {
    renderLayeredInvitation(preview);
  } else {
    renderLegacyInvitation(preview);
  }

  updateSelectedLayerControls();
}

/* =========================================================
   DESENHO DAS CAMADAS
   ========================================================= */

function renderLayeredInvitation(preview) {
  selectedTemplate.textLayers.forEach((layer, index) => {
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
    const layerColor = layerColors[index] || layer.color || "#07588c";

    element.style.color = layerColor;
    element.style.fontFamily = layer.font || "HortaRegular, Horta, sans-serif";
    element.style.fontWeight = layer.weight || "700";
    element.style.lineHeight = layer.lineHeight || "1";
    element.style.textAlign = layer.align || "center";
    element.style.textShadow = layer.shadow || "none";
    element.style.letterSpacing = layer.letterSpacing || "normal";
    element.style.transform = `translate(-50%, -50%) rotate(${layer.rotate || 0}deg)`;

    if (!value) {
      element.classList.add("is-empty");
    }

    element.addEventListener("pointerdown", startDraggingLayer);
    element.addEventListener("click", () => selectLayer(index));

    preview.appendChild(element);
  });

  updateLayerSelectionVisuals();
}

/* =========================================================
   ARRASTAR TEXTO
   ========================================================= */

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
  const startPosition = {
    ...(layerPositions[index] || { x: 50, y: 50 })
  };

  let moved = false;

  function move(eventMove) {
    const rect = preview.getBoundingClientRect();
    const deltaX = ((eventMove.clientX - startX) / rect.width) * 100;
    const deltaY = ((eventMove.clientY - startY) / rect.height) * 100;

    if (Math.abs(deltaX) > 0.05 || Math.abs(deltaY) > 0.05) {
      moved = true;
    }

    const nextX = startPosition.x + deltaX;
    const nextY = startPosition.y + deltaY;

    layerPositions[index] = {
      x: nextX,
      y: nextY
    };

    layer.style.left = `${nextX}%`;
    layer.style.top = `${nextY}%`;
  }

  function end() {
    layer.classList.remove("is-dragging");
    layer.releasePointerCapture?.(event.pointerId);
    layer.removeEventListener("pointermove", move);
    layer.removeEventListener("pointerup", end);
    layer.removeEventListener("pointercancel", end);

    if (moved) {
      pushHistory();
    }

    updateHistoryButtons();
  }

  layer.addEventListener("pointermove", move);
  layer.addEventListener("pointerup", end);
  layer.addEventListener("pointercancel", end);
}

/* =========================================================
   VALORES DAS CAMADAS
   ========================================================= */

function getLayerValue(layer) {
  if (layer.value !== undefined && !layer.field) {
    return layer.value;
  }

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

/* =========================================================
   DATA ESCOLHIDA NO CALENDÁRIO
   ========================================================= */

function formatSelectedDate(value) {
  if (!value) {
    return {
      day: "",
      month: "",
      weekday: ""
    };
  }

  const parts = String(value).split("-").map(Number);

  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return {
      day: "",
      month: "",
      weekday: ""
    };
  }

  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);

  const weekday = new Intl.DateTimeFormat("pt-PT", {
    weekday: "long"
  }).format(date);

  const monthName = new Intl.DateTimeFormat("pt-PT", {
    month: "long"
  }).format(date);

  return {
    day: String(day),
    month: monthName.toUpperCase(),
    weekday
  };
}

/* =========================================================
   LEITURA DOS CAMPOS
   ========================================================= */

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

/* =========================================================
   COR DAS CAMADAS
   ========================================================= */

function getOtherInfoColor() {
  const otherInfoIndex = (selectedTemplate?.textLayers || []).findIndex(
    layer => layer.field === "otherInfo"
  );

  if (otherInfoIndex < 0) {
    return selectedTemplate?.defaultOtherInfoColor || "#07588c";
  }

  return (
    layerColors[otherInfoIndex] ||
    selectedTemplate.defaultOtherInfoColor ||
    selectedTemplate.textLayers[otherInfoIndex].color ||
    "#07588c"
  );
}

/* =========================================================
   EVENTOS DOS CAMPOS
   ========================================================= */

[
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
].forEach(id => {
  document.getElementById(id)?.addEventListener("input", () => {
    updatePreview();
    pushHistory();
  });
});

/* =========================================================
   ENVIO / CONFIRMAÇÃO DO PEDIDO
   ========================================================= */

function setupCustomizer() {
  /* Localiza o formulário principal do personalizador. */
  const form = document.getElementById("customizer-form");

  /* Interrompe a configuração se a página não tiver formulário. */
  if (!form) {
    return;
  }

  /* Trata a criação de um novo pedido. */
  form.addEventListener("submit", async event => {
    /* Impede o envio tradicional do formulário. */
    event.preventDefault();

    /* Lê os elementos usados durante o processo. */
    const emailInput = document.getElementById("field-email");
    const message = document.getElementById("form-message");
    const submitButton = form.querySelector("button[type=submit]");
    const paymentPanel = document.getElementById("test-payment-panel");
    const paymentLink = document.getElementById("test-payment-link");
    const orderIdElement = document.getElementById("test-order-id");
    const paymentStatus = document.getElementById("test-payment-status");

    /* Limpa mensagens anteriores. */
    message.textContent = "";
    paymentStatus.textContent = "";

    /* Obtém o e-mail introduzido pelo cliente. */
    const email = emailInput.value.trim();

    /* Impede a criação do pedido sem e-mail. */
    if (!email) {
      message.textContent = "Indique o e-mail onde pretende receber o convite.";
      emailInput.focus();
      return;
    }

    /* Obtém a informação calculada da data escolhida. */
    const selectedDate = getFieldValue("date", "");
    const dateInfo = formatSelectedDate(selectedDate);

    /* Monta todos os dados necessários para identificar o pedido. */
    const order = {
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      previewImage: selectedTemplate.previewImage || "",
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
      email
    };

    /* Desativa o botão enquanto o convite é preparado. */
    submitButton.disabled = true;
    submitButton.textContent = "A preparar o pedido...";

    try {
      /*
        Gera uma camada PNG transparente com apenas os textos personalizados.
        O servidor junta esta camada à imagem privada sem marca d'água.
        O ficheiro final continua sempre com 1080x1920 px.
      */
      const textOverlayDataUrl = await renderFinalInvitationToPng();

      /* Envia o pedido e a imagem final para o backend. */
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...order,
          textOverlayDataUrl
        })
      });

      /* Lê a resposta do servidor. */
      const data = await response.json();

      /* Mostra o erro devolvido pelo servidor. */
      if (!response.ok) {
        throw new Error(data.error || "Não foi possível criar o pedido.");
      }

      /* Mostra o Order ID criado pelo servidor. */
      orderIdElement.textContent = `Order ID: ${data.orderId}`;

      /* Cria o link para a página que simula a plataforma de pagamento. */
      paymentLink.href = `/test-payment.html?orderId=${encodeURIComponent(data.orderId)}`;

      /* Mostra a área de pagamento de teste. */
      paymentPanel.hidden = false;

      /* Informa o cliente sobre o passo seguinte. */
      paymentStatus.textContent =
        "O pedido foi criado. Abra o pagamento de teste para confirmar o pagamento.";

      /* Atualiza o botão principal. */
      submitButton.textContent = "Pedido criado";

      /* Mostra uma mensagem geral de sucesso. */
      message.textContent =
        "O seu pedido foi criado. O próximo passo é confirmar o pagamento.";
    } catch (error) {
      /* Mostra qualquer erro ocorrido durante a criação do pedido. */
      message.textContent = error.message;
      submitButton.disabled = false;
      submitButton.textContent = "Criar pedido";
    }
  });
}

/* =========================================================
   GERAÇÃO DO PNG FINAL
   ========================================================= */

async function renderFinalInvitationToPng() {
  /* Define a resolução real exigida para todos os convites. */
  const CANVAS_WIDTH = 1080;
  const CANVAS_HEIGHT = 1920;

  /* Cria o canvas que vai receber o convite final. */
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  /* Obtém o contexto 2D usado para desenhar a imagem e os textos. */
  const context = canvas.getContext("2d");

  /* Aguarda o carregamento das fontes antes de desenhar o texto. */
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  /*
    IMPORTANTE: não desenhamos aqui a imagem com marca d'água.
    Este canvas fica transparente e contém apenas os textos personalizados.
    O servidor aplica esta camada sobre ToyStory1_sem.png, que está na pasta
    privada do repositório e nunca é exposta diretamente ao cliente.
  */

  /* Desenha cada camada de texto no mesmo sistema de coordenadas do editor. */
  selectedTemplate.textLayers.forEach((layer, index) => {
    /* Obtém o texto atualmente escolhido pelo cliente. */
    const value = getLayerValue(layer);

    /* Ignora camadas vazias. */
    if (!value) {
      return;
    }

    /* Obtém a posição atual da camada. */
    const position = layerPositions[index] || {
      x: layer.x,
      y: layer.y
    };

    /* Obtém o tamanho atual da camada. */
    const size = layerSizes[index] ?? layer.size;

    /* Obtém a cor atual da camada. */
    const color = layerColors[index] || layer.color || "#07588c";

    /* Converte a percentagem de tamanho para pixels na resolução final. */
    const fontSize = (Number(size) / 100) * CANVAS_WIDTH;

    /* Converte a posição percentual para pixels. */
    const x = (Number(position.x) / 100) * CANVAS_WIDTH;
    const y = (Number(position.y) / 100) * CANVAS_HEIGHT;

    /* Obtém o nome da fonte configurada para a camada. */
    const fontFamily = layer.font || "HortaRegular, Horta, sans-serif";

    /* Obtém o peso da fonte configurado para a camada. */
    const fontWeight = layer.weight || "700";

    /* Configura a fonte no canvas. */
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

    /* Mantém o mesmo alinhamento utilizado no editor. */
    context.textAlign = layer.align || "center";
    context.textBaseline = "middle";

    /* Aplica a cor escolhida pelo cliente. */
    context.fillStyle = color;

    /* Guarda o estado antes de aplicar rotação e sombra. */
    context.save();

    /* Move o ponto de desenho para o centro da camada. */
    context.translate(x, y);

    /* Aplica a rotação configurada para a camada. */
    context.rotate(((layer.rotate || 0) * Math.PI) / 180);

    /* Aplica a sombra quando a camada tiver uma sombra configurada. */
    applyCanvasShadow(context, layer.shadow, CANVAS_WIDTH);

    /* Converte o texto para maiúsculas quando o CSS original o faria. */
    const text = shouldUppercaseLayer(layer)
      ? String(value).toUpperCase()
      : String(value);

    /* Obtém a altura entre linhas. */
    const lineHeight = fontSize * Number(layer.lineHeight || 1);

    /* Divide o texto pelas quebras de linha introduzidas pelo cliente. */
    const lines = text.split("\n");

    /* Calcula o deslocamento vertical para centrar várias linhas. */
    const totalHeight = lineHeight * lines.length;
    const firstLineY = -(totalHeight - lineHeight) / 2;

    /* Desenha todas as linhas da camada. */
    lines.forEach((line, lineIndex) => {
      context.fillText(
        line,
        0,
        firstLineY + lineIndex * lineHeight
      );
    });

    /* Restaura o estado anterior do canvas. */
    context.restore();
  });

  /*
    Converte a camada transparente para PNG.
    O servidor acrescenta depois a imagem privada sem marca d'água.
  */
  return canvas.toDataURL("image/png");
}

/* =========================================================
   CARREGAMENTO DE IMAGENS PARA O CANVAS
   ========================================================= */

function loadImage(source) {
  /* Devolve uma Promise para podermos aguardar a imagem. */
  return new Promise((resolve, reject) => {
    /* Cria o elemento de imagem temporário. */
    const image = new Image();

    /* Resolve a Promise quando a imagem estiver pronta. */
    image.onload = () => resolve(image);

    /* Rejeita a Promise quando a imagem não puder ser carregada. */
    image.onerror = () => {
      reject(new Error("Não foi possível carregar a imagem de fundo do convite."));
    };

    /* Define o caminho da imagem. */
    image.src = source;
  });
}

/* =========================================================
   SOMBRA DO TEXTO NO PNG FINAL
   ========================================================= */

function applyCanvasShadow(context, shadowValue, canvasWidth) {
  /* Remove qualquer sombra anterior. */
  context.shadowBlur = 0;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.shadowColor = "transparent";

  /* Não faz nada quando a camada não tem sombra. */
  if (!shadowValue) {
    return;
  }

  /* Tenta interpretar o formato usado pelo CSS atual. */
  const match = String(shadowValue).match(
    /(-?[0-9.]+)cqw\s+(-?[0-9.]+)cqw\s+0\s+(#[0-9a-fA-F]+)/
  );

  /* Sai se a sombra tiver um formato que não reconhecemos. */
  if (!match) {
    return;
  }

  /* Converte os valores cqw para pixels da resolução final. */
  context.shadowOffsetX = Number(match[1]) * canvasWidth / 100;
  context.shadowOffsetY = Number(match[2]) * canvasWidth / 100;
  context.shadowBlur = 0;
  context.shadowColor = match[3];
}

/* =========================================================
   TRANSFORMAÇÃO PARA MAIÚSCULAS
   ========================================================= */

function shouldUppercaseLayer(layer) {
  /* Obtém as classes visuais da camada. */
  const classes = String(layer.className || "");

  /* Estas classes têm text-transform: uppercase no CSS do convite. */
  return [
    "name",
    "small-white",
    "blue",
    "yellow"
  ].some(className => classes.split(" ").includes(className));
}

/* =========================================================
   FALLBACK PARA MODELOS ANTIGOS
   ========================================================= */

function renderLegacyInvitation(preview) {
  const fallback = document.createElement("div");
  fallback.className = "legacy-preview-content";

  fallback.innerHTML = `
    <div class="preview-ornament">✦</div>
    <div class="preview-small">CONVITE</div>
    <div class="preview-name">
      ${escapeHtml(getFieldValue("name", ""))}
    </div>
    <div class="preview-divider"></div>
    <div>${escapeHtml(getFieldValue("date", ""))}</div>
    <div>${escapeHtml(getFieldValue("time", ""))}</div>
    <div class="preview-place-label">LOCAL</div>
    <div>${escapeHtml(getFieldValue("place", ""))}</div>
  `;

  preview.appendChild(fallback);
}

/* =========================================================
   SEGURANÇA BÁSICA PARA TEXTO INSERIDO NO HTML
   ========================================================= */

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
