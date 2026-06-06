const API_URL = "https://knitknotkart-backend.onrender.com/api/products";
let globalProductsArray = []; 

// ====================================================
// 🛍️ 1. FETCH PRODUCTS FORM MONGODB 
// ====================================================

async function loadProductsFromDatabase() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (response.ok && data.success) {
            globalProductsArray = data.products; // 🎯 Data ko safely global variable me daal diya
            renderProductsToSections(globalProductsArray);
            handleURLParameters();
        } else {
            console.error("Database se products fetch nahi ho paye!");
        }
    } catch (error) {
        console.error("Network Error: Backend connected nahi hai shayad.", error);
    }
}

function renderProductsToSections(products) {
    const sections = document.querySelectorAll(".category-section");

    // Pehle saare purane cards saaf karo
    sections.forEach(section => {
        const grid = section.querySelector(".products-grid") || section;
        const oldCards = grid.querySelectorAll(".product-card, .product-box");
        oldCards.forEach(card => card.remove());
    });

    // Ab naye products insert karo
    products.forEach(p => {
        const category = p.category || "Flowers";
        const targetSection = document.querySelector(`.category-section[data-category="${category}"]`);

        if (targetSection) {
            const grid = targetSection.querySelector(".products-grid") || targetSection;

            // product.js me line number 43 ke aas-pass dekhna:
            const cardHTML = `
    <div class="product-card" data-category="${category}">
        <div class="product-img-box">
            <img src="${p.img}" alt="${p.name}">
        </div>
        <div class="product-info">
            <h3>${p.name}</h3>
            <p class="price">Starting at ₹${p.price}</p> 
            <button class="view-btn" data-id="${p._id}">
                View Product
            </button>
        </div>
    </div>
`;
            grid.insertAdjacentHTML("beforeend", cardHTML);
        }
    });
}

// ====================================================
// 📑 2. CATEGORY FILTER LOGIC
// ====================================================
const filterBtns = document.querySelectorAll(".filter-btn");
const sections = document.querySelectorAll(".category-section");

filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const category = btn.dataset.filter;

        sections.forEach(section => {
            if (category === "all" || section.dataset.category === category) {
                section.style.display = "block";
            } else {
                section.style.display = "none";
            }
        });
    });
});

function handleURLParameters() {
    const params = new URLSearchParams(window.location.search);
    const selected = params.get("category");

    if (selected) {
        filterBtns.forEach(btn => {
            btn.classList.remove("active");
            if (btn.dataset.filter === selected) btn.classList.add("active");
        });
        sections.forEach(section => {
            section.style.display = section.dataset.category === selected ? "block" : "none";
        });
    } else {
        const allBtn = document.querySelector('[data-filter="all"]');
        if (allBtn) allBtn.classList.add("active");
        sections.forEach(section => section.style.display = "block");
    }

    const productId = params.get("product");
    if (productId) {
        const targetBtn = document.querySelector(`[data-id="${productId}"]`);
        if (targetBtn) targetBtn.click();
    }
}

// ====================================================
// 🎯 3. PRODUCT POPUP LOGIC (Using Global Array)
// ====================================================
const productPopup = document.querySelector(".product-popup");
const closePopup = document.querySelector(".close-product");
const popupImg = document.querySelector("#popup-img");
const popupTitle = document.querySelector("#popup-title");
const popupPrice = document.querySelector("#popup-price");
const popupDesc = document.querySelector("#popup-desc");
const popupGallery = document.querySelector(".popup-gallery");

const cartBtn = document.querySelector("#cart-btn");
const orderBtn = document.querySelector("#order-btn");

let currentProduct = null;

document.addEventListener("click", (e) => {
    const btn = e.target.closest(".view-btn");
    if (!btn) return;

    e.preventDefault();

   
    const prodId = btn.dataset.id;
    const matchedProduct = globalProductsArray.find(item => String(item._id) === String(prodId));

    if (!matchedProduct) {
        console.error("Product details nahi mili array me!");
        return;
    }

    productPopup.classList.add("active");
    history.pushState({ popup: true }, "", "");

    
    popupGallery.innerHTML = "";
    popupImg.src = matchedProduct.img || "";
    popupTitle.innerText = matchedProduct.name || "Product";
    popupPrice.innerText = `₹${matchedProduct.price}`;
    popupDesc.innerText = matchedProduct.description || "";

    
    currentProduct = {
        id: matchedProduct._id,
        name: matchedProduct.name,
        price: Number(matchedProduct.price),
        img: matchedProduct.img
    };
});

// ====================================================
// 🛒 4. CART OPERATIONS
// ====================================================
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let totalQty = cart.reduce((total, item) => total + item.qty, 0);
    document.querySelectorAll(".cart-count").forEach(el => el.innerText = totalQty);
}

function addToCartLogic() {
    if (!currentProduct) return;
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let existingItem = cart.find(item => String(item.id) === String(currentProduct.id));

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ ...currentProduct, qty: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
}

if (cartBtn) {
    cartBtn.addEventListener("click", () => {
        addToCartLogic();
        let originalText = cartBtn.innerText;
        cartBtn.innerText = "Added! 🛒";
        cartBtn.disabled = true;
        setTimeout(() => {
            cartBtn.innerText = originalText;
            cartBtn.disabled = false;
        }, 1200);
    });
}

if (orderBtn) {
    orderBtn.addEventListener("click", () => {
        addToCartLogic();
        if (productPopup.classList.contains("active")) productPopup.classList.remove("active");
        window.location.href = "cart.html";
    });
}

const closePopupAndHistory = () => {
    if (productPopup.classList.contains("active")) {
        productPopup.classList.remove("active");
        if (history.state && history.state.popup) history.back();
    }
};

if (closePopup) closePopup.addEventListener("click", closePopupAndHistory);
if (productPopup) {
    productPopup.addEventListener("click", (e) => {
        if (e.target === productPopup) closePopupAndHistory();
    });
}

window.addEventListener("popstate", () => {
    if (productPopup && productPopup.classList.contains("active")) productPopup.classList.remove("active");
});

document.addEventListener("DOMContentLoaded", () => {
    loadProductsFromDatabase();
    updateCartCount();
});