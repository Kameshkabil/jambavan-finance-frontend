let transactionDateFlatpickr = null;

let isEditMode = false;
let editingTransactionId = null;

let editTransactionDate = null;

let filterState = {
    fromDate: "",
    toDate: "",
    type: "both",
    page: 1,
    limit: 10
};

let filteredPdfData = [];

let appliedFilterSummary = {
    fromDate: "",
    toDate: "",
    type: "Both"
};


let fromPicker = null;
let toPicker = null;

function initDateFilterPickers() {
    if (fromPicker || toPicker) return; // prevent re-init

    fromPicker = flatpickr("#fromDate", {
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "F j, Y",
        altInputClass: "form-control",
        maxDate: "today",
        disableMobile: true,
        allowInput: false,
        onChange: function (selectedDates) {
            if (toPicker) {
                toPicker.set("minDate", selectedDates[0]);
            }
        }
    });

    toPicker = flatpickr("#toDate", {
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "F j, Y",
        altInputClass: "form-control",
        maxDate: "today",
        disableMobile: true,
        allowInput: false
    });
}


document.getElementById("addTransactionModal")
  .addEventListener("shown.bs.modal", function () {

    // 🔥 DESTROY old instance (critical)
    if (transactionDateFlatpickr) {
        transactionDateFlatpickr.destroy();
        transactionDateFlatpickr = null;
    }

    // 🔥 RECREATE fresh instance
    transactionDateFlatpickr = flatpickr("#transactionDateInput", {
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "F j, Y",
        altInputClass: "form-control",
        maxDate: "today",
        allowInput: false,
        disableMobile: true,
    });

    // 🔥 SET DATE AFTER INIT
    if (isEditMode && editTransactionDate) {
        const d = new Date(editTransactionDate);

        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");

        transactionDateFlatpickr.setDate(`${yyyy}-${mm}-${dd}`, true);

    } else {
        transactionDateFlatpickr.setDate(new Date(), true);
    }
});


document.getElementById("addTransactionModal")
  .addEventListener("hidden.bs.modal", () => {
      isEditMode = false;
      editingTransactionId = null;
      editTransactionDate = null;

      // optional UX reset
      document.getElementById("addTransactionForm").reset();
      document.querySelector('#addTransactionModal .modal-title').innerHTML =
          '<i class="fa-solid fa-circle-plus me-2"></i> Add New Transaction';

      document.querySelector('#addTransactionModal button[type="submit"]')
          .innerText = "Save Transaction";
  });


// --- Helper Functions (Toasts, Toggles) ---
function showToast(msg, type = 'success') {
    const toastElement = type === 'success' ? document.getElementById("toast") : document.getElementById("danger-toast");
    const msgElement = type === 'success' ? document.getElementById("toastMsg") : document.getElementById("dangerToastMsg");
    
    // This makes sure success toast uses success colors, danger uses danger colors
    if (type === 'danger') {
        toastElement.classList.remove('text-bg-success');
        toastElement.classList.add('text-bg-danger');
    } else {
        toastElement.classList.add('text-bg-success');
        toastElement.classList.remove('text-bg-danger');
    }
    
    msgElement.innerText = msg;
    // Ensure Bootstrap Toast object is created and shown
    if (toastElement) new bootstrap.Toast(toastElement).show(); 
}

function showDangerToast(msg) {
    showToast(msg, 'danger');
}

function togglePasswordVisibility(fieldId, iconId) {
    const field = document.getElementById(fieldId);
    const icon = document.getElementById(iconId);
    if (field.type === "password") {
        field.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        field.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}


function closeSidebar() {
    const sidebar = document.getElementById('sidebarOffcanvas');
    // Ensure the offcanvas instance is correctly handled
    const offcanvasInstance = bootstrap.Offcanvas.getInstance(sidebar) || new bootstrap.Offcanvas(sidebar);
    offcanvasInstance.hide();
}

// In dashboard.js

function showView(viewToShowId, activeLinkId) {
    // 1. Get references to ALL main view elements using both shared classes
    const allViewsTop = document.querySelectorAll('.main-content-top-aligned-view');
    const allViewsCenter = document.querySelectorAll('.main-content-center-aligned-view');

    // 2. Hide all main content views
    allViewsTop.forEach(view => {
        view.style.display = 'none';
    });
    allViewsCenter.forEach(view => {
        view.style.display = 'none';
    });

    // 3. Show the desired view
    const viewToShow = document.getElementById(viewToShowId);
    if (viewToShow) {
        // Use 'flex' since both content containers are designed as flex containers
        viewToShow.style.display = 'flex'; 
    }

    // 4. Update active state of sidebar links 
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });

    const activeLink = document.getElementById(activeLinkId);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Sidebar functions using the new core logic
