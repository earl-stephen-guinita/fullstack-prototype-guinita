let isLoggedIn = true;      
let userRole = "admin";     

const guestLinks = document.getElementById("guestLinks");
const userDropdown = document.getElementById("userDropdown");
const adminLinks = document.querySelectorAll(".role-admin");
const usernameBtn = document.getElementById("usernameBtn");
const logoutBtn = document.getElementById("logoutBtn");

function updateNavbar() {

    if (isLoggedIn) {

        guestLinks.classList.add("d-none");
        userDropdown.classList.remove("d-none");

        usernameBtn.textContent =
            userRole === "admin" ? "Admin" : "User";

        adminLinks.forEach(link => {
            if (userRole === "admin") {
                link.classList.remove("d-none");
            } else {
                link.classList.add("d-none");
            }
        });

    } else {

        guestLinks.classList.remove("d-none");
        userDropdown.classList.add("d-none");

    }
}

logoutBtn.addEventListener("click", function () {
    isLoggedIn = false;
    updateNavbar();
});

updateNavbar();