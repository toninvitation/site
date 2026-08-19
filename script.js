/* =========================================================
   SCRIPT DA PÁGINA INICIAL
   - Menu mobile
   - Grelha de categorias
   - Carrossel de avaliações
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* -------------------------
     Menu mobile
     ------------------------- */
  const menu = document.getElementById("menu");
  const mobileButton = document.getElementById("menu-mobile");

  mobileButton?.addEventListener("click", () => {
    const open = menu.classList.toggle("ativo");
    mobileButton.classList.toggle("aberto", open);
  });

  /* -------------------------
     Grelha de categorias
     ------------------------- */
  const grid = document.getElementById("category-grid");

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
        </div>

        <div class="category-info">
          <h3>${category.name}</h3>
          <p>${category.description}</p>
        </div>
      </a>
    `).join("");
  }

  lucide.createIcons();

  /* -------------------------
     Carrossel de avaliações
     ------------------------- */
  const list = document.querySelector(".reviews-list");
  const reviews = document.querySelectorAll(".review");
  let current = 0;

  const visibleReviews = () => (window.innerWidth <= 900 ? 1 : 3);

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
});