function showDashboardViewFromSidebar() {
    closeSidebar();
    setTimeout(() => {
        showView('dashboardCenterView', 'dashboardLink');
    }, 300); // Delay for smooth offcanvas close
}

function showTransactionCenterFromSidebar() {
    closeSidebar();
    setTimeout(() => {
        showView('transactionCenterView', 'transactionLink');
    }, 300); // Delay for smooth offcanvas close
}

function showDateFilterFromSidebar() {
    closeSidebar();
    setTimeout(() => {
        showView('dateFilterView', 'dateFilterLink');
        initDateFilterPickers();
    }, 300);
}



function openTransactionModalFromCenter() {
    isEditMode = false;
    editingTransactionId = null;
    editTransactionDate = null;

    document.getElementById("addTransactionForm").reset();

    document.querySelector('#addTransactionModal .modal-title').innerHTML =
        '<i class="fa-solid fa-circle-plus me-2"></i> Add New Transaction';

    document.querySelector('#addTransactionModal button[type="submit"]')
        .innerText = "Save Transaction";

    const modal = new bootstrap.Modal(
        document.getElementById('addTransactionModal')
    );
    modal.show();
}

function toggleProfileMenu() {
    const menu = document.getElementById("profileMenu");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}

document.addEventListener("click", function(e) {
    const menu = document.getElementById("profileMenu");
    const profile = document.querySelector(".profile-wrapper");
    if (profile && menu && !profile.contains(e.target)) menu.style.display = "none";
});

// --- Auth Check & Data Load ---
const tokenData = JSON.parse(localStorage.getItem("tokenData"));
if (!tokenData) {
    window.location.href = "index.html"; // Uncomment for production
}

// Data population
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profileInitial = document.getElementById('profileInitial');
const profileBig = document.getElementById('profileBig');
const welcomeText = document.getElementById('welcomeText');
const themeIcon = document.getElementById('themeIcon');

if (tokenData) {
    profileName.innerText = tokenData.firstname;
    profileEmail.innerText = tokenData.email;
    profileInitial.innerText = tokenData.firstname[0].toUpperCase();
    profileBig.innerText = tokenData.firstname[0].toUpperCase();
    
    // Dynamic welcome message
    welcomeText.innerText = "Hello, " + tokenData.firstname + " 👋";
} 

function logoutAdmin() {
    localStorage.clear();
    window.location.href = "index.html"; // Uncomment for production
}


// --- VALIDATION CORE FUNCTIONS ---
function setError(id, message) {
    const input = document.getElementById(id);
    const feedback = document.getElementById(id + '-feedback');
    input.classList.add('is-invalid');
    feedback.innerText = message;
}

function clearError(id) {
    const input = document.getElementById(id);
    const feedback = document.getElementById(id + '-feedback');
    input.classList.remove('is-invalid');
    feedback.innerText = '';
}

// --- CREATE ADMIN LOGIC (Original) ---
function validateCreateAdminForm() {
    let isValid = true;
    const formElements = ["newFirst", "newLast", "newEmail", "newMobile", "newPass"];
    formElements.forEach(clearError);

    const payload = {
        newFirst: document.getElementById("newFirst").value.trim(),
        newLast: document.getElementById("newLast").value.trim(),
        newEmail: document.getElementById("newEmail").value.trim(),
        newMobile: document.getElementById("newMobile").value.trim(),
        newPass: document.getElementById("newPass").value,
    };
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; 
    const mobileRegex = /^[0-9]{10}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]{8,}$/;

    if (!payload.newFirst) { setError("newFirst", "First name is required."); isValid = false; }
    if (!payload.newLast) { setError("newLast", "Last name is required."); isValid = false; }
    if (!payload.newEmail) { setError("newEmail", "Email address is required."); isValid = false; } 
    else if (!emailRegex.test(payload.newEmail)) { setError("newEmail", "Please enter a valid email address (e.g., user@domain.com)."); isValid = false; }
    if (!payload.newMobile) { setError("newMobile", "Mobile number is required."); isValid = false; } 
    else if (!mobileRegex.test(payload.newMobile)) { setError("newMobile", "Mobile must be exactly 10 digits."); isValid = false; }
    if (!payload.newPass) { setError("newPass", "Password is required."); isValid = false; } 
    else if (payload.newPass.length < 8) { setError("newPass", "Password must be at least 8 characters long."); isValid = false; } 
    else if (!passwordRegex.test(payload.newPass)) { setError("newPass", "Password must be strong (incl. uppercase, lowercase, number, and special character)."); isValid = false; }

    return isValid ? payload : false;
}

