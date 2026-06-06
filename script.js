window.updateGlobalCartCount = function() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let totalQty = cart.reduce((total, item) => total + item.qty, 0);
    
    document.querySelectorAll(".cart-count").forEach(el => {
        el.innerText = totalQty;
    });
}

document.addEventListener("DOMContentLoaded", window.updateGlobalCartCount);
window.addEventListener("pageshow", window.updateGlobalCartCount);

let icon = document.querySelector(".menu-icon");
let mobileicon = document.querySelector(".mobile-menu");

// 🛠️ MENU CLOSE 
function closeMobileMenu() {
    mobileicon.classList.remove("active");
    icon.classList.remove("active");
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-menu-icon lucide-menu">
                        <path d="M4 5h16" />
                        <path d="M4 12h16" />
                        <path d="M4 19h16" />
                    </svg>`;
}

// 🛠️ HAMBURGER CLICK LOGIC WITH HISTORY STATE
icon.addEventListener("click", () => {
    if (!mobileicon.classList.contains("active")) {
        
        mobileicon.classList.add("active");
        icon.classList.add("active");
        icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
        
        
        history.pushState({ menu: "open" }, null, "#menu-open");
    } else {
        
        history.back();
    }
});

// 🛠️ MOBILE BACK BUTTON DETECT  LOGIC
window.addEventListener("popstate", (event) => {
   
    closeMobileMenu();
});

// Desktop links logic
const navLinks = document.querySelectorAll('.nav-links');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (mobileicon.classList.contains("active")) {
            history.back(); 
        } else {
            closeMobileMenu();
        }
    });
});

// Mobile links logic
const mobileLinks = document.querySelectorAll(".mobile-menu a");
mobileLinks.forEach(link => {
    link.addEventListener("click", () => {
        if (mobileicon.classList.contains("active")) {
          
            mobileicon.classList.remove("active");
            history.back();
        }
    });
});

// Page Load Animation Logic 
window.addEventListener("load", () => {
    document.body.classList.add("loaded");
    setTimeout(() => {
        if (typeof startAnimation === "function") {
            startAnimation();
        }
    }, 1200);
});

let cards = document.querySelectorAll(".card");
let container = document.querySelector(".cards-container");

if (cards.length > 0 && container) {

    let slides = [

        {
            image: "sunflower.jpg",
            top: ["MADE", "BY", "LOVE"],
            bottom: ["BUY", "FOR", "LOVED ONES"]
        },

        {
            image: "teddy.jpg",
            top: ["SOFT", "CUTE", "MAGIC"],
            bottom: ["HUG", "PLAY", "SMILE"]
        },

        {
            image: "bag.jpg",
            top: ["HAND", "CRAFT", "JOY"],
            bottom: ["GIFT", "WITH", "CARE"]
        }

    ];

    let current = 0;
    let timeline = [];
    let paused = false;



    function updateSlide() {

        let slide = slides[current];

        // IMAGE
        document.querySelector(".img1").style.backgroundImage =
            `url(${slide.image})`;

        document.querySelector(".img2").style.backgroundImage =
            `url(${slide.image})`;

        document.querySelector(".img3").style.backgroundImage =
            `url(${slide.image})`;

        // TOP
        document.querySelectorAll(".top-text")[0].innerText =
            slide.top[0];

        document.querySelectorAll(".top-text")[1].innerText =
            slide.top[1];

        document.querySelectorAll(".top-text")[2].innerText =
            slide.top[2];

        // BOTTOM
        document.querySelectorAll(".bottom-text")[0].innerText =
            slide.bottom[0];

        document.querySelectorAll(".bottom-text")[1].innerText =
            slide.bottom[1];

        document.querySelectorAll(".bottom-text")[2].innerText =
            slide.bottom[2];
    }



    function schedule(fn, time) {

        timeline.push({
            fn,
            time,
            id: setTimeout(fn, time),
            start: Date.now()
        });
    }



    function startAnimation() {

        timeline = [];

        cards.forEach(card => {
            card.classList.remove("flip");
        });

        updateSlide();

        schedule(() => {
            cards[0].classList.add("flip");
        }, 250);

        schedule(() => {
            cards[1].classList.add("flip");
        }, 650);

        schedule(() => {
            cards[2].classList.add("flip");
        }, 1050);

        schedule(() => {
            cards.forEach(card => {
                card.classList.remove("flip");
            });
        }, 2600);

        schedule(() => {

            current++;

            if (current >= slides.length) {
                current = 0;
            }

            startAnimation();

        }, 3600);
    }



    function pauseAnimation() {

        if (paused) return;

        paused = true;

        container.classList.add("touch-active");

        timeline.forEach(t => {

            clearTimeout(t.id);

            t.remaining =
                t.time - (Date.now() - t.start);
        });
    }



    function resumeAnimation() {

        if (!paused) return;

        paused = false;

        container.classList.remove("touch-active");

        timeline.forEach(t => {

            t.start = Date.now();

            t.id = setTimeout(
                t.fn,
                t.remaining
            );
        });
    }


    cards.forEach(card => {

        // MOBILE
        card.addEventListener(
            "touchstart",
            pauseAnimation
        );

        card.addEventListener(
            "touchend",
            resumeAnimation
        );

        card.addEventListener(
            "touchcancel",
            resumeAnimation
        );


        // DESKTOP MOUSE PRESS
        card.addEventListener(
            "mousedown",
            pauseAnimation
        );

        card.addEventListener(
            "mouseup",
            resumeAnimation
        );

        card.addEventListener(
            "mouseleave",
            resumeAnimation
        );

    });

}

let popupSound =
    document.querySelector(".popup-sound");

let videoPopup =
    document.querySelector(".video-popup");

let popupVideo =
    document.querySelector(".popup-video");

let closeBtn =
    document.querySelector(".close-video");

let reels =
    document.querySelectorAll(".product-video video");

if (
    popupSound &&
    videoPopup &&
    popupVideo &&
    closeBtn
) {

    reels.forEach(video => {

        video.addEventListener("click", () => {
            history.pushState({ videoPopup: true }, "", "");
            videoPopup.classList.add("active");

            popupVideo.src =
                video.querySelector("source").src;

            popupVideo.muted = true;

            popupSound.innerHTML = "🔇";

            popupVideo.play();

        });

    });



//    mobile back button
    window.addEventListener("popstate", (event) => {
        if (videoPopup.classList.contains("active")) {
            videoPopup.classList.remove("active");
            popupVideo.pause();
            popupVideo.src = "";
            popupVideo.muted = true;
            if (popupSound) popupSound.innerHTML = "🔇";
        }
    });

    // 2. MODIFIED: Manual close 
    const closeVideoPopup = () => {
        if (videoPopup.classList.contains("active")) {
            videoPopup.classList.remove("active");
            popupVideo.pause();
            popupVideo.src = "";
            popupVideo.muted = true;
            if (popupSound) popupSound.innerHTML = "🔇";
            
            
            if (history.state && history.state.videoPopup) {
                history.back(); 
            }
        }
    };

    closeBtn.addEventListener("click", closeVideoPopup);

    videoPopup.addEventListener("click", (e) => {
        if (e.target === videoPopup) {
            closeVideoPopup();
        }
    });



    let soundBtns =
        document.querySelectorAll(".sound-toggle");

    popupSound.addEventListener("click", () => {

        popupVideo.muted =
            !popupVideo.muted;

        if (popupVideo.muted) {

            popupSound.innerHTML = "🔇";
        }

        else {

            popupSound.innerHTML = "🔊";
        }

    });

}

// FORCING MENU CLOSE ON BACK-BUTTON (BFCache Fix)
window.addEventListener("pageshow", (event) => {

    if (event.persisted) {
        let mobileicon = document.querySelector(".mobile-menu");
        let icon = document.querySelector(".menu-icon");

        if (mobileicon && mobileicon.classList.contains("active")) {
            mobileicon.classList.remove("active");
            icon.classList.remove("active");

            // Icon ko wapas hamburger (3 lines) bana do
            icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu-icon lucide-menu"><path d="M4 5h16" /><path d="M4 12h16" /><path d="M4 19h16" /></svg>`;
        }
    }
});


