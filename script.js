document.addEventListener("DOMContentLoaded", function () {
  updateNavbar();

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("user");
      updateNavbar();
      window.location.href = "login.html";
    });
  }
});

function updateNavbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  const notLoggedInLinks = document.querySelectorAll(".not-logged-in");
  const loggedInDropdown = document.querySelector(".logged-in");
  const adminItems = document.querySelectorAll(".role-admin");

  if (user) {
    // Show logged-in UI
    notLoggedInLinks.forEach(el => el.classList.add("d-none"));
    loggedInDropdown.classList.remove("d-none");

    // Set username
    document.getElementById("navUsername").textContent = user.username;

    // Show admin links if role is admin
    if (user.role === "admin") {
      adminItems.forEach(el => el.classList.remove("d-none"));
    } else {
      adminItems.forEach(el => el.classList.add("d-none"));
    }

  } else {
    // Show not logged-in UI
    notLoggedInLinks.forEach(el => el.classList.remove("d-none"));
    if (loggedInDropdown) loggedInDropdown.classList.add("d-none");
  }
}