async function createAdmin(e) {
    e.preventDefault();
    const validatedPayload = validateCreateAdminForm();
    if (!validatedPayload) { showDangerToast("Please fix the validation errors."); return; }
    
    const payload = {
        firstname: validatedPayload.newFirst, lastname: validatedPayload.newLast, email: validatedPayload.newEmail,
        mobile: validatedPayload.newMobile, password: validatedPayload.newPass, role: "admin" 
    };

    try {
        const token = localStorage.getItem("token");
        if (!token) { 
            showDangerToast("Authentication failed. Please log in again.");
            setTimeout(() => {
                logoutAdmin();
            }, 2000);
            return; 
        }

        const res = await fetch("https://jambavan-finance-backend.onrender.com/api/user/register-admin", { 
            method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(payload)
        });

        if (res.status === 401) {
            showDangerToast("Session expired. Please log in again.");
            setTimeout(() => {
                logoutAdmin();
            }, 2000);
            return;
        }

        const data = await res.json();
        
        if (res.ok) {
            showToast(`Admin ${payload.firstname} created successfully!`);
            document.getElementById("createAdminForm").reset();
            document.querySelectorAll('#createAdminModal .form-control').forEach(el => el.classList.remove('is-invalid'));
            document.querySelectorAll('#createAdminModal .invalid-feedback').forEach(el => el.innerText = '');

            const modalElement = document.getElementById('createAdminModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
            modalInstance.hide();
        } else { showDangerToast(data.message || "Admin creation failed."); }

    } catch (err) { showDangerToast("Network error: Could not reach the server."); }
}

document.getElementById('createAdminModal').addEventListener('hidden.bs.modal', function () {
    document.getElementById("createAdminForm").reset();
    document.querySelectorAll('#createAdminModal .form-control').forEach(el => el.classList.remove('is-invalid'));
    document.querySelectorAll('#createAdminModal .invalid-feedback').forEach(el => el.innerText = '');
});


function getSelectedTransactionDateISO() {
    if (!transactionDateFlatpickr) return null;

    const date = transactionDateFlatpickr.selectedDates[0];
    if (!date) return null;

    // Create date WITHOUT timezone shift
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        12, 0, 0 // noon avoids DST / timezone issues
    ).toISOString();
}

function clearAllTransactionErrors() {
    ["transactionType", "transactionAmount", "transactionCategory", "transactionDateInput"]
        .forEach(id => {
            const input = document.getElementById(id);
            const feedback = document.getElementById(id + "-feedback");
            if (input) input.classList.remove("is-invalid");
            if (feedback) feedback.innerText = "";
        });
}
document.getElementById("addTransactionModal")
  .addEventListener("shown.bs.modal", function () {
      clearAllTransactionErrors();
  });
// --- NEW: ADD TRANSACTION LOGIC ---
function validateAddTransactionForm() {
    let isValid = true;
    const formElements = ["transactionType", "transactionAmount", "transactionCategory", "transactionDateInput"];
    formElements.forEach(clearError);

    const payload = {
        type: document.getElementById("transactionType").value,
        amount: parseFloat(document.getElementById("transactionAmount").value),
        category: document.getElementById("transactionCategory").value.trim(),
        transactionDate: getSelectedTransactionDateISO(),
        notes: document.getElementById("transactionNotes").value.trim()
    };
    
    if (!payload.type) { setError("transactionType", "Please select a transaction type."); isValid = false; }
    if (isNaN(payload.amount) || payload.amount <= 0) { setError("transactionAmount", "Amount must be a positive number."); isValid = false; }
    if (!payload.category) { setError("transactionCategory", "Category is required."); isValid = false; }
    if (!payload.transactionDate) { setError("transactionDateInput", "Transaction date is required."); isValid = false}
    return isValid ? payload : false;
}