// videos lag
document.addEventListener("DOMContentLoaded", function () {
    let videos = document.querySelectorAll("video");

    let observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            let video = entry.target;
            
            if (entry.isIntersecting) {
                
                let sources = video.querySelectorAll("source");
                let needsLoad = false;
                
                sources.forEach(source => {
                    if (source.dataset.src && !source.src) {
                        source.src = source.dataset.src; 
                        needsLoad = true;
                    }
                });

                if (needsLoad) {
                    video.load(); 
                }

                let playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => { console.log("Play error", error); });
                }
            } else {
                video.pause();
            }
        });
    }, {
        threshold: 0.1 
    });

    videos.forEach(video => {
        
        if (!video.classList.contains("popup-video")) {
            observer.observe(video);
        }
    });
});


// ====================================================
// 🔐 USER AUTHENTICATION & MODAL MANAGEMENT LOGIC
// ====================================================

const BACKEND_URL = "https://knitknotkart-backend.onrender.com/api/auth";
let isLoginMode = true; // Default UI mode is set to Login

// Open Authentication Modal
function openLoginModal() {
    const modal = document.getElementById("authModal");
    if (modal) modal.classList.add("active");
}

// Close Authentication Modal
function closeLoginModal() {
    const modal = document.getElementById("authModal");
    if (modal) modal.classList.remove("active");
}

