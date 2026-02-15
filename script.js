let isLoggedIn  = false;
let currentUser = null;

// ── page navigation ────────────────────────────────────────
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
    if (name === 'accounts') {renderAccounts(); }
    if (name === 'my-requests')  { renderRequests(); }
}

// ── Navbar Elements ────────────────────────────────────────
const usernameBtn  = document.getElementById("usernameBtn");
const logoutBtn    = document.getElementById("logoutBtn");

// ── Navbar State ───────────────────────────────────────────
function updateNavbar() {
    const body = document.body;

    if (isLoggedIn && currentUser) {
        body.classList.add("authenticated");
        body.classList.remove("not-authenticated");
        usernameBtn.textContent = currentUser.firstName;
            
        if (currentUser.role === "admin") {
            body.classList.add("is-admin");
        } else {
            body.classList.remove("is-admin");
        }
    } else {
        body.classList.add("not-authenticated");
        body.classList.remove("authenticated", "is-admin");
    }
}

// ── Logout ─────────────────────────────────────────────────
logoutBtn.addEventListener("click", function () {
    isLoggedIn  = false;
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

        errorBox.classList.add("d-none");
        form.classList.remove("was-validated");
        form.reset();

        updateNavbar();

        // if logged acc exists, checks if acc exists in acc table. Then add acc to table if not.
        const exists = accounts.find(a => a.email === currentUser.email);
        if (!exists) {
            accounts.push({
                firstName : currentUser.firstName,
                lastName  : currentUser.lastName,
                email     : currentUser.email,
                password  : currentUser.password,
                role      : currentUser.role,
                verified  : true
            });
            saveAccounts();
        }

        showPage('profile');
    } else {
        errorBox.textContent = "Invalid email or password.";
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
    select.innerHTML = '<option value="">--Select Department--</option>';
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
                <button class="btn btn-outline-danger btn-sm" onclick="deleteEmp(${index})">Delete</button>
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

// ── Accounts Data ──────────────────────────────────────────
let accounts       = JSON.parse(localStorage.getItem("accounts") || "[]");
let editAccIndex   = null;

function saveAccounts() {
    localStorage.setItem("accounts", JSON.stringify(accounts));
}

function renderAccounts() {
    const tbody = document.getElementById("accountTableBody");
    const noRow = document.getElementById("noAccountsRow");
    tbody.querySelectorAll("tr.acc-row").forEach(r => r.remove());

    if (accounts.length === 0) {
        noRow.classList.remove("d-none");
        return;
    }
    noRow.classList.add("d-none");

    accounts.forEach((acc, index) => {
        const tr = document.createElement("tr");
        tr.classList.add("acc-row");
        tr.innerHTML = `
            <td>${acc.firstName} ${acc.lastName}</td>
            <td>${acc.email}</td>
            <td>${acc.role.charAt(0).toUpperCase() + acc.role.slice(1)}</td>
            <td>${acc.verified ? '✅' : '❌'}</td>
            <td>
                <button class="btn btn-outline-primary btn-sm me-1" onclick="editAcc(${index})">Edit</button>
                <button class="btn btn-outline-warning btn-sm me-1" onclick="resetPassword(${index})">Reset Password</button>
                <button class="btn btn-outline-danger btn-sm" onclick="deleteAcc(${index})">Delete</button>
            </td>`;
        tbody.appendChild(tr);
    });
}

function toggleAccountForm(show, index = null) {
    document.getElementById("accountForm").classList.toggle("d-none", !show);
    if (show) {
        editAccIndex = index;
        document.getElementById("accountFormTitle").textContent =
            index !== null ? "Edit Account" : "Add/Edit Account";
        document.getElementById("accFirstName").value = index !== null ? accounts[index].firstName : "";
        document.getElementById("accLastName").value  = index !== null ? accounts[index].lastName  : "";
        document.getElementById("accEmail").value     = index !== null ? accounts[index].email     : "";
        document.getElementById("accPassword").value  = index !== null ? accounts[index].password  : "";
        document.getElementById("accRole").value      = index !== null ? accounts[index].role      : "user";
        document.getElementById("accVerified").checked = index !== null ? accounts[index].verified : false;
    }
}

function saveAccount() {
    const firstName = document.getElementById("accFirstName").value.trim();
    const lastName  = document.getElementById("accLastName").value.trim();
    const email     = document.getElementById("accEmail").value.trim();
    const password  = document.getElementById("accPassword").value.trim();
    const role      = document.getElementById("accRole").value;
    const verified  = document.getElementById("accVerified").checked;

    if (!firstName || !lastName || !email || !password) {
        alert("All fields are required.");
        return;
    }

    if (editAccIndex !== null) {
        accounts[editAccIndex] = { firstName, lastName, email, password, role, verified };
    } else {
        accounts.push({ firstName, lastName, email, password, role, verified });
    }

    saveAccounts();
    renderAccounts();
    toggleAccountForm(false);
}

function editAcc(index) {
    toggleAccountForm(true, index);
}

function resetPassword(index) {
    const newPass = prompt("Enter new password for " + accounts[index].firstName + ":");
    if (newPass && newPass.trim() !== "") {
        accounts[index].password = newPass.trim();
        saveAccounts();
        alert("✅ Password reset successfully.");
    }
}

function deleteAcc(index) {
    if (confirm("Delete this account?")) {

        // Fix: checks if deleting the currently logged-in account (prevents deleting own acc)
        if (accounts[index].email === currentUser.email) {
            alert("You cannot delete your own account while logged in.");
            return;
        }        

        accounts.splice(index, 1);
        saveAccounts();
        renderAccounts();
    }
}

// ── My Requests ────────────────────────────────────────────
let myRequests = JSON.parse(localStorage.getItem("myRequests") || "[]");

function saveRequests() {
    localStorage.setItem("myRequests", JSON.stringify(myRequests));
}

function renderRequests() {
    const noMsg  = document.getElementById("noRequestsMsg");
    const table  = document.getElementById("requestsTable");
    const tbody  = document.getElementById("requestsTableBody");
    tbody.innerHTML = "";

    if (myRequests.length === 0) {
        noMsg.classList.remove("d-none");
        table.classList.add("d-none");
        return;
    }

    noMsg.classList.add("d-none");
    table.classList.remove("d-none");

    myRequests.forEach((req, index) => {
        const itemsSummary = req.items.map(i => `${i.name} (x${i.qty})`).join(", ");
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${req.type}</td>
            <td>${itemsSummary}</td>
            <td><span class="badge bg-warning text-dark">${req.status}</span></td>
            <td>
                <button class="btn btn-outline-danger btn-sm"
                        onclick="deleteRequest(${index})">Delete</button>
            </td>`;
        tbody.appendChild(tr);
    });
}

function openRequestModal() {
    // Reset form
    document.getElementById("requestType").value = "Equipment";
    document.getElementById("requestItemsList").innerHTML = "";
    addRequestItem(); // start with one empty item row

    const modal = new bootstrap.Modal(document.getElementById("requestModal"));
    modal.show();
}

function addRequestItem() {
    const list = document.getElementById("requestItemsList");
    const isFirst  = list.querySelectorAll(".item-row").length === 0;    
    const row  = document.createElement("div");
    row.classList.add("d-flex", "gap-2", "mb-2", "item-row");

        if (isFirst) {
        row.innerHTML = `
            <input type="text" class="form-control form-control-sm" placeholder="Item name">
            <input type="number" class="form-control form-control-sm" value="1" min="1" style="max-width:70px">
            <button type="button" class="btn btn-outline-secondary btn-sm"
                    onclick="addRequestItem()">+</button>`;
    } else {
        row.innerHTML = `
            <input type="text" class="form-control form-control-sm" placeholder="Item name">
            <input type="number" class="form-control form-control-sm" value="1" min="1" style="max-width:70px">
            <button type="button" class="btn btn-outline-danger btn-sm"
                    onclick="this.closest('.item-row').remove()">×</button>`;
    }

    list.appendChild(row);
}

function submitRequest() {
    const type     = document.getElementById("requestType").value;
    const itemRows = document.querySelectorAll("#requestItemsList .item-row");
    const items    = [];

    itemRows.forEach(row => {
        const inputs = row.querySelectorAll("input");
        const name   = inputs[0].value.trim();
        const qty    = inputs[1].value || 1;
        if (name) items.push({ name, qty });
    });

    if (items.length === 0) {
        alert("Please add at least one item.");
        return;
    }

    myRequests.push({ type, items, status: "Pending" });
    saveRequests();
    renderRequests();

    // Close form
    bootstrap.Modal.getInstance(document.getElementById("requestModal")).hide();
}

function deleteRequest(index) {
    if (confirm("Delete this request?")) {
        myRequests.splice(index, 1);
        saveRequests();
        renderRequests();
    }
}

// ── Init ───────────────────────────────────────────────────
updateNavbar();