/* =========================================================
   TONInvitation — INTERAÇÕES
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("menu");
  const menuButton = document.getElementById("menu-mobile");

  menuButton?.addEventListener("click", () => {
    const open = menu.classList.toggle("ativo");
    menuButton.classList.toggle("aberto", open);
    menuButton.setAttribute("aria-expanded", String(open));
  });

  document.querySelectorAll("#menu a").forEach(link => {
    link.addEventListener("click", () => {
      menu.classList.remove("ativo");
      menuButton?.classList.remove("aberto");
      menuButton?.setAttribute("aria-expanded", "false");
    });
  });

  /* =========================
     CATÁLOGO
     ========================= */
  const grid = document.getElementById("catalog-grid");
  const filterButtons = document.querySelectorAll(".filter-btn");

  function renderCatalog(filter = "todos") {
    if (!grid || typeof INVITATION_TEMPLATES === "undefined") return;

    const items = INVITATION_TEMPLATES.filter(item =>
      filter === "todos" || item.category === filter
    );

    grid.innerHTML = items.map(item => `
      <article class="catalog-card">
        <div class="catalog-image-wrap">
          <img src="${item.image}" alt="${item.name}">
          ${item.badge ? `<span class="catalog-badge">${item.badge}</span>` : ""}
        </div>
        <div class="catalog-info">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <div class="catalog-actions">
            <button class="btn btn-outline preview-template" data-template="${item.id}">
              <i data-lucide="eye"></i> Ver
            </button>
            <button class="btn btn-primary customize-template" data-template="${item.id}">
              Personalizar
            </button>
          </div>
        </div>
      </article>
    `).join("");

    lucide.createIcons();
    attachCatalogButtons();
  }

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      button.classList.add("active");
      renderCatalog(button.dataset.filter);
    });
  });

  /* =========================
     CUSTOMIZADOR
     ========================= */
  const modal = document.getElementById("customizer-modal");
  const form = document.getElementById("customizer-form");
  const preview = document.getElementById("invitation-preview");
  const fieldName = document.getElementById("field-name");
  const fieldDate = document.getElementById("field-date");
  const fieldTime = document.getElementById("field-time");
  const fieldPlace = document.getElementById("field-place");
  const fieldEmail = document.getElementById("field-email");
  const colorOptions = document.getElementById("color-options");
  const formMessage = document.getElementById("form-message");

  let selectedTemplate = null;
  let selectedColor = "#d98ea2";

  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
  }

  function openCustomizer(templateId) {
    selectedTemplate = INVITATION_TEMPLATES.find(t => t.id === templateId) || INVITATION_TEMPLATES[0];
    selectedColor = selectedTemplate.colors?.[0]?.value || "#d98ea2";

    document.getElementById("customizer-title").textContent =
      `Personalize: ${selectedTemplate.name}`;

    buildColorOptions();
    setPreviewDefaults();
    formMessage.textContent = "";
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeCustomizer() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function buildColorOptions() {
    colorOptions.innerHTML = (selectedTemplate.colors || []).map((color, index) => `
      <button type="button"
        class="color-choice ${index === 0 ? "active" : ""}"
        title="${color.name}"
        aria-label="${color.name}"
        data-color="${color.value}"
        style="background:${color.value}">
      </button>
    `).join("");

    colorOptions.querySelectorAll(".color-choice").forEach(button => {
      button.addEventListener("click", () => {
        colorOptions.querySelectorAll(".color-choice").forEach(b => b.classList.remove("active"));
        button.classList.add("active");
        selectedColor = button.dataset.color;
        updatePreview();
      });
    });
  }

  function setPreviewDefaults() {
    fieldName.value = selectedTemplate.defaultName || "";
    fieldDate.value = selectedTemplate.defaultDate || "";
    fieldTime.value = selectedTemplate.defaultTime || "";
    fieldPlace.value = selectedTemplate.defaultPlace || "";
    fieldEmail.value = "";
    updatePreview();
  }

  function updatePreview() {
    const name = fieldName.value.trim() || selectedTemplate.defaultName || "O seu evento";
    const date = fieldDate.value.trim() || selectedTemplate.defaultDate || "Data da festa";
    const time = fieldTime.value.trim() || selectedTemplate.defaultTime || "Hora";
    const place = fieldPlace.value.trim() || selectedTemplate.defaultPlace || "Local da festa";

    document.getElementById("preview-name").textContent = name;
    document.getElementById("preview-date").textContent = date;
    document.getElementById("preview-time").textContent = time;
    document.getElementById("preview-place").textContent = place;

    preview.style.setProperty("--preview-main", selectedColor);
  }

  [fieldName, fieldDate, fieldTime, fieldPlace].forEach(input => {
    input.addEventListener("input", updatePreview);
  });

  function attachCatalogButtons() {
    document.querySelectorAll(".customize-template").forEach(button => {
      button.addEventListener("click", () => openCustomizer(button.dataset.template));
    });

    document.querySelectorAll(".preview-template").forEach(button => {
      button.addEventListener("click", () => openCustomizer(button.dataset.template));
    });
  }

  document.querySelectorAll("[data-close-modal]").forEach(element => {
    element.addEventListener("click", closeCustomizer);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal.classList.contains("open")) closeCustomizer();
  });

  form?.addEventListener("submit", async event => {
    event.preventDefault();

    const email = fieldEmail.value.trim();

    if (!email) {
      formMessage.textContent = "Indique o e-mail onde pretende receber o convite.";
      fieldEmail.focus();
      return;
    }

    const order = {
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      color: selectedColor,
      name: fieldName.value.trim() || selectedTemplate.defaultName,
      date: fieldDate.value.trim() || selectedTemplate.defaultDate,
      time: fieldTime.value.trim() || selectedTemplate.defaultTime,
      place: fieldPlace.value.trim() || selectedTemplate.defaultPlace,
      email
    };

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML =
      '<i data-lucide="loader-circle"></i> A confirmar...';
    if (window.lucide) lucide.createIcons();

    formMessage.textContent = "A confirmar o pagamento...";

    try {
      // TESTE: este clique é considerado uma confirmação positiva do pagamento.
      const response = await fetch("/api/confirm-payment-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível concluir o pedido.");
      }

      formMessage.innerHTML = `
        <span class="payment-success">
          <i data-lucide="circle-check"></i>
          <strong>Pagamento efetuado com sucesso!</strong><br>
          O seu convite está a ser preparado e será enviado para
          <strong>${email}</strong>.
        </span>
      `;

      submitButton.innerHTML =
        '<i data-lucide="check-circle"></i> Pagamento confirmado';
      if (window.lucide) lucide.createIcons();

    } catch (error) {
      console.error(error);
      formMessage.textContent =
        error.message || "Ocorreu um erro ao processar o pedido.";

      submitButton.disabled = false;
      submitButton.innerHTML =
        '<i data-lucide="credit-card"></i> Confirmar pagamento';
      if (window.lucide) lucide.createIcons();
    }
  });

  /* =========================
     CARROSSEL DE AVALIAÇÕES
     ========================= */
  const list = document.querySelector(".reviews-list");
  const reviews = document.querySelectorAll(".review");
  const prev = document.querySelector(".review-prev");
  const next = document.querySelector(".review-next");
  let current = 0;

  function visibleReviews() {
    return window.innerWidth <= 900 ? 1 : 3;
  }

  function updateReviews() {
    if (!list || !reviews.length) return;
    const visible = visibleReviews();
    const max = Math.max(0, reviews.length - visible);
    current = Math.min(current, max);
    const step = 100 / visible;
    list.style.transform = `translateX(-${current * step}%)`;
  }

  next?.addEventListener("click", () => {
    const max = Math.max(0, reviews.length - visibleReviews());
    current = current < max ? current + 1 : 0;
    updateReviews();
  });

  prev?.addEventListener("click", () => {
    const max = Math.max(0, reviews.length - visibleReviews());
    current = current > 0 ? current - 1 : max;
    updateReviews();
  });

  window.addEventListener("resize", updateReviews);

  renderCatalog();
  updateReviews();
});
