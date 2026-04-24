const PRODUCTS = [
  {
    id: 1,
    name: "Robusta Bananas",
    category: "Fruits",
    price: 48,
    unit: "per dozen",
    icon: "🍌",
    accent: "#fff2c4",
    description: "Sweet everyday bananas ideal for breakfast, shakes, and lunchboxes."
  },
  {
    id: 2,
    name: "Desi Tomatoes",
    category: "Vegetables",
    price: 36,
    unit: "per kg",
    icon: "🍅",
    accent: "#ffd9d4",
    description: "Fresh tomatoes for tadka, curries, salads, and everyday cooking."
  },
  {
    id: 3,
    name: "Amul Milk",
    category: "Dairy",
    price: 34,
    unit: "per 500 ml pouch",
    icon: "🥛",
    accent: "#edf7ff",
    description: "Daily-use milk delivered chilled for tea, coffee, and breakfast."
  },
  {
    id: 4,
    name: "Wheat Atta",
    category: "Staples",
    price: 265,
    unit: "per 5 kg bag",
    icon: "🌾",
    accent: "#f6e6cc",
    description: "Stone-ground atta for soft rotis, parathas, and home cooking."
  },
  {
    id: 5,
    name: "Palak",
    category: "Vegetables",
    price: 22,
    unit: "per bunch",
    icon: "🥬",
    accent: "#ddf5d6",
    description: "Fresh spinach bunches for dal, sabzi, smoothies, and soups."
  },
  {
    id: 6,
    name: "Paneer",
    category: "Dairy",
    price: 95,
    unit: "per 200 g pack",
    icon: "🧀",
    accent: "#ffe8a8",
    description: "Soft paneer cubes perfect for tikka, bhurji, and rich gravies."
  },
  {
    id: 7,
    name: "Masala Chai",
    category: "Beverages",
    price: 180,
    unit: "per 500 g pack",
    icon: "☕",
    accent: "#ffe0b6",
    description: "Aromatic tea blend with warming spices for a classic Indian brew."
  },
  {
    id: 8,
    name: "Bikaneri Bhujia",
    category: "Snacks",
    price: 55,
    unit: "per 400 g pack",
    icon: "🥜",
    accent: "#eee3d3",
    description: "Crunchy namkeen snack for tea time, gatherings, and quick cravings."
  }
];

const DELIVERY_FEE = 49;

function createStore(initialState) {
  let state = initialState;
  const listeners = [];

  return {
    getState() {
      return state;
    },
    subscribe(listener) {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index >= 0) {
          listeners.splice(index, 1);
        }
      };
    },
    setState(updater) {
      state = typeof updater === "function" ? updater(state) : { ...state, ...updater };
      listeners.forEach((listener) => listener(state));
    }
  };
}

const initialState = {
  products: PRODUCTS,
  selectedCategory: "All",
  searchTerm: "",
  cart: {}
};

const store = createStore(initialState);

const elements = {
  productGrid: document.getElementById("product-grid"),
  categoryFilters: document.getElementById("category-filters"),
  searchInput: document.getElementById("search-input"),
  cartItems: document.getElementById("cart-items"),
  productCount: document.getElementById("product-count"),
  categoryCount: document.getElementById("category-count"),
  cartCount: document.getElementById("cart-count"),
  summaryItems: document.getElementById("summary-items"),
  summarySubtotal: document.getElementById("summary-subtotal"),
  summaryDelivery: document.getElementById("summary-delivery"),
  summaryTotal: document.getElementById("summary-total"),
  clearCartBtn: document.getElementById("clear-cart-btn")
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2
  }).format(value);
}

function getCategories(products) {
  return ["All", ...new Set(products.map((product) => product.category))];
}

function getVisibleProducts(state) {
  const query = state.searchTerm.trim().toLowerCase();

  return state.products.filter((product) => {
    const matchesCategory =
      state.selectedCategory === "All" || product.category === state.selectedCategory;
    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });
}

function getCartDetails(state) {
  const cartEntries = Object.entries(state.cart);
  const items = cartEntries.map(([id, quantity]) => {
    const product = state.products.find((entry) => entry.id === Number(id));
    const total = product.price * quantity;

    return {
      ...product,
      quantity,
      total
    };
  });

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const total = items.length ? subtotal + DELIVERY_FEE : 0;

  return { items, itemCount, subtotal, total };
}

function updateCategory(category) {
  store.setState((current) => ({
    ...current,
    selectedCategory: category
  }));
}

function updateSearch(term) {
  store.setState((current) => ({
    ...current,
    searchTerm: term
  }));
}

