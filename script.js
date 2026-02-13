// ── State ──────────────────────────────────────────────────
let isLoggedIn = false;
let userRole = "user";
let currentUser = null;

// ── Page Navigation ────────────────────────────────────────
function showPage(name) {
    // Hide every page section
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    // Show the requested page
    const target = document.getElementById('page-' + name);
    if (target) target.classList.add('active');
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
    isLoggedIn = false;
    currentUser = null;
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

    // Bootstrap validation
    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }

    // Save to localStorage (simulated registration)
    const user = { firstName, lastName, email, password, role: "user" };
    localStorage.setItem("registeredUser", JSON.stringify(user));

    // Show success message, reset form
    form.classList.remove("was-validated");
    form.reset();
    document.getElementById("registerSuccess").classList.remove("d-none");
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

    // Look up user from localStorage
    const stored = JSON.parse(localStorage.getItem("registeredUser") || "null");

    if (stored && stored.email === email && stored.password === password) {
        // Successful login
        isLoggedIn  = true;
        currentUser = stored;
        userRole    = stored.role;

        errorBox.classList.add("d-none");
        form.classList.remove("was-validated");
        form.reset();

        document.getElementById("dashUsername").textContent =
            stored.firstName + " " + stored.lastName;

        updateNavbar();
        showPage('dashboard');
    } else {
        errorBox.classList.remove("d-none");
    }
});

// ── Init ───────────────────────────────────────────────────
updateNavbar();