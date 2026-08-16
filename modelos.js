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
  selectedLayerIndex = null;

  (selectedTemplate.textLayers || []).forEach((layer, index) => {
    layerPositions[index] = {
      x: layer.x,
      y: layer.y
    };

    layerSizes[index] = layer.size;
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

  document.getElementById("field-other-info-color").value =
    selectedTemplate.defaultOtherInfoColor || "#07588c";

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
    "field-other-info",
    "field-other-info-color"
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
    sizes: cloneObject(layerSizes)
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
  fields["field-other-info-color"] =
    selectedTemplate.defaultOtherInfoColor || "#07588c";

  const positions = {};
  const sizes = {};

  (selectedTemplate.textLayers || []).forEach((layer, index) => {
    positions[index] = {
      x: layer.x,
      y: layer.y
    };

    sizes[index] = layer.size;
  });

  return {
    fields,
    positions,
    sizes
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
  const decrease = document.getElementById("decrease-size");
  const increase = document.getElementById("increase-size");

  if (selectedLayerIndex === null || !selectedTemplate?.textLayers?.[selectedLayerIndex]) {
    if (label) label.textContent = "Selecione um texto";
    if (sizeLabel) sizeLabel.textContent = "—";
    if (decrease) decrease.disabled = true;
    if (increase) increase.disabled = true;
    return;
  }

  const layer = selectedTemplate.textLayers[selectedLayerIndex];
  const size = layerSizes[selectedLayerIndex] ?? layer.size;

  if (label) label.textContent = layer.label || getLayerLabel(layer);
  if (sizeLabel) sizeLabel.textContent = `${Number(size).toFixed(1)}%`;
  if (decrease) decrease.disabled = size <= 1;
  if (increase) increase.disabled = size >= 30;
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
    const layerColor = layer.field === "otherInfo"
      ? getFieldValue("otherInfoColor", layer.color || "#07588c")
      : layer.color || "#fff";

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
    otherInfo: "field-other-info",
    otherInfoColor: "field-other-info-color"
  };

  return document.getElementById(map[field])?.value ?? fallback ?? "";
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
  "field-other-info",
  "field-other-info-color"
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

    const order = {
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
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
      otherInfoColor: getFieldValue(
        "otherInfoColor",
        selectedTemplate.defaultOtherInfoColor
      ),
      positions: cloneObject(layerPositions),
      sizes: cloneObject(layerSizes),
      email
    };

    button.disabled = true;
    button.textContent = "A confirmar...";

    try {
      const response = await fetch("/api/confirm-payment-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(order)
      });

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Abra o site em http://localhost:3000 e mantenha o servidor ligado."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error || "Não foi possível concluir o pedido."
        );
      }

      message.innerHTML = `
        <span class="payment-success">
          <strong>Pagamento efetuado com sucesso!</strong><br>
          O seu convite está a ser preparado e será enviado para
          <strong>${escapeHtml(email)}</strong>.
        </span>
      `;

      button.textContent = "Pagamento confirmado";
    } catch (error) {
      message.textContent = error.message;
      button.disabled = false;
      button.textContent = "Confirmar pagamento";
    }
  });
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
