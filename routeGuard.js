/**
 * Route Guard to prevent unauthorized access to protected frontend pages.
 * This runs immediately before the page finishes loading.
 */
(function checkUserSession() {
    const token = localStorage.getItem("knit_token");
    
    // If no token is found, redirect unauthorized visitors to the main page
    if (!token) {
        alert("Access Denied. Please log in to proceed to checkout.");
        window.location.href = "index.html";
    }
})();

