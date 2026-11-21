const products = [
  {
    id: 1,
    name: "Lusaka Linen Blazer",
    category: "Outerwear",
    price: 1450,
    image:
      "https://images.unsplash.com/photo-1694786702218-12124c2c9bcf?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 2,
    name: "Mosi Midi Dress",
    category: "Dresses",
    price: 980,
    image:
      "https://images.unsplash.com/photo-1639572490660-eab077b737a4?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 3,
    name: "Zambezi Drape Top",
    category: "Tops",
    price: 650,
    image:
      "https://images.unsplash.com/photo-1629363219280-4a39e2d213cd?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 4,
    name: "Chitenge Wrap Dress",
    category: "Dresses",
    price: 1120,
    image:
      "https://images.unsplash.com/photo-1625646741211-711bdd65c570?auto=format&fit=crop&w=900&q=85",
  },
];

const state = {
  category: "All",
  search: "",
  cart: {},
};

const productGrid = document.querySelector("#productGrid");
const noResults = document.querySelector("#noResults");
const menuDrawer = document.querySelector("#menuDrawer");
const cartDrawer = document.querySelector("#cartDrawer");
const overlay = document.querySelector("#pageOverlay");
const searchPanel = document.querySelector("#searchPanel");
const searchButton = document.querySelector("#searchButton");
const searchInput = document.querySelector("#searchInput");

let activeTrigger = null;

const money = (number) => `K${number.toLocaleString()}`;

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

function observeReveals(scope = document) {
  scope.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((element) => {
    revealObserver.observe(element);
  });
}

function productCard(product, index) {
  return `
    <article class="product-card reveal-up" data-reveal style="transition-delay:${index * 90}ms">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}">
        <span class="new-badge">New</span>
        <button class="quick-add" type="button" data-add="${product.id}">Add to bag</button>
      </div>
      <div class="product-details">
        <div>
          <h3>${product.name}</h3>
          <small>${product.category}</small>
        </div>
        <strong>${money(product.price)}</strong>
      </div>
      <button class="mobile-add" type="button" data-add="${product.id}">Add to bag</button>
    </article>`;
}

function renderProducts() {
  const query = state.search.trim().toLowerCase();
  const visible = products.filter((product) => {
    const inCategory = state.category === "All" || product.category === state.category;
    const inSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query);
    return inCategory && inSearch;
  });

  productGrid.innerHTML = visible.map(productCard).join("");
  noResults.hidden = visible.length > 0;
  observeReveals(productGrid);
}

function setSearchOpen(open, focusInput = false) {
  searchPanel.classList.toggle("open", open);
  if (open && focusInput) {
    requestAnimationFrame(() => searchInput.focus());
  }
}

function openDrawer(drawer, trigger = null) {
  closeDrawers(false);
  activeTrigger = trigger || document.activeElement;
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  drawer.inert = false;
  overlay.classList.add("open");
  document.body.classList.add("no-scroll");

  const closeBtn = drawer.querySelector("button");
  if (closeBtn) requestAnimationFrame(() => closeBtn.focus());
}

function closeDrawers(restoreFocus = true) {
  [menuDrawer, cartDrawer].forEach((drawer) => {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    drawer.inert = true;
  });
  overlay.classList.remove("open");
  document.body.classList.remove("no-scroll");

  if (restoreFocus && activeTrigger instanceof HTMLElement) {
    activeTrigger.focus();
  }
  activeTrigger = null;
}

function addToCart(id, trigger = null) {
  state.cart[id] = (state.cart[id] || 0) + 1;
  const note = document.querySelector("#checkoutNote");
  if (note) note.hidden = true;
  renderCart();
  openDrawer(cartDrawer, trigger);
}

function updateQuantity(id, change) {
  state.cart[id] = (state.cart[id] || 0) + change;
  if (state.cart[id] <= 0) delete state.cart[id];
  renderCart();
}

function renderCart() {
  const cartProducts = products.filter((product) => state.cart[product.id]);
  const count = Object.values(state.cart).reduce((sum, quantity) => sum + quantity, 0);
  const total = cartProducts.reduce(
    (sum, product) => sum + product.price * state.cart[product.id],
    0,
  );

  const bagCount = document.querySelector("#bagCount");
  bagCount.textContent = count;
  bagCount.hidden = count === 0;
  document.querySelector("#cartHeadingCount").textContent = `(${count})`;
  document.querySelector("#cartSummary").hidden = count === 0;
  document.querySelector("#cartTotal").textContent = money(total);

  if (!count) {
    document.querySelector("#cartItems").innerHTML = `
      <div class="empty-cart">
        <h3>Your bag is empty.</h3>
        <a href="#shop" class="close-cart-link">Shop Zambian style</a>
      </div>`;
    return;
  }

  document.querySelector("#cartItems").innerHTML = cartProducts
    .map((product) => {
      const qty = state.cart[product.id];
      return `
      <div class="cart-item">
        <img src="${product.image}" alt="${product.name}">
        <div class="cart-item-info">
          <div class="cart-item-title">
            <div><h3>${product.name}</h3><small>Select size at checkout</small></div>
            <strong>${money(product.price * qty)}</strong>
          </div>
          <div class="quantity">
            <button type="button" data-change="-1" data-id="${product.id}" aria-label="Decrease quantity">−</button>
            <span>${qty}</span>
            <button type="button" data-change="1" data-id="${product.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
      </div>`;
    })
    .join("");
}

document.querySelector("#menuButton").addEventListener("click", (event) => {
  openDrawer(menuDrawer, event.currentTarget);
});

document.querySelector("#bagButton").addEventListener("click", (event) => {
  openDrawer(cartDrawer, event.currentTarget);
});

document.querySelector("#mobileSearchButton").addEventListener("click", () => {
  closeDrawers(false);
  setSearchOpen(true, true);
});

document.querySelectorAll(".close-menu, .close-cart").forEach((button) => {
  button.addEventListener("click", () => closeDrawers(true));
});

overlay.addEventListener("click", () => closeDrawers(true));

searchButton.addEventListener("click", () => {
  const nextOpen = !searchPanel.classList.contains("open");
  setSearchOpen(nextOpen, nextOpen);
});

document.addEventListener("click", (event) => {
  if (
    searchPanel.classList.contains("open") &&
    !event.target.closest("#searchPanel") &&
    !event.target.closest("#searchButton")
  ) {
    setSearchOpen(true);
  }
});

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderProducts();
});

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(".filter.active").classList.remove("active");
    button.classList.add("active");
    state.category = button.dataset.category;
    renderProducts();
  });
});

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const quantityButton = event.target.closest("[data-change]");
  const drawerLink = event.target.closest(".drawer a");

  if (addButton) addToCart(Number(addButton.dataset.add), addButton);
  if (quantityButton) {
    updateQuantity(Number(quantityButton.dataset.id), Number(quantityButton.dataset.change));
  }
  if (drawerLink) closeDrawers(false);
});

document.querySelector("#checkoutButton").addEventListener("click", () => {
  const note = document.querySelector("#checkoutNote");
  if (note) note.hidden = false;
});

document.querySelector("#newsletterForm").addEventListener("submit", (event) => {
  event.preventDefault();
  event.currentTarget.hidden = true;
  document.querySelector("#newsletterSuccess").hidden = false;
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setSearchOpen(false);
    closeDrawers(true);
  }
});

renderProducts();
renderCart();
observeReveals();