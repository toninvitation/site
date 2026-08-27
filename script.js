/* =========================================================
   TONInvitation — PÁGINA INICIAL
   Controla o menu mobile, categorias e avaliações.
   ========================================================= */

/* Inicializa a página depois de o catálogo automático estar disponível. */
function initializeHomePage() {
  /* Obtém os elementos do menu mobile. */
  const menu = document.getElementById("menu");
  const mobileButton = document.getElementById("menu-mobile");

  /* Abre e fecha o menu em dispositivos pequenos. */
  mobileButton?.addEventListener("click", () => {
    const open = menu.classList.toggle("ativo");
    mobileButton.classList.toggle("aberto", open);
  });

  /* Obtém a grelha de categorias. */
  const grid = document.getElementById("category-grid");

  /* Preenche automaticamente a grelha com as categorias encontradas. */
  if (grid) {
    grid.innerHTML = INVITATION_CATEGORIES.map(category => `
      <a
        class="category-card"
        href="categoria.html?categoria=${encodeURIComponent(category.id)}"
      >
        <div class="category-image-wrap">
          <img
            src="${category.image}"
            alt="${category.name}"
            onerror="this.src='Images/imagem_inicio.png'"
          >
          <div class="category-overlay">
            Ver modelos
            <i data-lucide="arrow-right"></i>
          </div>
          <div class="category-info">
            <h3>${category.name}</h3>
          </div>
        </div>
      </a>
    `).join("");
  }

  /* Atualiza os ícones depois de criar os cartões. */
  lucide.createIcons();

  /* Configura o carrossel de avaliações. */
  setupReviewsCarousel();
  setupRatingForm();
}

/* Gere a classificação enviada pelo visitante e a média apresentada. */
function setupRatingForm() {
  const form = document.getElementById("rating-form");
  const stars = [...document.querySelectorAll("[data-rating]")];
  const nameInput = document.getElementById("rating-name");
  const anonymousInput = document.getElementById("rating-anonymous");
  const average = document.getElementById("rating-average-value");
  let selectedRating = 0;

  if (!form || !average) return;

  const storedRatings = () => JSON.parse(localStorage.getItem("toninvitation-ratings") || "[]");

  const updateAverage = () => {
    const ratings = [5, 5, ...storedRatings()];
    const value = ratings.reduce((sum, item) => sum + (item.rating || item), 0) / ratings.length;
    average.textContent = value.toLocaleString(currentLanguage || "pt", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
  };

  const updateStars = () => {
    stars.forEach(star => {
      star.classList.toggle("selected", Number(star.dataset.rating) <= selectedRating);
    });
  };

  stars.forEach(star => {
    star.addEventListener("click", () => {
      selectedRating = Number(star.dataset.rating);
      updateStars();
    });
  });

  anonymousInput?.addEventListener("change", () => {
    nameInput.disabled = anonymousInput.checked;
    if (anonymousInput.checked) nameInput.value = "";
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    const message = document.getElementById("rating-message");

    if (!selectedRating) {
      message.textContent = "Escolha uma classificação.";
      return;
    }

    const ratings = storedRatings();
    ratings.push({
      rating: selectedRating,
      name: anonymousInput?.checked ? "Anónimo" : nameInput.value.trim() || "Anónimo",
      country: document.getElementById("rating-country").value,
      comment: document.getElementById("rating-comment").value.trim()
    });
    localStorage.setItem("toninvitation-ratings", JSON.stringify(ratings));
    form.reset();
    selectedRating = 0;
    updateStars();
    nameInput.disabled = false;
    message.textContent = getTranslation("ratingSuccess");
    updateAverage();
  });

  updateAverage();
}

/* Configura o carrossel de avaliações. */
function setupReviewsCarousel() {
  const list = document.querySelector(".reviews-list");
  const reviews = document.querySelectorAll(".review");
  let current = 0;

  const visibleReviews = () => window.innerWidth <= 900 ? 1 : 3;

  function updateReviews() {
    if (!list) return;

    const visible = visibleReviews();
    const max = Math.max(0, reviews.length - visible);

    current = Math.min(current, max);
    list.style.transform = `translateX(-${current * 100 / visible}%)`;
  }

  document.querySelector(".review-next")?.addEventListener("click", () => {
    const max = Math.max(0, reviews.length - visibleReviews());
    current = current < max ? current + 1 : 0;
    updateReviews();
  });

  document.querySelector(".review-prev")?.addEventListener("click", () => {
    const max = Math.max(0, reviews.length - visibleReviews());
    current = current > 0 ? current - 1 : max;
    updateReviews();
  });

  window.addEventListener("resize", updateReviews);
  updateReviews();
}

/* Inicializa quando o catálogo automático estiver pronto. */
window.addEventListener("toninvitation:catalog-ready", initializeHomePage);
