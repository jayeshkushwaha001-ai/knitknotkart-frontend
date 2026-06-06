// cart.js
const cartItemsContainer = document.querySelector("#cart-items-container");
const totalItemsCount = document.querySelector("#total-items-count");
const cartTotalPrice = document.querySelector("#cart-total-price");
const checkoutBtn = document.querySelector("#checkout-btn");

function displayCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-msg">
                    <p>Your cart is empty! 
                              <div class="category-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-panda-icon lucide-panda">
                        <path d="M11.25 17.25h1.5L12 18z" />
                        <path d="m15 12 2 2" />
                        <path d="M18 6.5a.5.5 0 0 0-.5-.5" />
                        <path
                            d="M20.69 9.67a4.5 4.5 0 1 0-7.04-5.5 8.35 8.35 0 0 0-3.3 0 4.5 4.5 0 1 0-7.04 5.5C2.49 11.2 2 12.88 2 14.5 2 19.47 6.48 22 12 22s10-2.53 10-7.5c0-1.62-.48-3.3-1.3-4.83" />
                        <path d="M6 6.5a.495.495 0 0 1 .5-.5" />
                        <path d="m9 12-2 2" />
                    </svg>
                </div>
                    </p>
                    <a href="products.html" class="shop-now-btn">Shop Our Products</a>
                </div>
            `;
        }
        if (totalItemsCount) totalItemsCount.innerText = "0";
        if (cartTotalPrice) cartTotalPrice.innerText = "₹0";
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;
    if (cartItemsContainer) cartItemsContainer.innerHTML = "";

    let totalAmount = 0;
    let totalQty = 0;

    cart.forEach(item => {
        let itemTotal = item.price * item.qty;
        totalAmount += itemTotal;
        totalQty += item.qty;

        const itemCard = document.createElement("div");
        itemCard.classList.add("cart-item-card");
        itemCard.innerHTML = `
            <img src="${item.img || 'rose.jpg'}" alt="${item.name}">
            <div class="item-main-details">
                <h3>${item.name}</h3>
                <p class="item-price">₹${item.price}</p>
            </div>
            <div class="quantity-controls">
                <button class="qty-btn minus-btn" data-id="${item.id}">-</button>
                <span class="item-qty">${item.qty}</span>
                <button class="qty-btn plus-btn" data-id="${item.id}">+</button>
            </div>
            <button class="remove-item-btn" data-id="${item.id}">Remove</button>
        `;
        if (cartItemsContainer) cartItemsContainer.appendChild(itemCard);
    });

    if (totalItemsCount) totalItemsCount.innerText = totalQty;
    if (cartTotalPrice) cartTotalPrice.innerText = "₹" + totalAmount;
}

// BULLETPROOF CLICK HANDLER
if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", (e) => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        const plusButton = e.target.closest(".plus-btn");
        const minusButton = e.target.closest(".minus-btn");
        const removeButton = e.target.closest(".remove-item-btn");

        let activeBtn = plusButton || minusButton || removeButton;
        if (!activeBtn) return;


        const productId = String(activeBtn.getAttribute("data-id")).trim();

        // 1. PLUS CLICK
        if (plusButton) {
            let product = cart.find(item => String(item.id).trim() === productId);
            if (product) product.qty += 1;
        }

        // 2. MINUS CLICK
        else if (minusButton) {
            let product = cart.find(item => String(item.id).trim() === productId);
            if (product) {
                product.qty -= 1;
                if (product.qty < 1) {
                    cart = cart.filter(item => String(item.id).trim() !== productId);
                }
            }
        }

        // 3. REMOVE CLICK
        else if (removeButton) {
            cart = cart.filter(item => String(item.id).trim() !== productId);
        }


        localStorage.setItem("cart", JSON.stringify(cart));
        displayCart();

        // Navbar syncing
        if (typeof window.updateGlobalCartCount === "function") {
            window.updateGlobalCartCount();
        }
    });
}

if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
        window.location.href = "checkout.html";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    displayCart();
    document.body.classList.add("loaded");
});