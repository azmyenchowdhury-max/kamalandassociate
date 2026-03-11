/**
 * Kamal & Associates - Admin Dashboard JavaScript
 * Handles authentication, data fetching, filtering, and CRUD operations
 */

// Configuration
const CONFIG = {
    supabaseUrl: window.__SUPABASE_URL__ || 'https://rujctxkklzxnogniivdj.supabase.co',
    functionUrl: window.__ADMIN_DASHBOARD_FUNCTION_URL__ || 'https://rujctxkklzxnogniivdj.supabase.co/functions/v1/admin-dashboard'
};

// State Management
const state = {
    isAuthenticated: false,
    adminKey: '',
    currentPage: 'dashboard',
    stats: {},
    consultations: [],
    payments: [],
    users: [],
    analytics: {},
    filters: {
        consultations: {},
        payments: {},
        users: {}
    }
};

// DOM Elements
const elements = {
    loginScreen: document.getElementById('loginScreen'),
    dashboard: document.getElementById('dashboard'),
    loginForm: document.getElementById('loginForm'),
    loginError: document.getElementById('loginError'),
    adminKeyInput: document.getElementById('adminKey'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    toastContainer: document.getElementById('toastContainer'),
    modalOverlay: document.getElementById('modalOverlay'),
    modalTitle: document.getElementById('modalTitle'),
    modalBody: document.getElementById('modalBody'),
    refreshBtn: document.getElementById('refreshBtn'),
    currentDate: document.getElementById('currentDate')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check for stored session
    const storedKey = sessionStorage.getItem('adminKey');
    if (storedKey) {
        state.adminKey = storedKey;
        authenticate(storedKey);
    }

    // Set current date
    if (elements.currentDate) {
        elements.currentDate.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Event Listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Login Form
    elements.loginForm?.addEventListener('submit', handleLogin);

    // Navigation
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            navigateTo(page);
        });
    });

    // Refresh Button
    elements.refreshBtn?.addEventListener('click', refreshData);

    // Logout Button
    document.getElementById('logoutBtn')?.addEventListener('click', logout);

    // Modal Close
    document.getElementById('modalClose')?.addEventListener('click', closeModal);
    elements.modalOverlay?.addEventListener('click', (e) => {
        if (e.target === elements.modalOverlay) closeModal();
    });

    // Mobile Toggle
    document.getElementById('mobileToggle')?.addEventListener('click', toggleSidebar);
    document.getElementById('sidebarOverlay')?.addEventListener('click', toggleSidebar);

    // Filter Forms
    setupFilterListeners();

    // Export Buttons
    document.getElementById('exportConsultations')?.addEventListener('click', () => exportToCSV('consultations'));
    document.getElementById('exportPayments')?.addEventListener('click', () => exportToCSV('payments'));
    document.getElementById('exportUsers')?.addEventListener('click', () => exportToCSV('users'));
}

function setupFilterListeners() {
    // Consultation Filters
    const consultationFilters = ['statusFilter', 'typeFilter', 'practiceAreaFilter', 'dateFromFilter', 'dateToFilter', 'searchFilter'];
    consultationFilters.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', () => applyConsultationFilters());
            if (el.type === 'text') {
                el.addEventListener('keyup', debounce(() => applyConsultationFilters(), 300));
            }
        }
    });

    // Payment Filters
    const paymentFilters = ['paymentStatusFilter', 'paymentMethodFilter', 'paymentDateFromFilter', 'paymentDateToFilter'];
    paymentFilters.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', () => applyPaymentFilters());
        }
    });

    // User Filters
    const userFilters = ['userFreeFilter', 'userSearchFilter'];
    userFilters.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', () => applyUserFilters());
            if (el.type === 'text') {
                el.addEventListener('keyup', debounce(() => applyUserFilters(), 300));
            }
        }
    });
}

// Authentication
async function handleLogin(e) {
    e.preventDefault();
    const adminKey = elements.adminKeyInput.value.trim();
    
    if (!adminKey) {
        showLoginError('Please enter the admin key');
        return;
    }

    showLoading(true);
    await authenticate(adminKey);
    showLoading(false);
}