async function addTransaction(e) {
    e.preventDefault();
    const payload = validateAddTransactionForm();
    if (!payload) {
        showDangerToast("Please correct the transaction details.");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        showDangerToast("Authentication failed. Please log in again.");
        logoutAdmin();
        return;
    }

    const url = isEditMode
        ? `https://jambavan-finance-backend.onrender.com/api/transactions/${editingTransactionId}`
        : `https://jambavan-finance-backend.onrender.com/api/transactions/add`;

    const method = isEditMode ? "PUT" : "POST";

    try {
        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.status === 401) {
            showDangerToast("Session expired. Please log in again.");
            setTimeout(() => {
                logoutAdmin();
            }, 2000);
            return;
        }

        const data = await res.json();

        if (!res.ok) {
            showDangerToast(data.message || "Transaction failed");
            return;
        }

        showToast(isEditMode ? "Transaction updated successfully" : "Transaction added successfully");

        bootstrap.Modal.getInstance(
            document.getElementById("addTransactionModal")
        ).hide();

        loadOverallSummary();
        fetchTransactions();

        isEditMode = false;
        editingTransactionId = null;

    } catch (err) {
        showDangerToast("Network error: Could not save transaction.");
    }
}


const addTxnForm = document.getElementById("addTransactionForm");
if (addTxnForm) {
  addTxnForm.addEventListener("submit", addTransaction);
}



// --- 🎉 CONFETTI ANIMATION LOGIC (Unchanged) ---
let confetti = [];
let canvas = document.getElementById("partyCanvas");
let ctx = canvas.getContext("2d");
let partyInterval = null;

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function createConfetti() {
    for (let i = 0; i < 15; i++) {
        confetti.push({
            x: Math.random() * window.innerWidth,
            y: -20,
            w: Math.random() * 8 + 4,
            h: Math.random() * 10 + 6,
            speed: Math.random() * 4 + 2,
            tilt: Math.random() * 10,
            color: `hsl(${Math.random() * 360},100%,50%)`
        });
    }
}

function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = confetti.length - 1; i >= 0; i--) {
        let p = confetti[i];
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.w, p.h);
        p.y += p.speed;
        p.x += Math.sin(p.tilt);

        if (p.y > window.innerHeight) confetti.splice(i, 1);
    }
    requestAnimationFrame(animateConfetti);
}

function startConfettiBurst(duration = 3500) {
    confetti = [];
    if (partyInterval) clearInterval(partyInterval);

    partyInterval = setInterval(createConfetti, 120);
    setTimeout(() => clearInterval(partyInterval), duration);
}

animateConfetti();


document.addEventListener("DOMContentLoaded", () => {
    // CRITICAL FIX: Ensure Dashboard is the initial active view
    showView('dashboardCenterView', 'dashboardLink');
    
    
    if (!localStorage.getItem("dashboardConfetti")) {
        startConfettiBurst(3000);
        localStorage.setItem("dashboardConfetti", "true");
    }
});


