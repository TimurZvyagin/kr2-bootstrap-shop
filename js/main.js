const HEART_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-7.5-10.4A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.7c0 5.8-7.5 10.4-7.5 10.4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" /></svg>';

document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-bs-theme", next);
    try {
      localStorage.setItem("vl-theme", next);
    } catch (e) {}
  });
});

function showToast(message) {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container position-fixed bottom-0 end-0 p-3";
    document.body.append(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.innerHTML = `
    <div class="toast-header">
      <img class="me-2" src="images/favicon.svg" alt="" width="16" height="16" />
      <strong class="me-auto">Винтаж-лавка</strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Закрыть"></button>
    </div>
    <div class="toast-body"></div>`;
  toast.querySelector(".toast-body").textContent = message;
  container.append(toast);

  toast.addEventListener("hidden.bs.toast", () => toast.remove());
  bootstrap.Toast.getOrCreateInstance(toast, { delay: 3500 }).show();
}

const quickOrderModal = document.getElementById("quickOrderModal");

function renderCard(product, columnClass = "col-12 col-sm-6 col-lg-4") {
  const badge = product.badge
    ? `<span class="badge ${BADGES[product.badge].className} position-absolute top-0 start-0 m-2">${badgeText(product)}</span>`
    : "";
  const oldPrice = product.oldPrice ? ` <s class="small text-body-secondary ms-1">${formatPrice(product.oldPrice)}</s>` : "";
  const quickOrder = quickOrderModal
    ? `<button class="btn btn-outline-primary flex-grow-1" type="button" data-bs-toggle="modal" data-bs-target="#quickOrderModal" data-product="${product.id}">Быстрый заказ</button>`
    : "";

  return `
    <div class="${columnClass}">
      <article class="card product-card h-100 overflow-hidden">
        <div class="position-relative">
          <div class="ratio ratio-4x3">
            <img class="object-fit-cover" src="${product.image}" alt="${product.alt}" width="640" height="480" loading="lazy" />
          </div>
          ${badge}
          <button class="btn btn-light icon-btn fav-btn position-absolute top-0 end-0 m-2" type="button" data-fav="${product.id}" aria-pressed="false" aria-label="Добавить в избранное">${HEART_ICON}</button>
        </div>
        <div class="card-body d-flex flex-column">
          <p class="small text-body-secondary mb-1">${CATEGORIES[product.category]}</p>
          <h3 class="card-title h5">${product.name}</h3>
          <p class="card-text small text-body-secondary">${product.short}</p>
          <p class="mt-auto mb-3"><span class="fs-5 fw-semibold">${formatPrice(product.price)}</span>${oldPrice}</p>
          <div class="d-flex flex-wrap gap-2">
            <a class="btn btn-primary flex-grow-1" href="product.html?id=${product.id}">Подробнее</a>
            ${quickOrder}
          </div>
        </div>
      </article>
    </div>`;
}

document.querySelectorAll("[data-products]").forEach((grid) => {
  grid.innerHTML = grid.dataset.products
    .split(",")
    .map((id) => renderCard(findProduct(id), grid.dataset.col))
    .join("");
});

document.querySelectorAll("select[data-product-options]").forEach((select) => {
  select.insertAdjacentHTML(
    "beforeend",
    PRODUCTS.map((product) => `<option value="${product.id}">${product.name} — ${formatPrice(product.price)}</option>`).join("")
  );
});

const FAV_KEY = "vl-favorites";

function getFavorites() {
  try {
    return (JSON.parse(localStorage.getItem(FAV_KEY)) || []).filter((id) => findProduct(id));
  } catch (e) {
    return [];
  }
}

function toggleFavorite(id) {
  const list = getFavorites();
  const index = list.indexOf(id);
  const product = findProduct(id);

  if (index === -1) {
    list.push(id);
    showToast(`«${product.name}» — в избранном`);
  } else {
    list.splice(index, 1);
    showToast(`«${product.name}» убран из избранного`);
  }

  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(list));
  } catch (e) {}
  updateFavorites();
}

function updateFavorites() {
  const list = getFavorites();

  document.querySelectorAll("[data-fav]").forEach((button) => {
    const active = list.includes(button.dataset.fav);
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active);
    button.setAttribute("aria-label", active ? "Убрать из избранного" : "Добавить в избранное");
    const label = button.querySelector("[data-fav-label]");
    if (label) label.textContent = active ? "В избранном" : "В избранное";
  });

  document.querySelectorAll("[data-fav-count]").forEach((badge) => {
    badge.textContent = list.length;
    badge.classList.toggle("d-none", list.length === 0);
  });

  document.querySelector("[data-fav-list]").innerHTML = list
    .map((id) => {
      const product = findProduct(id);
      return `
        <li class="list-group-item d-flex align-items-center gap-3 px-0">
          <img src="${product.image}" alt="" width="64" height="48" class="rounded object-fit-cover" />
          <div class="flex-grow-1">
            <a class="fw-semibold text-body" href="product.html?id=${product.id}">${product.name}</a>
            <div class="small text-body-secondary">${formatPrice(product.price)}</div>
          </div>
          <button class="btn-close" type="button" data-fav-remove="${product.id}" aria-label="Убрать «${product.name}» из избранного"></button>
        </li>`;
    })
    .join("");
  document.querySelector("[data-fav-empty]").classList.toggle("d-none", list.length > 0);
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-fav], [data-fav-remove]");
  if (button) toggleFavorite(button.dataset.fav || button.dataset.favRemove);
});

document.querySelectorAll("form.needs-validation").forEach((form) => form.setAttribute("novalidate", ""));

function validateForm(form) {
  form.classList.add("was-validated");
  const valid = form.checkValidity();
  if (!valid) form.querySelector(":invalid").focus();
  return valid;
}

document.querySelectorAll("form[data-success]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateForm(form)) return;

    showToast(form.dataset.success);
    form.reset();
    form.classList.remove("was-validated");

    const modal = form.closest(".modal");
    if (modal) bootstrap.Modal.getInstance(modal).hide();
  });
});

if (quickOrderModal) {
  quickOrderModal.addEventListener("show.bs.modal", (event) => {
    const productId = event.relatedTarget && event.relatedTarget.dataset.product;
    if (productId) quickOrderModal.querySelector("select[name='product']").value = productId;
  });
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

updateFavorites();
