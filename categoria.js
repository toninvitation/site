/* =========================================================
   PÁGINA DE CATEGORIA
   - Mostra temas (ex.: Infantil -> Toy Story)
   - Mostra diretamente os convites nas categorias sem temas
   - Mantém o personalizador dos modelos antigos
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
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
      <h1>${category.name}</h1>
      <div class="title-decoration">
        <span></span>
        <b>♥</b>
        <span></span>
      </div>
      <p>${category.description}</p>
    </div>
  `;

  /*
    Categorias com temas:
    Infantil -> Toy Story -> modelos.html
  */
  if (category.type === "themes") {
    const themes = INVITATION_THEMES[categoryId] || [];

    content.innerHTML = `
      <div class="page-intro">
        <h2>Escolha o tema</h2>
        <p>Entre num tema para ver os diferentes convites.</p>
      </div>

      <div class="theme-grid">
        ${themes.map(theme => themeCard(theme, categoryId)).join("")}
      </div>
    `;
  } else {
    /*
      Categorias sem temas mostram os convites diretamente.
    */
    const items = INVITATION_TEMPLATES.filter(
      item => item.category === categoryId && !item.theme
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

  lucide.createIcons();
  setupMenu();
  setupCustomizer();
  attachCustomizerButtons();
});

/* =========================================================
   CARTÕES
   ========================================================= */

function themeCard(theme, categoryId) {
  const alternateImages = theme.alternateImages || [];
  const fallback = theme.fallbackImage || "Images/infantil.jpg";

  return `
    <a
      class="theme-card"
      href="modelos.html?categoria=${encodeURIComponent(categoryId)}&tema=${encodeURIComponent(theme.id)}"
    >
      <div class="theme-image theme-image-portrait">
        <img
          src="${theme.image}"
          alt="${theme.name}"
          data-alternates='${JSON.stringify(alternateImages)}'
          data-fallback="${fallback}"
          onerror="handleThemeImageError(this)"
        >
      </div>

      <div class="theme-info">
        <h3>${theme.name}</h3>
        <p>${theme.description}</p>
        <span>Ver convites →</span>
      </div>
    </a>
  `;
}

/*
  Se a capa principal do Toy Story tiver outro nome, tentamos a
  segunda opção antes de usar a imagem genérica da categoria.
*/
function handleThemeImageError(image) {
  const alternates = JSON.parse(image.dataset.alternates || "[]");
  const currentIndex = Number(image.dataset.alternateIndex || 0);

  if (currentIndex < alternates.length) {
    image.dataset.alternateIndex = String(currentIndex + 1);
    image.src = alternates[currentIndex];
    return;
  }

  image.onerror = null;
  image.src = image.dataset.fallback || "Images/infantil.jpg";
}

/* =========================================================
   MENU
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
   PERSONALIZADOR DOS MODELOS ANTIGOS
   ========================================================= */

let selectedTemplate = null;
let selectedColor = "#d98ea2";

function attachCustomizerButtons() {
  document.querySelectorAll(".customize-template").forEach(button => {
    button.addEventListener("click", () => {
      openCustomizer(button.dataset.template);
    });
  });
}

function openCustomizer(id) {
  selectedTemplate = INVITATION_TEMPLATES.find(template => template.id === id);

  if (!selectedTemplate) return;

  selectedColor = selectedTemplate.colors?.[0]?.value || "#d98ea2";

  document.getElementById("customizer-title").textContent =
    `Personalize: ${selectedTemplate.name}`;

  document.getElementById("field-name").value = selectedTemplate.defaultName || "";
  document.getElementById("field-date").value = selectedTemplate.defaultDate || "";
  document.getElementById("field-time").value = selectedTemplate.defaultTime || "";
  document.getElementById("field-place").value = selectedTemplate.defaultPlace || "";
  document.getElementById("field-email").value = "";
  document.getElementById("form-message").textContent = "";

  buildColors();
  updatePreview();

  const modal = document.getElementById("customizer-modal");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCustomizer() {
  const modal = document.getElementById("customizer-modal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-close-modal]").forEach(element => {
  element.addEventListener("click", closeCustomizer);
});

function buildColors() {
  const box = document.getElementById("color-options");
  const colors = selectedTemplate?.colors || [];

  box.innerHTML = colors.map((color, index) => `
    <button
      type="button"
      class="color-choice ${index === 0 ? "active" : ""}"
      data-color="${color.value}"
      style="background:${color.value}"
      title="${color.name}"
      aria-label="${color.name}"
    ></button>
  `).join("");

  box.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      box.querySelectorAll("button").forEach(item => {
        item.classList.remove("active");
      });

      button.classList.add("active");
      selectedColor = button.dataset.color;
      updatePreview();
    });
  });
}

function updatePreview() {
  if (!selectedTemplate) return;

  document.getElementById("preview-name").textContent =
    document.getElementById("field-name").value || selectedTemplate.defaultName;

  document.getElementById("preview-date").textContent =
    document.getElementById("field-date").value || selectedTemplate.defaultDate;

  document.getElementById("preview-time").textContent =
    document.getElementById("field-time").value || selectedTemplate.defaultTime;

  document.getElementById("preview-place").textContent =
    document.getElementById("field-place").value || selectedTemplate.defaultPlace;

  document
    .getElementById("invitation-preview")
    .style.setProperty("--preview-main", selectedColor);
}

["name", "date", "time", "place"].forEach(field => {
  document.getElementById(`field-${field}`)?.addEventListener("input", updatePreview);
});

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

    const order = {
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      color: selectedColor,
      name: document.getElementById("field-name").value || selectedTemplate.defaultName,
      date: document.getElementById("field-date").value || selectedTemplate.defaultDate,
      time: document.getElementById("field-time").value || selectedTemplate.defaultTime,
      place: document.getElementById("field-place").value || selectedTemplate.defaultPlace,
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
        throw new Error(data.error || "Não foi possível concluir o pedido.");
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