async function authenticate(adminKey) {
    try {
        const response = await apiCall('get-stats', {}, adminKey);
        
        if (response.success) {
            state.isAuthenticated = true;
            state.adminKey = adminKey;
            sessionStorage.setItem('adminKey', adminKey);
            
            elements.loginScreen.style.display = 'none';
            elements.dashboard.style.display = 'flex';
            
            state.stats = response.stats;
            renderStats();
            
            // Load all data
            await Promise.all([
                loadConsultations(),
                loadPayments(),
                loadUsers(),
                loadAnalytics()
            ]);
            
            showToast('Welcome to the Admin Dashboard', 'success');
        } else {
            showLoginError('Invalid admin key');
        }
    } catch (error) {
        console.error('Auth error:', error);
        showLoginError('Authentication failed. Please try again.');
    }
}

function logout() {
    state.isAuthenticated = false;
    state.adminKey = '';
    sessionStorage.removeItem('adminKey');
    
    elements.dashboard.style.display = 'none';
    elements.loginScreen.style.display = 'flex';
    elements.adminKeyInput.value = '';
    
    showToast('Logged out successfully', 'info');
}

function showLoginError(message) {
    elements.loginError.textContent = message;
    elements.loginError.classList.add('show');
    setTimeout(() => elements.loginError.classList.remove('show'), 5000);
}

// API Calls
async function apiCall(action, filters = {}, adminKey = null) {
    const response = await fetch(CONFIG.functionUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action,
            filters,
            adminKey: adminKey || state.adminKey
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API call failed');
    }

    return response.json();
}

// Data Loading
async function loadConsultations() {
    try {
        const response = await apiCall('get-consultations', state.filters.consultations);
        if (response.success) {
            state.consultations = response.consultations;
            renderConsultationsTable();
        }
    } catch (error) {
        console.error('Error loading consultations:', error);
        showToast('Failed to load consultations', 'error');
    }
}

async function loadPayments() {
    try {
        const response = await apiCall('get-payments', state.filters.payments);
        if (response.success) {
            state.payments = response.payments;
            renderPaymentsTable();
        }
    } catch (error) {
        console.error('Error loading payments:', error);
        showToast('Failed to load payments', 'error');
    }
}

