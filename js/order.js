const DELIVERY = {
  pickup: { label: "Самовывоз из лавки", price: 0 },
  courier: { label: "Курьер по Москве", price: 390, freeFrom: 5000 },
  post: { label: "Почта России", price: 450 },
};

const PROMO = { code: "VINTAGE10", percent: 10 };

const orderForm = document.getElementById("orderForm");
const productSelect = document.getElementById("product");
const qtyInput = document.getElementById("qty");
const addressBlock = document.getElementById("addressBlock");
const addressInput = document.getElementById("address");
const promoInput = document.getElementById("promo");
const promoMessage = document.getElementById("promoMessage");
const orderError = document.getElementById("orderError");
const addressCollapse = bootstrap.Collapse.getOrCreateInstance(addressBlock, { toggle: false });

let discountPercent = 0;

function getQuantity() {
  return Math.min(10, Math.max(1, Math.round(Number(qtyInput.value)) || 1));
}

function calculate() {
  const product = findProduct(productSelect.value);
  const quantity = getQuantity();
  const method = orderForm.elements.delivery.value;
  const subtotal = product ? product.price * quantity : 0;
  const discount = Math.round((subtotal * discountPercent) / 100);
  const delivery = DELIVERY[method];
  const deliveryPrice = !product || (delivery.freeFrom && subtotal - discount >= delivery.freeFrom) ? 0 : delivery.price;

  return { product, quantity, method, subtotal, discount, deliveryPrice, total: subtotal - discount + deliveryPrice };
}

function updateSummary() {
  const order = calculate();
  const image = document.getElementById("summaryImage");

  image.classList.toggle("d-none", !order.product);
  if (order.product) image.src = order.product.image;

  document.getElementById("summaryName").textContent = order.product ? order.product.name : "Товар не выбран";
  document.getElementById("summaryUnit").textContent = order.product
    ? `${formatPrice(order.product.price)} × ${order.quantity} шт.`
    : "Выберите товар в форме";
  document.getElementById("summarySubtotal").textContent = formatPrice(order.subtotal);
  document.getElementById("summaryDelivery").textContent = order.deliveryPrice ? formatPrice(order.deliveryPrice) : "бесплатно";
  document.getElementById("summaryDiscount").textContent = "−" + formatPrice(order.discount);
  document.getElementById("summaryDiscountRow").classList.toggle("d-none", order.discount === 0);
  document.getElementById("summaryTotal").textContent = formatPrice(order.total);
}

function updateDelivery() {
  const needAddress = orderForm.elements.delivery.value !== "pickup";
  addressInput.required = needAddress;
  if (needAddress) addressCollapse.show();
  else addressCollapse.hide();
}

function applyPromo() {
  const code = promoInput.value.trim().toUpperCase();
  promoInput.classList.remove("is-valid", "is-invalid");
  promoMessage.classList.remove("text-success", "text-danger");

  if (!code) {
    discountPercent = 0;
    promoMessage.textContent = "Промокод VINTAGE10 даёт скидку 10% на товары.";
  } else if (code === PROMO.code) {
    discountPercent = PROMO.percent;
    promoInput.classList.add("is-valid");
    promoMessage.classList.add("text-success");
    promoMessage.textContent = `Промокод применён: скидка ${PROMO.percent}%.`;
  } else {
    discountPercent = 0;
    promoInput.classList.add("is-invalid");
    promoMessage.classList.add("text-danger");
    promoMessage.textContent = "Такого промокода нет.";
  }
  updateSummary();
}

document.getElementById("promoApply").addEventListener("click", applyPromo);
promoInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    applyPromo();
  }
});

orderForm.addEventListener("input", updateSummary);
orderForm.addEventListener("change", (event) => {
  if (event.target.name === "delivery") updateDelivery();
  updateSummary();
});
qtyInput.addEventListener("change", () => {
  qtyInput.value = getQuantity();
  updateSummary();
});

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const valid = validateForm(orderForm);
  orderError.classList.toggle("d-none", valid);
  if (!valid) return;

  const order = calculate();
  document.getElementById("successName").textContent = orderForm.elements.name.value.trim();
  document.getElementById("successNumber").textContent = "№ " + Math.floor(10000 + Math.random() * 90000);
  document.getElementById("successProduct").textContent = `${order.product.name}, ${order.quantity} шт.`;
  document.getElementById("successDelivery").textContent = DELIVERY[order.method].label;
  document.getElementById("successTotal").textContent = formatPrice(order.total);
  bootstrap.Modal.getOrCreateInstance(document.getElementById("orderSuccessModal")).show();

  orderForm.reset();
  orderForm.classList.remove("was-validated");
  promoInput.classList.remove("is-valid", "is-invalid");
  discountPercent = 0;
  applyPromo();
  updateDelivery();
});

const params = new URLSearchParams(location.search);
if (findProduct(params.get("product"))) productSelect.value = params.get("product");
if (params.get("qty")) qtyInput.value = params.get("qty");
qtyInput.value = getQuantity();

updateDelivery();
updateSummary();
