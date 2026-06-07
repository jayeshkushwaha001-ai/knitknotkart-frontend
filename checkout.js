// checkout.js

// AUTO- FILL
// Execute profile fetch operation immediately upon DOM load
document.addEventListener("DOMContentLoaded", initializeCheckoutForm);

/*
 * Fetches authenticated user information and populates contact fields automatically.
 */
async function initializeCheckoutForm() {
    const token = localStorage.getItem("knit_token");
    if (!token) return; // Safeguarded by routeGuard already

    try {
        // Request authenticated profile records from the backend server
        const response = await fetch("https://knitknotkart-backend.onrender.com/api/auth/profile", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            const emailField = document.getElementById("cust-email");
            const nameField = document.getElementById("cust-name");

            // Populate form nodes and restrict manual modification inputs
            if (emailField) {
                emailField.value = data.user.email;
                emailField.readOnly = true;
                emailField.style.backgroundColor = "#e9ecef"; // Greyed out style indicator
                emailField.style.cursor = "not-allowed";
            }

            if (nameField) {
                nameField.value = data.user.name;
                nameField.readOnly = true;
                nameField.style.backgroundColor = "#e9ecef";
                nameField.style.cursor = "not-allowed";
            }
        } else {
            // If token is invalid or expired, clear local storage and redirect
            console.warn("Session validation failed. Clearing local storage tokens.");
            localStorage.removeItem("knit_token");
            localStorage.removeItem("knit_user_name");
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error("Critical error while auto-populating checkout parameters:", error);
        alert("Failed to sync secure user profile session data.");
    }
}

const addressForm = document.querySelector("#address-form");
const stepAddressCard = document.querySelector("#step-address-card");
const stepPaymentCard = document.querySelector("#step-payment-card");
const paymentContent = document.querySelector("#payment-content");

const summaryItemsList = document.querySelector("#summary-items-list");
const checkoutTotalPrice = document.querySelector("#checkout-total-price");
const paymentPayableAmount = document.querySelector("#payment-payable-amount");

const placeOrderBtn = document.querySelector("#place-order-btn");
const backToAddress = document.querySelector("#back-to-address");

let customerDetails = {};
let finalTotalAmount = 0;
let cartSummaryText = ""; // Email format bill text container

// 1. Live price calculation from localStorage
function renderCheckoutSummary() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
        alert("Your cart is empty! Redirecting to products...");
        window.location.href = "products.html";
        return;
    }

    summaryItemsList.innerHTML = "";
    let total = 0;
    cartSummaryText = ""; // reset template text

    cart.forEach(item => {
        let cost = item.price * item.qty;
        total += cost;

        // Display list item row
        const row = document.createElement("div");
        row.classList.add("summary-item-row");
        row.innerHTML = `<span>${item.name} (x${item.qty})</span> <span>₹${cost}</span>`;
        summaryItemsList.appendChild(row);

        // String text formatting for backend emails receipt layout
        cartSummaryText += `${item.name} x ${item.qty} - ₹${cost}\n`;
    });

    finalTotalAmount = total;
    checkoutTotalPrice.innerText = "₹" + total;
    paymentPayableAmount.innerText = "₹" + total;
}

// 2. STEP 1: Address Submit triggers Step-2 transition
addressForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Store user responses safely
    customerDetails = {
        name: document.querySelector("#cust-name").value,
        email: document.querySelector("#cust-email").value,
        phone: document.querySelector("#cust-phone").value,
        address: document.querySelector("#cust-address").value
    };

    // UI State Swap animation triggers
    addressForm.classList.add("hidden");
    stepAddressCard.style.opacity = "0.6"; // Dim address step

    stepPaymentCard.classList.remove("disabled");
    paymentContent.classList.remove("hidden");
});

// Back to Step 1 Edit
backToAddress.addEventListener("click", () => {
    addressForm.classList.remove("hidden");
    stepAddressCard.style.opacity = "1";

    stepPaymentCard.classList.add("disabled");
    paymentContent.classList.add("hidden");
});

// 3. STEP 2: Trigger Simulated Payment and Execute EmailJS automation
placeOrderBtn.addEventListener("click", async () => {
    if (!customerDetails.name || !customerDetails.email || !customerDetails.phone || !customerDetails.address) {
        alert("Firstly, fill address form");
        return;
    }

    placeOrderBtn.innerText = "Initiating Secure Gateway...";
    placeOrderBtn.disabled = true;

    try {
        // --- NAYA LOGIC YAHAN SE SHURU HAI ---
        // 1. Sabse pehle backend se chupke se apni Live Key ID mangwao
        const keyResponse = await fetch("https://knitknotkart-backend.onrender.com/api/payment/get-key");
        const keyData = await keyResponse.json();

        // 2. Ab Backend ko bolo order banane ke liye
        const backendUrl = "https://knitknotkart-backend.onrender.com/api/payment/order";
        const response = await fetch(backendUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: finalTotalAmount })
        });

        const orderData = await response.json();

        if (!orderData.success) {
            alert("Backend couldn't generate order from server!");
            placeOrderBtn.disabled = false;
            return;
        }

        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        // 3. Razorpay ka popup kholo (Yahan backend se aayi key use hogi)
        const options = {
            "key": keyData.key, // <-- DEKH BHAI! Hardcoded key hata di hai
            "amount": orderData.amount,
            "currency": "INR",
            "name": "KnitKnotKart",
            "description": "Handmade Luxury Crochet Products",
            "order_id": orderData.order_id,
            "handler": async function (razorpayResponse) {

                placeOrderBtn.innerText = "Verifying Payment Safely...";

                try {
                    // Backend verfication data send
                    const verifyUrl = "https://knitknotkart-backend.onrender.com/api/payment/verify";
                    const verifyResponse = await fetch(verifyUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_order_id: razorpayResponse.razorpay_order_id,
                            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                            razorpay_signature: razorpayResponse.razorpay_signature,
                            customerDetails: customerDetails,
                            cartItems: cart,
                            totalAmount: finalTotalAmount
                        })
                    });

                    const verificationResult = await verifyResponse.json();

                    if (verificationResult.success) {
                        alert("🎉 Order Placed Successfully! Payment Verified.");
                        localStorage.removeItem("cart"); 
                        window.location.href = "index.html"; 
                    } else {
                        alert("❌ Security Alert: Payment verification failed!");
                    }

                } catch (err) {
                    console.error("Verification fetch error:", err);
                    alert("Payment check issue!");
                }
            },
            "prefill": {
                "name": customerDetails.name,
                "email": customerDetails.email,
                "contact": customerDetails.phone
            },
            "theme": {
                "color": "#8B5E3C"
            }
        };

        const rzp = new Razorpay(options);
        rzp.open();

    } catch (error) {
        console.error("Checkout system failed:", error);
        alert("problem in payment gateway connection!");
    } finally {
        placeOrderBtn.innerText = "Pay & Place Order";
        placeOrderBtn.disabled = false;
    }
});

// Initialization sequence loop
document.addEventListener("DOMContentLoaded", renderCheckoutSummary);