function renderRecentTransactions(transactions) {
    const empty = document.getElementById("recentEmptyState");
    const tableWrap = document.getElementById("recentTableWrapper");
    const tbody = document.getElementById("recentTransactionTbody");
    const recentAddTrans = document.getElementById("recently-added-transaction");
    recentAddTrans.style.display = "block";

    tbody.innerHTML = "";

    if (!transactions.length) {
        empty.style.display = "block";
        tableWrap.style.display = "none";
        return;
    }

    empty.style.display = "none";
    tableWrap.style.display = "block";

    transactions.forEach(tx => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${new Date(tx.transactionDate).toLocaleDateString()}</td>

            <td>
                <span class="badge ${tx.type === 'income' ? 'bg-success' : 'bg-danger'}">
                    ${tx.type}
                </span>
            </td>

            <td>${tx.category}</td>

            <td class="fw-semibold">
                ₹${Number(tx.amount).toLocaleString()}
            </td>

            <td>${tx.notes || '-'}</td>


            <td class="text-end">
                <div class="action-btn-group">
                    <button class="action-btn edit-btn"
                        onclick='openEditTransactionModal(${JSON.stringify(tx)})'>
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="action-btn delete-btn"
                        onclick="deleteTransaction('${tx._id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>

        `;

        tbody.appendChild(tr);
    });
}


function openEditTransactionModal(tx) {
     console.log("Editing TX:", tx); // ✅ DEBUG LINE
    isEditMode = true;
    editingTransactionId = tx._id;

    // Change modal title
    document.querySelector('#addTransactionModal .modal-title').innerHTML =
        '<i class="fa-solid fa-pen me-2"></i> Edit Transaction';

    // Fill form values
    document.getElementById("transactionType").value = tx.type;
    document.getElementById("transactionCategory").value = tx.category;
    document.getElementById("transactionAmount").value = tx.amount;
    document.getElementById("transactionNotes").value = tx.notes || '';

    editTransactionDate = tx.transactionDate;


    // Change button text
    document.querySelector('#addTransactionModal button[type="submit"]')
        .innerText = "Update Transaction";

    // Open modal
    const modal = new bootstrap.Modal(
        document.getElementById("addTransactionModal")
    );
    modal.show();
}

async function deleteTransaction(transactionId) {

    if (!confirm("Are you sure you want to delete this transaction?")) {
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        showDangerToast("Authentication failed");
        logoutAdmin();
        return;
    }

    try {
        const res = await fetch(
            `https://jambavan-finance-backend.onrender.com/api/transactions/${transactionId}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (res.status === 401) {
            showDangerToast("Session expired. Please log in again.");
            setTimeout(() => {
                logoutAdmin();
            }, 2000);
            return;
        }

        const data = await res.json();

        if (!res.ok) {
            showDangerToast(data.message || "Delete failed");
            return;
        }

        showToast("Transaction deleted successfully");

        loadOverallSummary();
        fetchTransactions();

    } catch (err) {
        showDangerToast("Network error");
    }
}


window.addEventListener("DOMContentLoaded", function() {
    const welcome = document.getElementById("welcomeScreen");
    const dashboard = document.getElementById("dashboardContent");

    // Check if welcome was already shown
    if (!localStorage.getItem("welcomeShown")) {
        welcome.style.display = "block";
        dashboard.style.display = "none";

        // Hide welcome after 5 seconds
        setTimeout(() => {
            welcome.style.display = "none";
            dashboard.style.display = "block";
            localStorage.setItem("welcomeShown", "true");
        }, 5000); // 5000ms = 5 seconds
    } else {
        // Already shown before
        welcome.style.display = "none";
        dashboard.style.display = "block";
    }
});

setTimeout(() => {
    welcome.style.opacity = 0;
    setTimeout(() => {
        welcome.style.display = "none";
        dashboard.style.display = "block";
    }, 500); // match the CSS transition
}, 5000);

function showTableLoader() {
    document.getElementById("dashboardTableLoader").classList.remove("d-none");
    document.getElementById("FilterTableLoader").classList.remove("d-none");
}

function hideTableLoader() {
    document.getElementById("dashboardTableLoader").classList.add("d-none");
    document.getElementById("FilterTableLoader").classList.add("d-none");
}


document.addEventListener("DOMContentLoaded", loadOverallSummary);

function loadOverallSummary() {

    const token = localStorage.getItem("token");
   fetch("https://jambavan-finance-backend.onrender.com/api/dashboard/overall-summary", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(data => {
            document.getElementById("totalIncome").innerText = `₹${data.totalIncome}`;
            document.getElementById("totalExpense").innerText = `₹${data.totalExpense}`;
            document.getElementById("netBalance").innerText = `₹${data.balance}`;
        })
        .catch(err => console.error("Dashboard summary error", err));
}

const transactionsPerPage = 10;
let currentPage = 1;
let transactions = []; // full data from backend

async function fetchTransactions() {
    showTableLoader();
    try {
        const res = await fetch('https://jambavan-finance-backend.onrender.com/api/transactions'); // replace with your backend endpoint
        if (!res.ok) throw new Error('Failed to fetch transactions');
        transactions = await res.json();

        // Sort by date descending
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        renderTransactions();
    } catch (err) {
        console.error(err);
        document.getElementById('dashboardTransactionTbody').innerHTML = `
            <tr><td colspan="6" class="text-center text-danger">Failed to load transactions</td></tr>
        `;
    }finally {
        hideTableLoader();
    }
}

const isToday = (date) => {
    const d = new Date(date);
    const today = new Date();
    return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
    );
};

