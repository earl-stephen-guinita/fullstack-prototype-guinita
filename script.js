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

        // Render tables when navigating to admin pages
    if (name === 'employees')   { renderEmployees(); refreshDeptDropdown(); }
    if (name === 'departments') { renderDepts(); }
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

// ── Departments Data ───────────────────────────────────────
let departments  = JSON.parse(localStorage.getItem("departments") || "[]"); 
let editDeptIndex = null; // tracks edited departments, while null adds new department

function saveDepts() {
    localStorage.setItem("departments", JSON.stringify(departments));
}

function renderDepts() {
    const tbody = document.getElementById("deptTableBody");
    const noRow = document.getElementById("noDeptsRow");
    // Clear existing rows except the "no depts" row
    tbody.querySelectorAll("tr.dept-row").forEach(r => r.remove()); // if dept exists, loop each one and create row

    if (departments.length === 0) {
        noRow.classList.remove("d-none");
        return;
    }
    noRow.classList.add("d-none");

    departments.forEach((dept, index) => {
        const tr = document.createElement("tr");
        tr.classList.add("dept-row");
        tr.innerHTML = `
            <td>${dept.name}</td>
            <td>${dept.description}</td>
            <td>
                <button class="btn btn-outline-primary btn-sm me-1" onclick="editDept(${index})">Edit</button>
                <button class="btn btn-outline-danger btn-sm" onclick="deleteDept(${index})">Delete</button>
            </td>`;
        tbody.appendChild(tr);
    });

    // Also refresh the dept dropdown in the employee form
    refreshDeptDropdown();
}

function toggleDeptForm(show, index = null) { // if null clears form, if not null pre-fill form with existing data
    document.getElementById("deptForm").classList.toggle("d-none", !show);
    if (show) {
        editDeptIndex = index;
        document.getElementById("deptFormTitle").textContent =
            index !== null ? "Edit Department" : "Add Department";
        document.getElementById("deptName").value =
            index !== null ? departments[index].name : "";
        document.getElementById("deptDescription").value =
            index !== null ? departments[index].description : "";
    }
}

function saveDepartment() {
    const name        = document.getElementById("deptName").value.trim();
    const description = document.getElementById("deptDescription").value.trim();
    if (!name) { alert("Department name is required."); return; }

    if (editDeptIndex !== null) {
        departments[editDeptIndex] = { name, description };
    } else {
        departments.push({ name, description });
    }

    saveDepts();
    renderDepts();
    toggleDeptForm(false);
}

function editDept(index) {
    toggleDeptForm(true, index);
}

function deleteDept(index) { // deletes a department
    if (confirm("Delete this department?")) {
        departments.splice(index, 1);
        saveDepts();
        renderDepts();
    }
}

// ── Employees Data ─────────────────────────────────────────
let employees      = JSON.parse(localStorage.getItem("employees") || "[]");
let editEmpIndex   = null; // tracks edited employees, while null adds new employee

function saveEmps() {
    localStorage.setItem("employees", JSON.stringify(employees));
}

function refreshDeptDropdown() { // whenever a new dept is added, it appears in the dropdown
    const select = document.getElementById("empDept");
    if (!select) return;
    const current = select.value;
    select.innerHTML = '<option value="">Select Department</option>';
    departments.forEach(dept => {
        const opt = document.createElement("option");
        opt.value = dept.name;
        opt.textContent = dept.name;
        if (dept.name === current) opt.selected = true;
        select.appendChild(opt);
    });
}

function renderEmployees() {
    const tbody = document.getElementById("employeeTableBody");
    const noRow = document.getElementById("noEmployeesRow");
    tbody.querySelectorAll("tr.emp-row").forEach(r => r.remove()); // if employee exists, loop each one and create row

    if (employees.length === 0) {
        noRow.classList.remove("d-none");
        return;
    }
    noRow.classList.add("d-none");

    employees.forEach((emp, index) => {
        const tr = document.createElement("tr");
        tr.classList.add("emp-row");
        tr.innerHTML = `
            <td>${emp.id}</td>
            <td>${emp.email}</td>
            <td>${emp.position}</td>
            <td>${emp.dept}</td>
            <td>
                <button class="btn btn-outline-primary btn-sm me-1" onclick="editEmp(${index})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteEmp(${index})">Delete</button>
            </td>`;
        tbody.appendChild(tr);
    });
}

function toggleEmployeeForm(show, index = null) { // if null clears form, if not null pre-fill form with existing data
    document.getElementById("employeeForm").classList.toggle("d-none", !show);
    if (show) {
        editEmpIndex = index;
        refreshDeptDropdown();
        document.getElementById("employeeFormTitle").textContent =
            index !== null ? "Edit Employee" : "Add/Edit Employee";
        document.getElementById("empId").value       = index !== null ? employees[index].id       : "";
        document.getElementById("empEmail").value    = index !== null ? employees[index].email    : "";
        document.getElementById("empPosition").value = index !== null ? employees[index].position : "";
        document.getElementById("empDept").value     = index !== null ? employees[index].dept     : "";
        document.getElementById("empHireDate").value = index !== null ? employees[index].hireDate : "";
    }
}

function saveEmployee() {
    const id       = document.getElementById("empId").value.trim();
    const email    = document.getElementById("empEmail").value.trim();
    const position = document.getElementById("empPosition").value.trim();
    const dept     = document.getElementById("empDept").value;
    const hireDate = document.getElementById("empHireDate").value;

    if (!id || !email || !position || !dept) {
        alert("ID, Email, Position and Department are required.");
        return;
    }

    if (editEmpIndex !== null) {
        employees[editEmpIndex] = { id, email, position, dept, hireDate };
    } else {
        employees.push({ id, email, position, dept, hireDate });
    }

    saveEmps();
    renderEmployees();
    toggleEmployeeForm(false);
}

function editEmp(index) {
    toggleEmployeeForm(true, index);
}

function deleteEmp(index) { // deletes an employee
    if (confirm("Delete this employee?")) {
        employees.splice(index, 1);
        saveEmps();
        renderEmployees();
    }
}

// ── Init ───────────────────────────────────────────────────
updateNavbar();