function addToCart(productId) {
  store.setState((current) => ({
    ...current,
    cart: {
      ...current.cart,
      [productId]: (current.cart[productId] || 0) + 1
    }
  }));
}

function changeQuantity(productId, nextQuantity) {
  store.setState((current) => {
    const nextCart = { ...current.cart };

    if (nextQuantity <= 0) {
      delete nextCart[productId];
    } else {
      nextCart[productId] = nextQuantity;
    }

    return {
      ...current,
      cart: nextCart
    };
  });
}

function clearCart() {
  store.setState((current) => ({
    ...current,
    cart: {}
  }));
}

function renderFilters(state) {
  const categories = getCategories(state.products);

  elements.categoryFilters.innerHTML = categories
    .map(
      (category) => `
        <button
          class="filter-chip ${category === state.selectedCategory ? "active" : ""}"
          type="button"
          data-category="${category}"
        >
          ${category}
        </button>
      `
    )
    .join("");
}

function renderProducts(state) {
  const visibleProducts = getVisibleProducts(state);

  if (!visibleProducts.length) {
    elements.productGrid.innerHTML = `
      <article class="empty-state">
        <strong>No products match this view.</strong>
        <p>Try another category or search term to update the state and re-render the catalog.</p>
      </article>
    `;
    return;
  }

  elements.productGrid.innerHTML = visibleProducts
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-visual" style="background:${product.accent}">
            <span aria-hidden="true">${product.icon}</span>
          </div>
          <div class="product-meta">
            <div>
              <span class="tag">${product.category}</span>
              <h3>${product.name}</h3>
              <p>${product.description}</p>
            </div>
          </div>
          <div class="product-footer">
            <div>
              <div class="price">${formatCurrency(product.price)}</div>
              <p>${product.unit}</p>
            </div>
            <button class="add-btn" type="button" data-add-id="${product.id}">Add to cart</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderCart(state) {
  const cartDetails = getCartDetails(state);

  if (!cartDetails.items.length) {
    elements.cartItems.innerHTML = `
      <article class="empty-state">
        <strong>Your cart is empty.</strong>
        <p>Add grocery items to see centralized state updates reflected here.</p>
      </article>
    `;
  } else {
    elements.cartItems.innerHTML = cartDetails.items
      .map(
        (item) => `
          <article class="cart-item">
            <div class="cart-item-copy">
              <h3>${item.name}</h3>
              <p>${item.unit}</p>
              <p class="cart-note">${formatCurrency(item.price)} each</p>
            </div>
            <div>
              <div class="cart-item-controls">
                <button class="quantity-btn" type="button" data-decrease-id="${item.id}">-</button>
                <strong>${item.quantity}</strong>
                <button class="quantity-btn" type="button" data-increase-id="${item.id}">+</button>
              </div>
              <p class="price">${formatCurrency(item.total)}</p>
            </div>
          </article>
        `
      )
      .join("");
  }

  elements.cartCount.textContent = cartDetails.itemCount;
  elements.summaryItems.textContent = cartDetails.itemCount;
  elements.summarySubtotal.textContent = formatCurrency(cartDetails.subtotal);
  elements.summaryDelivery.textContent = formatCurrency(cartDetails.items.length ? DELIVERY_FEE : 0);
  elements.summaryTotal.textContent = formatCurrency(cartDetails.total);
}

function renderMetrics(state) {
  elements.productCount.textContent = state.products.length;
  elements.categoryCount.textContent = getCategories(state.products).length - 1;
}

function render(state) {
  renderMetrics(state);
  renderFilters(state);
  renderProducts(state);
  renderCart(state);
}

elements.searchInput.addEventListener("input", (event) => {
  updateSearch(event.target.value);
});

elements.categoryFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (button) {
    updateCategory(button.dataset.category);
  }
});

elements.productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-id]");
  if (button) {
    addToCart(Number(button.dataset.addId));
  }
});

elements.cartItems.addEventListener("click", (event) => {
  const decreaseButton = event.target.closest("[data-decrease-id]");
  const increaseButton = event.target.closest("[data-increase-id]");

  if (decreaseButton) {
    const id = Number(decreaseButton.dataset.decreaseId);
    const current = store.getState().cart[id] || 0;
    changeQuantity(id, current - 1);
  }

  if (increaseButton) {
    const id = Number(increaseButton.dataset.increaseId);
    const current = store.getState().cart[id] || 0;
    changeQuantity(id, current + 1);
  }
});

elements.clearCartBtn.addEventListener("click", clearCart);

store.subscribe(render);
render(store.getState());