function renderTransactions() {
    const tbody = document.getElementById('dashboardTransactionTbody');
    tbody.innerHTML = '';

    const start = (currentPage - 1) * transactionsPerPage;
    const end = start + transactionsPerPage;
    const pageTransactions = transactions.slice(start, end);

    if (pageTransactions.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="6" class="text-center text-muted">No transactions found</td></tr>
        `;
        return;
    }

    // Render rows
    pageTransactions.forEach( tx => {
        tbody.innerHTML += `
            <tr>
                <td>${new Date(tx.transactionDate).toLocaleDateString('en-GB')}
                ${isToday(tx.transactionDate) ? `<span class="today-badge ms-2">Today</span>` : ''}
               </td>
                <td><span class="badge ${tx.type === 'income' ? 'bg-success' : 'bg-danger'}">
                    ${tx.type}
                </span></td>
                <td>${tx.category}</td>
                <td>₹${Number(tx.amount).toLocaleString()}</td>
                <td>${tx.notes || '-'}</td>
                <td class="text-end">
                <div class="action-btn-group">
                    <button class="action-btn edit-btn"
                        onclick='openEditTransactionModal(${JSON.stringify(tx)})'>
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="action-btn delete-btn"
                        onclick="deleteTransaction('${tx._id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
            </tr>
        `;
    });

    renderPagination();
}

let filteredTransactions = [];
let filterCurrentPage = 1;
const filterPerPage = 10;

function applyDateFilter() {
    const from = document.getElementById("fromDate")?.value;
    const to = document.getElementById("toDate")?.value;
    const type = document.getElementById("filterType").value || "both";

  if (!from || !to) {
    showDangerToast("Please select both From and To dates");
    return;
}


    if (from && to && new Date(from) > new Date(to)) {
        showDangerToast("From date cannot be greater than To date");
        return;
    }

    filterState.fromDate = from || "";
    filterState.toDate = to || "";
    filterState.type = type;
    filterState.page = 1;

    fetchFilteredTransactions();
}

async function fetchFilteredTransactions() {
    showTableLoader();
    try {

        appliedFilterSummary = {
            fromDate: document.getElementById("fromDate").value,
            toDate: document.getElementById("toDate").value,
            type: document.getElementById("filterType").value || "Both"
        };

        const params = new URLSearchParams({
            // page: filterState.page,
            // limit: filterState.limit,
            type: filterState.type
        });

        if (filterState.fromDate) params.append("fromDate", filterState.fromDate);
        if (filterState.toDate) params.append("toDate", filterState.toDate);

        const res = await fetch(
            `https://jambavan-finance-backend.onrender.com/api/transactions/filter?${params.toString()}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        );

        const result = await res.json();

        if (!res.ok) {
            throw new Error(result.message || "Failed to load");
        }

        filteredPdfData = result.data
        filteredTransactions = result.data; // from backend
        filterCurrentPage = 1;
        renderFilteredTransactions(result.data);

    } catch (err) {
        console.error(err);
        showDangerToast("Failed to load filtered transactions");
    } finally {
        hideTableLoader();
    }
}



function formatDate(dateStr) {
    return dateStr
        ? new Date(dateStr).toLocaleDateString('en-GB')
        : "All";
}

function calculateTotals(data) {
    let income = 0;
    let expense = 0;

    data.forEach(tx => {
        if (tx.type === "income") income += Number(tx.amount);
        if (tx.type === "expense") expense += Number(tx.amount);
    });

    return {
        income,
        expense,
        net: income - expense
    };
}

function downloadFilteredPdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const totals = calculateTotals(filteredPdfData);

    // ===== HEADER =====
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("Jambavan Transaction Report", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.setTextColor(30);

    // Type: Both => show Income+Expense
    let typeText = appliedFilterSummary.type.toLowerCase() === "both" ? "Income + Expense" : appliedFilterSummary.type;

    doc.text(
        `Period: ${formatDate(appliedFilterSummary.fromDate)} - ${formatDate(appliedFilterSummary.toDate)}`,
        pageWidth / 2,
        28,
        { align: "center" }
    );

    doc.text(
        `Type: ${typeText.toUpperCase()}  |  Generated: ${new Date().toLocaleDateString('en-GB')}`,
        pageWidth / 2,
        34,
        { align: "center" }
    );

    // ===== DIVIDER =====
    doc.setDrawColor(180);
    doc.line(margin, 38, pageWidth - margin, 38);

    // ===== TABLE DATA =====
    const tableBody = filteredPdfData.map(tx => ([
        new Date(tx.transactionDate).toLocaleDateString('en-GB'),
        tx.type.toUpperCase(),
        tx.category,
        `Rs. ${Number(tx.amount).toLocaleString('en-IN')}`,
        tx.notes || "-"
    ]));

    // ===== TABLE =====
    doc.autoTable({
        startY: 42,
        head: [["Date", "Type", "Category", "Amount", "Notes"]],
        body: tableBody,
        theme: "grid",
        styles: {
            fontSize: 9,
            cellPadding: 4,
            textColor: [0, 0, 0],       // black text
            fillColor: [255, 255, 255], // white background
            fontStyle: "normal"
        },
        headStyles: {
            fillColor: [0, 0, 0],
            textColor: 255,
            fontStyle: "bold"
        },
        columnStyles: {
            1: { fontStyle: "bold" }, // Type column bold
            3: { halign: "right", fontStyle: "bold" } // Amount column bold & right aligned
        },
        margin: { left: margin, right: margin },
        pageBreak: 'auto'
    });

    // ===== DIVIDER BEFORE FINANCIAL SUMMARY =====
    let finalY = doc.lastAutoTable.finalY + 6;
    doc.setDrawColor(180);
    doc.line(margin, finalY, pageWidth - margin, finalY);

    finalY += 10;

    // ===== FINANCIAL SUMMARY =====
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.setTextColor(30);
    doc.text("Financial Summary", margin, finalY);

    finalY += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");

    doc.text("Total Income", margin, finalY);
    doc.setFont(undefined, "bold");
    doc.text(`Rs. ${totals.income.toLocaleString('en-IN')}`, pageWidth - margin, finalY, { align: "right" });

    finalY += 6;
    doc.setFont(undefined, "normal");
    doc.text("Total Expense", margin, finalY);
    doc.setFont(undefined, "bold");
    doc.text(`Rs. ${totals.expense.toLocaleString('en-IN')}`, pageWidth - margin, finalY, { align: "right" });

    finalY += 8;
    doc.setFont(undefined, "bold");
    doc.text("Net Balance", margin, finalY);
    doc.text(`Rs. ${totals.net.toLocaleString('en-IN')}`, pageWidth - margin, finalY, { align: "right" });

    // ===== FOOTER =====
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: "center" });
    }

    doc.save("Jambavan_Transaction_Report.pdf");
}




