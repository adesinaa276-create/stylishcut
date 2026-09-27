/* =========================================================
   STYLISH CUT — script.js
   One shared file, loaded on every page. Each block checks that
   its elements exist before using them, since not every page has
   every feature.
   ========================================================= */


/* =========================================================
   1. MOBILE NAVIGATION + ACTIVE LINK
   ========================================================= */

const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-header nav");

if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
        nav.classList.toggle("nav-open");
        const isOpen = nav.classList.contains("nav-open");
        navToggle.setAttribute("aria-expanded", isOpen);
    });

    const navLinks = nav.querySelectorAll("a");

    navLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            nav.classList.remove("nav-open");
            navToggle.setAttribute("aria-expanded", "false");
        });

        // Mark whichever link matches the current page so the visitor
        // always knows where they are in the site.
        const linkPage = link.getAttribute("href");
        const currentPage = window.location.pathname.split("/").pop() || "index.html";

        if (linkPage === currentPage) {
            link.setAttribute("aria-current", "page");
        }
    });
}


/* =========================================================
   2. BOOKING FORM — VALIDATION
   =========================================================
   contact.html's <form> calls this function directly:
       <form onsubmit="return handleBookingSubmit(event)">
*/

function handleBookingSubmit(event) {
    event.preventDefault();

    const form = event.target;

    const nameField = form.elements["name"];
    const phoneField = form.elements["phone"];
    const serviceField = form.elements["service"];
    const preferredTimeField = form.elements["preferred-time"];

    const name = nameField.value.trim();
    const phone = phoneField.value.trim();
    const service = serviceField.value;
    const preferredTime = preferredTimeField.value.trim();

    const status = document.querySelector("#form-status");

    // Clear old error states before re-checking.
    [nameField, phoneField, serviceField].forEach(function (field) {
        field.classList.remove("has-error");
    });
    document.querySelectorAll(".field-error").forEach(function (el) {
        el.textContent = "";
    });

    let firstInvalid = null;

    if (name === "") {
        setFieldError(nameField, "Enter your name.");
        firstInvalid = firstInvalid || nameField;
    }

    // A light-touch check: at least 7 digits, digits/spaces/+/- only.
    // Not a strict Nigerian-number validator, just enough to catch
    // obvious typos without blocking real numbers.
    const digitsOnly = phone.replace(/[^0-9]/g, "");
    if (phone === "") {
        setFieldError(phoneField, "Enter a phone number.");
        firstInvalid = firstInvalid || phoneField;
    } else if (digitsOnly.length < 7) {
        setFieldError(phoneField, "That number looks incomplete.");
        firstInvalid = firstInvalid || phoneField;
    }

    if (service === "") {
        setFieldError(serviceField, "Choose a service.");
        firstInvalid = firstInvalid || serviceField;
    }

    if (firstInvalid) {
        status.textContent = "Please fix the highlighted fields.";
        status.className = "form-status is-error";
        firstInvalid.focus();
        return false;
    }

    // No backend is wired up yet, so log the captured values for now.
    console.log("New booking request:", {
        name: name,
        phone: phone,
        service: service,
        preferredTime: preferredTime
    });

    status.textContent = "Thanks, " + name + "! Your booking request has been received.";
    status.className = "form-status is-success";

    form.reset();
    return false;
}

function setFieldError(field, message) {
    field.classList.add("has-error");
    const errorEl = document.querySelector('[data-error-for="' + field.name + '"]');
    if (errorEl) {
        errorEl.textContent = message;
    }
}

// If a gallery lightbox linked here with a service pre-selected
// (e.g. contact.html?service=skin-fade), select it automatically.
const serviceSelect = document.querySelector("#service");
if (serviceSelect) {
    const params = new URLSearchParams(window.location.search);
    const requestedService = params.get("service");
    if (requestedService) {
        const optionExists = Array.from(serviceSelect.options).some(function (opt) {
            return opt.value === requestedService;
        });
        if (optionExists) {
            serviceSelect.value = requestedService;
        }
    }
}


/* =========================================================
   3. GALLERY — FILTER + LIGHTBOX
   ========================================================= */

const galleryGrid = document.querySelector(".gallery-grid");

if (galleryGrid) {
    const filterButtons = document.querySelectorAll(".filter-btn");
    const figures = galleryGrid.querySelectorAll("figure");

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            filterButtons.forEach(function (b) {
                b.classList.remove("is-active");
                b.setAttribute("aria-pressed", "false");
            });
            button.classList.add("is-active");
            button.setAttribute("aria-pressed", "true");

            const category = button.dataset.filter;

            figures.forEach(function (figure) {
                const matches = category === "all" || figure.dataset.category === category;
                figure.classList.toggle("is-hidden", !matches);
            });
        });
    });

    const lightbox = document.querySelector("#lightbox");
    const lightboxImg = document.querySelector("#lightbox-img");
    const lightboxTitle = document.querySelector("#lightbox-title");
    const lightboxBook = document.querySelector("#lightbox-book");
    const lightboxClose = document.querySelector(".lightbox-close");

    let lastFocused = null;

    function openLightbox(button) {
        const figure = button.closest("figure");
        const img = figure.querySelector("img");
        const caption = figure.querySelector("figcaption").textContent;
        const service = figure.dataset.service;

        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxTitle.textContent = caption;

        if (service) {
            lightboxBook.href = "contact.html?service=" + encodeURIComponent(service);
            lightboxBook.style.display = "inline-flex";
        } else {
            lightboxBook.style.display = "none";
        }

        lastFocused = button;
        lightbox.classList.add("is-open");
        lightboxClose.focus();
        document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
        lightbox.classList.remove("is-open");
        document.body.style.overflow = "";
        if (lastFocused) {
            lastFocused.focus();
        }
    }

    galleryGrid.querySelectorAll(".gallery-item").forEach(function (button) {
        button.addEventListener("click", function () {
            openLightbox(button);
        });
    });

    if (lightbox) {
        lightboxClose.addEventListener("click", closeLightbox);

        lightbox.addEventListener("click", function (event) {
            if (event.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
                closeLightbox();
            }
        });
    }
}


/* =========================================================
   4. FAQ ACCORDION
   ========================================================= */

const faqQuestions = document.querySelectorAll(".faq-question");

faqQuestions.forEach(function (question) {
    question.addEventListener("click", function () {
        const isOpen = question.getAttribute("aria-expanded") === "true";

        // Close any other open item so only one is expanded at a time.
        faqQuestions.forEach(function (other) {
            other.setAttribute("aria-expanded", "false");
        });

        question.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });
});
