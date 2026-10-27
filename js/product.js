const productId = new URLSearchParams(location.search).get("id") || "camera-slr";
const product = findProduct(productId);

function fill(key, callback) {
  document.querySelectorAll(`[data-p="${key}"]`).forEach(callback);
}

function specValue(item, name) {
  const spec = item.specs.find(([key]) => key === name);
  return spec ? spec[1] : "—";
}

function renderProduct() {
  document.title = `${product.name} — Винтаж-лавка`;

  fill("name", (element) => (element.textContent = product.name));
  fill("short", (element) => (element.textContent = product.short));
  fill("description", (element) => (element.textContent = product.description));
  fill("category", (element) => (element.textContent = CATEGORIES[product.category]));
  fill("price", (element) => (element.textContent = formatPrice(product.price)));
  fill("id", (element) => (element.value = product.id));
  fill("image", (element) => {
    element.src = product.image;
    if (element.alt) element.alt = product.alt;
  });
  fill("photo", (element) => (element.src = product.photo));

  fill("old-price", (element) => {
    element.textContent = product.oldPrice ? formatPrice(product.oldPrice) : "";
    element.classList.toggle("d-none", !product.oldPrice);
  });

  fill("badge", (element) => {
    element.classList.toggle("d-none", !product.badge);
    if (!product.badge) return;
    element.className = `badge ${BADGES[product.badge].className}`;
    element.textContent = badgeText(product);
  });

  fill("specs", (element) => {
    element.innerHTML = product.specs
      .map(([key, value]) => `<tr><th scope="row" class="w-50">${key}</th><td>${value}</td></tr>`)
      .join("");
  });

  document.querySelectorAll("#buyForm [data-fav]").forEach((button) => {
    button.dataset.fav = product.id;
  });
}

function renderCompare() {
  const similar = PRODUCTS.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 2);
  const section = document.getElementById("compareSection");
  section.classList.toggle("d-none", similar.length === 0);
  if (similar.length === 0) return;

  const columns = [product, ...similar];
  const cell = (item, value) => `<td${item === product ? ' class="table-active fw-semibold"' : ""}>${value}</td>`;

  fill("compare-head", (element) => {
    element.innerHTML = `<tr><th scope="col">Характеристика</th>${columns
      .map((item) => `<th scope="col"${item === product ? ' class="table-active fw-semibold"' : ""}><a class="text-body" href="product.html?id=${item.id}">${item.name}</a></th>`)
      .join("")}</tr>`;
  });

  const keys = product.specs
    .map(([key]) => key)
    .filter((key) => similar.some((item) => specValue(item, key) !== "—"));

  const rows = [`<tr><th scope="row">Цена</th>${columns.map((item) => cell(item, formatPrice(item.price))).join("")}</tr>`];
  keys.forEach((key) => {
    rows.push(`<tr><th scope="row">${key}</th>${columns.map((item) => cell(item, specValue(item, key))).join("")}</tr>`);
  });
  fill("compare-body", (element) => (element.innerHTML = rows.join("")));
}

function renderRelated() {
  const others = PRODUCTS.filter((item) => item.id !== product.id);
  const related = [
    ...others.filter((item) => item.category === product.category),
    ...others.filter((item) => item.category !== product.category),
  ].slice(0, 3);

  document.getElementById("relatedGrid").innerHTML = related.map((item) => renderCard(item)).join("");
}

if (product) {
  renderProduct();
  renderCompare();
  renderRelated();
  updateFavorites();
} else {
  document.title = "Товар не найден — Винтаж-лавка";
  document.querySelectorAll("main > section").forEach((section) => section.classList.add("d-none"));
  document.getElementById("productMissing").classList.remove("d-none");
}