function renderFilteredTransactions(data) {
    const tbody = document.getElementById("filteredTransactionTbody");
    const pdfBtn = document.getElementById("downloadPdfBtn");

    tbody.innerHTML = "";

    if (!data || data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    No transactions found
                </td>
            </tr>
        `;
        return;
    }

    pdfBtn.classList.remove("d-none");

    const startIndex = (filterCurrentPage - 1) * filterPerPage;
    const endIndex = startIndex + filterPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    paginatedData.forEach(tx => {
        tbody.innerHTML += `
            <tr>
              <td>${new Date(tx.transactionDate).toLocaleDateString('en-GB')}</td>
                <td>
                    <span class="badge ${tx.type === 'income' ? 'bg-success' : 'bg-danger'}">
                        ${tx.type}
                    </span>
                </td>
                <td>${tx.category}</td>
                <td class="fw-semibold">₹${Number(tx.amount).toLocaleString()}</td>
                <td>${tx.notes || "-"}</td>
                <td class="text-end">
                <div class="action-btn-group">
                    <button class="action-btn edit-btn"
                        onclick='openEditTransactionModal(${JSON.stringify(tx)})'>
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="action-btn delete-btn"
                        onclick="deleteTransaction('${tx._id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
            </tr>
        `;
    });

     renderFilterPagination();
}

function renderFilterPagination() {
    const pagination = document.getElementById('filteredTransactionPagination');
    pagination.innerHTML = '';

    const totalPages = Math.ceil(filteredTransactions.length / filterPerPage);
    if (totalPages <= 1) return;

    // Previous
    const prevLi = document.createElement('li');
    prevLi.classList.add('page-item');
    if (filterCurrentPage === 1) prevLi.classList.add('disabled');

    const prevA = document.createElement('a');
    prevA.classList.add('page-link');
    prevA.href = "#";
    prevA.innerHTML = "&lt;";
    prevA.style.color = filterCurrentPage === 1 ? "#ccc" : "#000";
    prevA.onclick = (e) => {
        e.preventDefault();
        if (filterCurrentPage > 1) goToFilterPage(filterCurrentPage - 1);
    };
    prevLi.appendChild(prevA);
    pagination.appendChild(prevLi);

    // Current page
    const currentLi = document.createElement('li');
    currentLi.classList.add('page-item', 'active');


    const currentA = document.createElement('a');
    currentA.classList.add('page-link');
    currentA.innerText = filterCurrentPage;
    currentA.style.cursor = 'default';
    currentA.style.fontWeight = 'bold';
    currentA.style.backgroundColor = 'var(--brand)';
    currentA.style.color = 'white';
    currentA.style.borderRadius = '6px';
    currentA.style.padding = '4px 10px';
    currentLi.appendChild(currentA);
    pagination.appendChild(currentLi);

    // Next
    const nextLi = document.createElement('li');
    nextLi.classList.add('page-item');
    if (filterCurrentPage === totalPages) nextLi.classList.add('disabled');

    const nextA = document.createElement('a');
    nextA.classList.add('page-link');
    nextA.href = "#";
    nextA.innerHTML = "&gt;";
    nextA.style.color = filterCurrentPage === totalPages ? "#ccc" : "#000";
    nextA.onclick = (e) => {
        e.preventDefault();
        if (filterCurrentPage < totalPages) goToFilterPage(filterCurrentPage + 1);
    };
    nextLi.appendChild(nextA);
    pagination.appendChild(nextLi);
}


function renderPagination() {
    const pagination = document.getElementById('dashboardTransactionPagination');
    pagination.innerHTML = '';

    const totalPages = Math.ceil(transactions.length / transactionsPerPage);

    // Previous arrow
    const prevLi = document.createElement('li');
    prevLi.classList.add('page-item');
    if (currentPage === 1) prevLi.classList.add('disabled');

    const prevA = document.createElement('a');
    prevA.classList.add('page-link');
    prevA.href = "#";
    prevA.innerHTML = "&lt;"; // "<"
    prevA.style.color = currentPage === 1 ? "#ccc" : "#000";
    prevA.onclick = (e) => {
        e.preventDefault();
        if (currentPage > 1) goToPage(currentPage - 1);
    };
    prevLi.appendChild(prevA);
    pagination.appendChild(prevLi);

    // Current page number
    const currentLi = document.createElement('li');
    currentLi.classList.add('page-item');

    const currentA = document.createElement('a');
    currentA.classList.add('page-link');
    currentA.href = "#";
    currentA.innerText = currentPage;
    currentA.style.cursor = 'default';
    currentA.style.fontWeight = 'bold';
    currentA.style.backgroundColor = 'var(--brand)'; // app primary color
    currentA.style.color = 'white';
    currentA.style.borderRadius = '6px';
    currentA.style.padding = '4px 10px';
    currentA.onclick = (e) => e.preventDefault();

    currentLi.appendChild(currentA);
    pagination.appendChild(currentLi);

    // Next arrow
    const nextLi = document.createElement('li');
    nextLi.classList.add('page-item');
    if (currentPage === totalPages) nextLi.classList.add('disabled');

    const nextA = document.createElement('a');
    nextA.classList.add('page-link');
    nextA.href = "#";
    nextA.innerHTML = "&gt;"; // ">"
    nextA.style.color = currentPage === totalPages ? "#ccc" : "#000";
    nextA.onclick = (e) => {
        e.preventDefault();
        if (currentPage < totalPages) goToPage(currentPage + 1);
    };
    nextLi.appendChild(nextA);
    pagination.appendChild(nextLi);
}

function goToFilterPage(page) {
    filterCurrentPage = page;
    renderFilteredTransactions(filteredTransactions);
}


function goToPage(page) {
    currentPage = page;
    renderTransactions();
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    fetchTransactions();
});






