let isLoggedIn  = false;
let userRole    = "user";
let currentUser = null;

// ── function to what page is clicked ────────────────────────────────────────
function showPage(name) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active')); // finds every element that has class page and shows one page at a time
    const target = document.getElementById('page-' + name); // finds the specific page that you want to show
    if (target) target.classList.add('active'); // adds active to show the page

    // shows email verified banner
    if (name !== 'login') {
        document.getElementById("loginVerifiedBanner").classList.add("d-none");
    }    

    // only runs when name is profile and calls loadProfileView function
    if (name === 'profile') {
        loadProfileView();
    }
}

// ── Navbar Elements ────────────────────────────────────────
const guestLinks   = document.getElementById("guestLinks");
const userDropdown = document.getElementById("userDropdown");
const adminLinks   = document.querySelectorAll(".role-admin");
const usernameBtn  = document.getElementById("usernameBtn");
const logoutBtn    = document.getElementById("logoutBtn");

// ── Navbar State ───────────────────────────────────────────
function updateNavbar() {
    if (isLoggedIn) {
        guestLinks.classList.add("d-none");
        userDropdown.classList.remove("d-none");
        usernameBtn.textContent = currentUser
            ? currentUser.firstName
            : (userRole === "admin" ? "Admin" : "User");

        adminLinks.forEach(link =>
            link.classList.toggle("d-none", userRole !== "admin")
        );
    } else {
        guestLinks.classList.remove("d-none");
        userDropdown.classList.add("d-none");
    }
}

// ── Logout ─────────────────────────────────────────────────
logoutBtn.addEventListener("click", function () {
    isLoggedIn  = false;
    currentUser = null;
    userRole    = "user";
    updateNavbar();
    showPage('home');
});

// ── Register Form ──────────────────────────────────────────
document.getElementById("registerForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const form      = this;
    const firstName = document.getElementById("regFirstName").value.trim();
    const lastName  = document.getElementById("regLastName").value.trim();
    const email     = document.getElementById("regEmail").value.trim();
    const password  = document.getElementById("regPassword").value;

    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }

    // Save to localStorage — role is "admin" for every registered user
    const user = { firstName, lastName, email, password, role: "admin", verified: false };
    localStorage.setItem("registeredUser", JSON.stringify(user));

    form.classList.remove("was-validated");
    form.reset();
    document.getElementById("verifyEmailDisplay").textContent = email;
    showPage('verify');
});

// ── Simulate Email Verification ────────────────────────────
document.getElementById("simulateVerifyBtn").addEventListener("click", function () {
    const stored = JSON.parse(localStorage.getItem("registeredUser") || "null");
    if (stored) {
        stored.verified = true;
        localStorage.setItem("registeredUser", JSON.stringify(stored));
    }
    this.disabled    = true;
    this.textContent = "✔ Verified!";
    setTimeout(() => {
        document.getElementById("loginVerifiedBanner").classList.remove("d-none");
        showPage('login');
    }, 1200);
});

// ── Login Form ─────────────────────────────────────────────
document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const form     = this;
    const email    = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const errorBox = document.getElementById("loginError");

    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }

    const stored = JSON.parse(localStorage.getItem("registeredUser") || "null");
    if (stored && stored.email === email && stored.password === password) {
        // Successful login
        isLoggedIn  = true;
        currentUser = stored;
        userRole    = stored.role;  // reads "admin" from localStorage

        errorBox.classList.add("d-none");
        form.classList.remove("was-validated");
        form.reset();

        updateNavbar();
        showPage('profile');
    } else {
        errorBox.classList.remove("d-none");
    }
});

// ── profile card ─────────────────────────────────────
function loadProfileView() {
    if (!currentUser) return; // collects logged-in user's data
    document.getElementById("profileFullName").textContent =
        currentUser.firstName + " " + currentUser.lastName;
    document.getElementById("profileEmail").textContent =
        currentUser.email;
    document.getElementById("profileRole").textContent =
        currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
}

// ── Init ───────────────────────────────────────────────────
updateNavbar();