// Toggle between Login and Registration Modes
function toggleAuthMode(e) {
    e.preventDefault();
    isLoginMode = !isLoginMode;

    const modalTitle = document.getElementById("modalTitle");
    const modalSubtitle = document.getElementById("modalSubtitle");
    const nameInputGroup = document.getElementById("nameInputGroup");
    const authSubmitBtn = document.getElementById("authSubmitBtn");
    const toggleAuthText = document.getElementById("toggleAuthText");

    if (isLoginMode) {
        modalTitle.innerText = "Welcome Back";
        modalSubtitle.innerText = "Log in to your KnitKnotKart account";
        nameInputGroup.style.display = "none";
        authSubmitBtn.innerText = "Login";
        toggleAuthText.innerHTML = `Don't have an account? <a href="#" onclick="toggleAuthMode(event)">Sign Up</a>`;
    } else {
        modalTitle.innerText = "Create Account";
        modalSubtitle.innerText = "Join our exclusive craft and plushie community";
        nameInputGroup.style.display = "flex";
        authSubmitBtn.innerText = "Sign Up";
        toggleAuthText.innerHTML = `Already have an account? <a href="#" onclick="toggleAuthMode(event)">Login</a>`;
    }
}

// Handle Form Submission for Authentication (Sign Up / Login APIs)
async function handleAuthSubmit(event) {
    event.preventDefault();

    const name = document.getElementById("authName").value;
    const email = document.getElementById("authEmail").value;
    const password = document.getElementById("authPassword").value;
    const authSubmitBtn = document.getElementById("authSubmitBtn");

    const originalBtnText = authSubmitBtn.innerText;
    authSubmitBtn.innerText = "Processing...";
    authSubmitBtn.disabled = true;

    const endpoint = isLoginMode ? "/login" : "/signup";
    const requestData = isLoginMode ? { email, password } : { name, email, password };

    try {
        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Authentication failed. Please verify your credentials.");
            return;
        }

        if (isLoginMode) {
            // Login Success: Persist session tokens and user meta data locally
            localStorage.setItem("knit_token", data.token);
            localStorage.setItem("knit_user_name", data.user.name);

            alert(`Welcome back, ${data.user.name}!`);
            closeLoginModal();
            checkLoginStatus(); // Re-evaluate navigation bar state
        } else {
            // Registration Success: Direct user to verification/login flow
            alert("Account registered successfully! Please log in.");
            toggleAuthMode(event);
        }

    } catch (error) {
        console.error("Authentication Request Error:", error);
        alert("Unable to establish connection with the authentication server.");
    } finally {
        authSubmitBtn.innerText = originalBtnText;
        authSubmitBtn.disabled = false;
    }
}

// Dynamically Monitor Session State and Update Navigation UI Component
function checkLoginStatus() {
    const token = localStorage.getItem("knit_token");
    const userName = localStorage.getItem("knit_user_name");
    const authTextSpan = document.getElementById("authText");
    const authLink = document.getElementById("authLink");

    if (!authLink || !authTextSpan) return;

    if (token && userName) {
        const firstName = userName.split(" ")[0];
        authTextSpan.innerText = `Hi, ${firstName}`;
        
        // Handle User Logout Operations safely
        authLink.onclick = function(e) {
            e.preventDefault();
            if (confirm("Are you sure you want to log out of your session?")) {
                localStorage.removeItem("knit_token");
                localStorage.removeItem("knit_user_name");
                alert("Session terminated successfully.");
                window.location.reload();
            }
        };
    } else {
        authTextSpan.innerText = "Login";
        authLink.onclick = function(e) {
            e.preventDefault();
            openLoginModal();
        };
    }
}

// Global Lifecycle Listener to Sync Authentication Status
document.addEventListener("DOMContentLoaded", () => {
    checkLoginStatus();
});