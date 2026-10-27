const PER_PAGE = 6;

const grid = document.getElementById("productGrid");
const filtersForm = document.getElementById("filtersForm");
const sortSelect = document.getElementById("sort");
const pagination = document.getElementById("pagination");
const filterCountBadge = document.querySelector("[data-filter-count]");

let currentPage = 1;

function getFilters() {
  const data = new FormData(filtersForm);
  return {
    query: data.get("q").trim().toLowerCase(),
    categories: data.getAll("category"),
    min: Number(data.get("min")) || 0,
    max: Number(data.get("max")) || Infinity,
    sale: data.has("sale"),
  };
}

function matches(product, filters) {
  return (
    product.name.toLowerCase().includes(filters.query) &&
    (filters.categories.length === 0 || filters.categories.includes(product.category)) &&
    product.price >= filters.min &&
    product.price <= filters.max &&
    (!filters.sale || Boolean(product.oldPrice))
  );
}

const sorters = {
  popular: () => 0,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  name: (a, b) => a.name.localeCompare(b.name, "ru"),
};

function pluralize(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "товар";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "товара";
  return "товаров";
}

function renderPagination(pages) {
  pagination.closest("nav").classList.toggle("d-none", pages <= 1);

  const pageItem = (page, label, state = "") =>
    `<li class="page-item ${state}"><a class="page-link" href="#" data-page="${page}"${state === "active" ? ' aria-current="page"' : ""}>${label}</a></li>`;

  let html = pageItem(currentPage - 1, "&laquo;", currentPage === 1 ? "disabled" : "");
  for (let page = 1; page <= pages; page++) {
    html += pageItem(page, page, page === currentPage ? "active" : "");
  }
  html += pageItem(currentPage + 1, "&raquo;", currentPage === pages ? "disabled" : "");
  pagination.innerHTML = html;
}

function render() {
  const filters = getFilters();
  const found = PRODUCTS.filter((product) => matches(product, filters)).sort(sorters[sortSelect.value]);
  const pages = Math.max(1, Math.ceil(found.length / PER_PAGE));
  currentPage = Math.min(currentPage, pages);

  grid.innerHTML = found
    .slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)
    .map((product) => renderCard(product, "col-12 col-sm-6 col-xl-4"))
    .join("");
  updateFavorites();

  document.querySelector("[data-count]").textContent = found.length;
  document.querySelector("[data-count-word]").textContent = pluralize(found.length);
  document.getElementById("emptyState").classList.toggle("d-none", found.length > 0);

  const activeFilters =
    filters.categories.length +
    (filters.query ? 1 : 0) +
    (filters.min > 0 || filters.max !== Infinity ? 1 : 0) +
    (filters.sale ? 1 : 0);
  filterCountBadge.textContent = activeFilters;
  filterCountBadge.classList.toggle("d-none", activeFilters === 0);

  renderPagination(pages);
}

function resetToFirstPage() {
  currentPage = 1;
  render();
}

filtersForm.addEventListener("input", resetToFirstPage);
filtersForm.addEventListener("submit", (event) => event.preventDefault());
filtersForm.addEventListener("reset", () => setTimeout(resetToFirstPage));
sortSelect.addEventListener("change", resetToFirstPage);

pagination.addEventListener("click", (event) => {
  const link = event.target.closest("[data-page]");
  event.preventDefault();
  if (!link || link.parentElement.matches(".disabled, .active")) return;

  currentPage = Number(link.dataset.page);
  render();
  grid.scrollIntoView({ block: "start" });
});

const categoryFromUrl = new URLSearchParams(location.search).get("cat");
const categoryCheckbox = filtersForm.querySelector(`input[name="category"][value="${CSS.escape(categoryFromUrl || "")}"]`);
if (categoryCheckbox) categoryCheckbox.checked = true;

render();