async function loadUsers() {
    try {
        const response = await apiCall('get-users', state.filters.users);
        if (response.success) {
            state.users = response.users;
            renderUsersTable();
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showToast('Failed to load users', 'error');
    }
}

async function loadAnalytics() {
    try {
        const response = await apiCall('get-analytics', { days: 30 });
        if (response.success) {
            state.analytics = response.analytics;
            renderCharts();
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

async function loadStats() {
    try {
        const response = await apiCall('get-stats');
        if (response.success) {
            state.stats = response.stats;
            renderStats();
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function refreshData() {
    elements.refreshBtn.classList.add('loading');
    showLoading(true);
    
    try {
        await Promise.all([
            loadStats(),
            loadConsultations(),
            loadPayments(),
            loadUsers(),
            loadAnalytics()
        ]);
        showToast('Data refreshed successfully', 'success');
    } catch (error) {
        showToast('Failed to refresh data', 'error');
    }
    
    showLoading(false);
    elements.refreshBtn.classList.remove('loading');
}

// Rendering Functions
function renderStats() {
    const stats = state.stats;
    
    document.getElementById('totalConsultations').textContent = stats.totalConsultations || 0;
    document.getElementById('freeConsultations').textContent = stats.freeConsultations || 0;
    document.getElementById('paidConsultations').textContent = stats.paidConsultations || 0;
    document.getElementById('pendingConsultations').textContent = stats.pendingConsultations || 0;
    document.getElementById('confirmedConsultations').textContent = stats.confirmedConsultations || 0;
    document.getElementById('completedConsultations').textContent = stats.completedConsultations || 0;
    document.getElementById('totalRevenue').textContent = formatCurrency(stats.totalRevenue || 0);
    document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
}

function renderConsultationsTable() {
    const tbody = document.getElementById('consultationsTableBody');
    if (!tbody) return;

    if (state.consultations.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3>No consultations found</h3>
                    <p>Try adjusting your filters</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = state.consultations.map(c => `
        <tr>
            <td>
                <div class="name-cell">${escapeHtml(c.first_name)} ${escapeHtml(c.last_name)}</div>
                <div class="email-cell">${escapeHtml(c.email)}</div>
            </td>
            <td>${escapeHtml(c.phone || '-')}</td>
            <td>${escapeHtml(c.practice_area || '-')}</td>
            <td><span class="status-badge ${c.is_free ? 'free' : 'paid'}">${c.is_free ? 'Free' : 'Paid'}</span></td>
            <td><span class="status-badge ${c.status}">${c.status}</span></td>
            <td>${formatDate(c.created_at)}</td>
            <td>${c.preferred_date ? formatDate(c.preferred_date) : '-'}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn view" onclick="viewConsultation('${c.id}')" title="View Details">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                    <button class="action-btn edit" onclick="editConsultationStatus('${c.id}')" title="Update Status">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderPaymentsTable() {
    const tbody = document.getElementById('paymentsTableBody');
    if (!tbody) return;

    if (state.payments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <h3>No payments found</h3>
                    <p>Try adjusting your filters</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = state.payments.map(p => `
        <tr>
            <td>${escapeHtml(p.transaction_id || '-')}</td>
            <td>
                ${p.consultations ? `
                    <div class="name-cell">${escapeHtml(p.consultations.first_name)} ${escapeHtml(p.consultations.last_name)}</div>
                    <div class="email-cell">${escapeHtml(p.consultations.email)}</div>
                ` : '-'}
            </td>
            <td>${formatCurrency(p.amount)}</td>
            <td>${escapeHtml(p.payment_method || '-')}</td>
            <td><span class="status-badge ${p.status}">${p.status}</span></td>
            <td>${formatDate(p.created_at)}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn view" onclick="viewPayment('${p.id}')" title="View Details">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    if (state.users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <h3>No users found</h3>
                    <p>Try adjusting your filters</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = state.users.map(u => `
        <tr>
            <td>
                <div class="name-cell">${escapeHtml(u.first_name || '')} ${escapeHtml(u.last_name || '')}</div>
                <div class="email-cell">${escapeHtml(u.email)}</div>
            </td>
            <td>${escapeHtml(u.phone || '-')}</td>
            <td><span class="status-badge ${u.free_consultation_used ? 'paid' : 'free'}">${u.free_consultation_used ? 'Used' : 'Available'}</span></td>
            <td>${u.total_consultations || 0}</td>
            <td>${formatCurrency(u.total_paid || 0)}</td>
            <td>${formatDate(u.created_at)}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn view" onclick="viewUser('${u.id}')" title="View Details">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderCharts() {
    const analytics = state.analytics;
    if (!analytics.dateLabels) return;

    // Consultations Trend Chart
    const consultationsCtx = document.getElementById('consultationsChart')?.getContext('2d');
    if (consultationsCtx && window.Chart) {
        if (window.consultationsChartInstance) {
            window.consultationsChartInstance.destroy();
        }
        
        window.consultationsChartInstance = new Chart(consultationsCtx, {
            type: 'line',
            data: {
                labels: analytics.dateLabels.map(d => formatDateShort(d)),
                datasets: [
                    {
                        label: 'Total',
                        data: analytics.consultationData,
                        borderColor: '#1a365d',
                        backgroundColor: 'rgba(26, 54, 93, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Free',
                        data: analytics.freeData,
                        borderColor: '#805ad5',
                        backgroundColor: 'transparent',
                        tension: 0.4
                    },
                    {
                        label: 'Paid',
                        data: analytics.paidData,
                        borderColor: '#38a169',
                        backgroundColor: 'transparent',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
    if (revenueCtx && window.Chart) {
        if (window.revenueChartInstance) {
            window.revenueChartInstance.destroy();
        }
        
        window.revenueChartInstance = new Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: analytics.dateLabels.map(d => formatDateShort(d)),
                datasets: [{
                    label: 'Revenue (BDT)',
                    data: analytics.revenueData,
                    backgroundColor: '#c9a227',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => '৳' + value.toLocaleString()
                        }
                    }
                }
            }
        });
    }

    // Status Distribution Chart
    const statusCtx = document.getElementById('statusChart')?.getContext('2d');
    if (statusCtx && window.Chart && analytics.consultationsByStatus) {
        if (window.statusChartInstance) {
            window.statusChartInstance.destroy();
        }
        
        const statusColors = {
            pending: '#d69e2e',
            confirmed: '#3182ce',
            completed: '#38a169',
            cancelled: '#e53e3e'
        };
        
        const statusLabels = Object.keys(analytics.consultationsByStatus);
        const statusData = Object.values(analytics.consultationsByStatus);
        
        window.statusChartInstance = new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: statusLabels.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
                datasets: [{
                    data: statusData,
                    backgroundColor: statusLabels.map(s => statusColors[s] || '#718096')
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    // Practice Area Chart
    const practiceCtx = document.getElementById('practiceAreaChart')?.getContext('2d');
    if (practiceCtx && window.Chart && analytics.consultationsByPracticeArea) {
        if (window.practiceChartInstance) {
            window.practiceChartInstance.destroy();
        }
        
        const practiceLabels = Object.keys(analytics.consultationsByPracticeArea);
        const practiceData = Object.values(analytics.consultationsByPracticeArea);
        
        window.practiceChartInstance = new Chart(practiceCtx, {
            type: 'bar',
            data: {
                labels: practiceLabels,
                datasets: [{
                    label: 'Consultations',
                    data: practiceData,
                    backgroundColor: '#2c5282',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
}

// Filter Functions
function applyConsultationFilters() {
    state.filters.consultations = {
        status: document.getElementById('statusFilter')?.value || 'all',
        isFree: document.getElementById('typeFilter')?.value || 'all',
        practiceArea: document.getElementById('practiceAreaFilter')?.value || 'all',
        dateFrom: document.getElementById('dateFromFilter')?.value || '',
        dateTo: document.getElementById('dateToFilter')?.value || '',
        search: document.getElementById('searchFilter')?.value || ''
    };
    loadConsultations();
}

function applyPaymentFilters() {
    state.filters.payments = {
        status: document.getElementById('paymentStatusFilter')?.value || 'all',
        paymentMethod: document.getElementById('paymentMethodFilter')?.value || 'all',
        dateFrom: document.getElementById('paymentDateFromFilter')?.value || '',
        dateTo: document.getElementById('paymentDateToFilter')?.value || ''
    };
    loadPayments();
}

function applyUserFilters() {
    state.filters.users = {
        freeConsultationUsed: document.getElementById('userFreeFilter')?.value || 'all',
        search: document.getElementById('userSearchFilter')?.value || ''
    };
    loadUsers();
}

// Navigation
function navigateTo(page) {
    state.currentPage = page;
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });
    
    // Update page sections
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.toggle('active', section.id === `${page}Section`);
    });
    
    // Update header title
    const titles = {
        dashboard: 'Dashboard Overview',
        consultations: 'Manage Consultations',
        payments: 'Payment Records',
        users: 'User Management',
        analytics: 'Analytics & Reports'
    };
    
    document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';
    
    // Close mobile sidebar
    document.getElementById('adminSidebar')?.classList.remove('open');
    document.getElementById('sidebarOverlay')?.classList.remove('show');
}

function toggleSidebar() {
    document.getElementById('adminSidebar')?.classList.toggle('open');
    document.getElementById('sidebarOverlay')?.classList.toggle('show');
}

// Modal Functions
async function viewConsultation(id) {
    showLoading(true);
    try {
        const response = await apiCall('get-consultation-details', { consultationId: id });
        if (response.success) {
            const c = response.consultation;
            const payments = response.payments;
            
            elements.modalTitle.textContent = 'Consultation Details';
            elements.modalBody.innerHTML = `
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Name</label>
                        <p>${escapeHtml(c.first_name)} ${escapeHtml(c.last_name)}</p>
                    </div>
                    <div class="detail-item">
                        <label>Email</label>
                        <p>${escapeHtml(c.email)}</p>
                    </div>
                    <div class="detail-item">
                        <label>Phone</label>
                        <p>${escapeHtml(c.phone || '-')}</p>
                    </div>
                    <div class="detail-item">
                        <label>Practice Area</label>
                        <p>${escapeHtml(c.practice_area || '-')}</p>
                    </div>
                    <div class="detail-item">
                        <label>Type</label>
                        <p><span class="status-badge ${c.is_free ? 'free' : 'paid'}">${c.is_free ? 'Free' : 'Paid'}</span></p>
                    </div>
                    <div class="detail-item">
                        <label>Status</label>
                        <p><span class="status-badge ${c.status}">${c.status}</span></p>
                    </div>
                    <div class="detail-item">
                        <label>Preferred Date</label>
                        <p>${c.preferred_date ? formatDate(c.preferred_date) : '-'}</p>
                    </div>
                    <div class="detail-item">
                        <label>Preferred Time</label>
                        <p>${escapeHtml(c.preferred_time || '-')}</p>
                    </div>
                    <div class="detail-item">
                        <label>Consultation Type</label>
                        <p>${escapeHtml(c.consultation_type || '-')}</p>
                    </div>
                    <div class="detail-item">
                        <label>Urgency</label>
                        <p>${escapeHtml(c.urgency || '-')}</p>
                    </div>
                    <div class="detail-item full-width">
                        <label>Message</label>
                        <p>${escapeHtml(c.message || '-')}</p>
                    </div>
                    <div class="detail-item full-width">
                        <label>Admin Notes</label>
                        <p>${escapeHtml(c.admin_notes || 'No notes')}</p>
                    </div>
                    <div class="detail-item">
                        <label>Created At</label>
                        <p>${formatDateTime(c.created_at)}</p>
                    </div>
                    <div class="detail-item">
                        <label>Updated At</label>
                        <p>${formatDateTime(c.updated_at)}</p>
                    </div>
                </div>
                ${payments.length > 0 ? `
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--admin-border);">
                        <h4 style="margin-bottom: 12px; font-size: 14px; font-weight: 600;">Related Payments</h4>
                        <table class="data-table" style="font-size: 13px;">
                            <thead>
                                <tr>
                                    <th>Transaction ID</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${payments.map(p => `
                                    <tr>
                                        <td>${escapeHtml(p.transaction_id || '-')}</td>
                                        <td>${formatCurrency(p.amount)}</td>
                                        <td>${escapeHtml(p.payment_method || '-')}</td>
                                        <td><span class="status-badge ${p.status}">${p.status}</span></td>
                                        <td>${formatDate(p.created_at)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
            `;
            openModal();
        }
    } catch (error) {
        showToast('Failed to load consultation details', 'error');
    }
    showLoading(false);
}

function editConsultationStatus(id) {
    const consultation = state.consultations.find(c => c.id === id);
    if (!consultation) return;
    
    elements.modalTitle.textContent = 'Update Consultation Status';
    elements.modalBody.innerHTML = `
        <div class="detail-grid">
            <div class="detail-item">
                <label>Name</label>
                <p>${escapeHtml(consultation.first_name)} ${escapeHtml(consultation.last_name)}</p>
            </div>
            <div class="detail-item">
                <label>Current Status</label>
                <p><span class="status-badge ${consultation.status}">${consultation.status}</span></p>
            </div>
        </div>
        <div class="status-form">
            <h4>Select New Status</h4>
            <div class="status-options" id="statusOptions">
                <button type="button" class="status-option pending ${consultation.status === 'pending' ? 'selected' : ''}" data-status="pending">Pending</button>
                <button type="button" class="status-option confirmed ${consultation.status === 'confirmed' ? 'selected' : ''}" data-status="confirmed">Confirmed</button>
                <button type="button" class="status-option completed ${consultation.status === 'completed' ? 'selected' : ''}" data-status="completed">Completed</button>
                <button type="button" class="status-option cancelled ${consultation.status === 'cancelled' ? 'selected' : ''}" data-status="cancelled">Cancelled</button>
            </div>
            <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px;">Admin Notes</label>
            <textarea class="notes-input" id="adminNotes" placeholder="Add notes about this status change...">${escapeHtml(consultation.admin_notes || '')}</textarea>
            <div style="margin-top: 16px; display: flex; gap: 12px; justify-content: flex-end;">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="saveConsultationStatus('${id}')">Save Changes</button>
            </div>
        </div>
    `;
    
    // Add click handlers for status options
    document.querySelectorAll('.status-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.status-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });
    
    openModal();
}

async function saveConsultationStatus(id) {
    const selectedStatus = document.querySelector('.status-option.selected')?.dataset.status;
    const notes = document.getElementById('adminNotes')?.value || '';
    
    if (!selectedStatus) {
        showToast('Please select a status', 'error');
        return;
    }
    
    showLoading(true);
    try {
        const response = await apiCall('update-consultation-status', {
            consultationId: id,
            newStatus: selectedStatus,
            notes: notes
        });
        
        if (response.success) {
            showToast('Status updated successfully', 'success');
            closeModal();
            await Promise.all([loadConsultations(), loadStats()]);
        }
    } catch (error) {
        showToast('Failed to update status', 'error');
    }
    showLoading(false);
}

function viewPayment(id) {
    const payment = state.payments.find(p => p.id === id);
    if (!payment) return;
    
    elements.modalTitle.textContent = 'Payment Details';
    elements.modalBody.innerHTML = `
        <div class="detail-grid">
            <div class="detail-item">
                <label>Transaction ID</label>
                <p>${escapeHtml(payment.transaction_id || '-')}</p>
            </div>
            <div class="detail-item">
                <label>Amount</label>
                <p style="font-size: 20px; font-weight: 700; color: var(--admin-success);">${formatCurrency(payment.amount)}</p>
            </div>
            <div class="detail-item">
                <label>Payment Method</label>
                <p>${escapeHtml(payment.payment_method || '-')}</p>
            </div>
            <div class="detail-item">
                <label>Status</label>
                <p><span class="status-badge ${payment.status}">${payment.status}</span></p>
            </div>
            ${payment.consultations ? `
                <div class="detail-item">
                    <label>Client Name</label>
                    <p>${escapeHtml(payment.consultations.first_name)} ${escapeHtml(payment.consultations.last_name)}</p>
                </div>
                <div class="detail-item">
                    <label>Client Email</label>
                    <p>${escapeHtml(payment.consultations.email)}</p>
                </div>
                <div class="detail-item">
                    <label>Client Phone</label>
                    <p>${escapeHtml(payment.consultations.phone || '-')}</p>
                </div>
                <div class="detail-item">
                    <label>Practice Area</label>
                    <p>${escapeHtml(payment.consultations.practice_area || '-')}</p>
                </div>
            ` : ''}
            <div class="detail-item">
                <label>Created At</label>
                <p>${formatDateTime(payment.created_at)}</p>
            </div>
            <div class="detail-item">
                <label>Updated At</label>
                <p>${formatDateTime(payment.updated_at)}</p>
            </div>
        </div>
    `;
    openModal();
}

function viewUser(id) {
    const user = state.users.find(u => u.id === id);
    if (!user) return;
    
    elements.modalTitle.textContent = 'User Details';
    elements.modalBody.innerHTML = `
        <div class="detail-grid">
            <div class="detail-item">
                <label>Name</label>
                <p>${escapeHtml(user.first_name || '')} ${escapeHtml(user.last_name || '')}</p>
            </div>
            <div class="detail-item">
                <label>Email</label>
                <p>${escapeHtml(user.email)}</p>
            </div>
            <div class="detail-item">
                <label>Phone</label>
                <p>${escapeHtml(user.phone || '-')}</p>
            </div>
            <div class="detail-item">
                <label>Free Consultation</label>
                <p><span class="status-badge ${user.free_consultation_used ? 'paid' : 'free'}">${user.free_consultation_used ? 'Used' : 'Available'}</span></p>
            </div>
            <div class="detail-item">
                <label>Total Consultations</label>
                <p style="font-size: 20px; font-weight: 700;">${user.total_consultations || 0}</p>
            </div>
            <div class="detail-item">
                <label>Total Paid</label>
                <p style="font-size: 20px; font-weight: 700; color: var(--admin-success);">${formatCurrency(user.total_paid || 0)}</p>
            </div>
            <div class="detail-item">
                <label>First Visit</label>
                <p>${formatDateTime(user.created_at)}</p>
            </div>
            <div class="detail-item">
                <label>Last Updated</label>
                <p>${formatDateTime(user.updated_at)}</p>
            </div>
        </div>
    `;
    openModal();
}

function openModal() {
    elements.modalOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    elements.modalOverlay.classList.remove('show');
    document.body.style.overflow = '';
}

// Export Functions
function exportToCSV(type) {
    let data, filename, headers;
    
    switch (type) {
        case 'consultations':
            data = state.consultations;
            filename = `consultations_${formatDateForFile(new Date())}.csv`;
            headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Practice Area', 'Type', 'Status', 'Preferred Date', 'Preferred Time', 'Message', 'Created At'];
            break;
        case 'payments':
            data = state.payments;
            filename = `payments_${formatDateForFile(new Date())}.csv`;
            headers = ['ID', 'Transaction ID', 'Amount', 'Payment Method', 'Status', 'Client Name', 'Client Email', 'Created At'];
            break;
        case 'users':
            data = state.users;
            filename = `users_${formatDateForFile(new Date())}.csv`;
            headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Free Consultation Used', 'Total Consultations', 'Total Paid', 'Created At'];
            break;
        default:
            return;
    }
    
    if (data.length === 0) {
        showToast('No data to export', 'error');
        return;
    }
    
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(item => {
        let row;
        switch (type) {
            case 'consultations':
                row = [
                    item.id,
                    escapeCSV(item.first_name),
                    escapeCSV(item.last_name),
                    escapeCSV(item.email),
                    escapeCSV(item.phone),
                    escapeCSV(item.practice_area),
                    item.is_free ? 'Free' : 'Paid',
                    item.status,
                    item.preferred_date || '',
                    escapeCSV(item.preferred_time),
                    escapeCSV(item.message),
                    item.created_at
                ];
                break;
            case 'payments':
                row = [
                    item.id,
                    escapeCSV(item.transaction_id),
                    item.amount,
                    escapeCSV(item.payment_method),
                    item.status,
                    item.consultations ? escapeCSV(`${item.consultations.first_name} ${item.consultations.last_name}`) : '',
                    item.consultations ? escapeCSV(item.consultations.email) : '',
                    item.created_at
                ];
                break;
            case 'users':
                row = [
                    item.id,
                    escapeCSV(item.first_name),
                    escapeCSV(item.last_name),
                    escapeCSV(item.email),
                    escapeCSV(item.phone),
                    item.free_consultation_used ? 'Yes' : 'No',
                    item.total_consultations || 0,
                    item.total_paid || 0,
                    item.created_at
                ];
                break;
        }
        csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    
    showToast(`Exported ${data.length} records to ${filename}`, 'success');
}

// Utility Functions
function showLoading(show) {
    elements.loadingOverlay.classList.toggle('show', show);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>',
        error: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>',
        info: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
    };
    
    toast.innerHTML = `${icons[type] || icons.info}<p>${escapeHtml(message)}</p>`;
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function formatCurrency(amount) {
    return '৳' + parseFloat(amount || 0).toLocaleString('en-BD');
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateShort(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateForFile(date) {
    return date.toISOString().split('T')[0];
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function escapeCSV(str) {
    if (!str) return '';
    str = String(str);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Make functions globally available
window.viewConsultation = viewConsultation;
window.editConsultationStatus = editConsultationStatus;
window.saveConsultationStatus = saveConsultationStatus;
window.viewPayment = viewPayment;
window.viewUser = viewUser;
window.closeModal = closeModal;
