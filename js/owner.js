// ============================================
// OWNER PANEL LOGIC
// ============================================

let currentUserId = null;
let currentPage = 'dashboard';
let gmailList = [];
let withdrawList = [];
let userList = [];
let selectedGmailId = null;
let selectedWithdrawId = null;

// Initialize Owner Panel
async function initOwner() {
  try {
    const user = await checkOwnerRole();
    if (!user) return;

    currentUserId = user.uid;
    
    // Load initial data
    await loadDashboard();
    
    // Setup event listeners
    setupEventListeners();
  } catch (error) {
    console.error('Owner initialization error:', error);
    showToast('Error initializing panel', 'error');
  }
}

// Setup Event Listeners
function setupEventListeners() {
  document.getElementById('gmailSearch')?.addEventListener('keyup', debounce(filterGmailData, 300));
  document.getElementById('gmailFilter')?.addEventListener('change', filterGmailData);
  document.getElementById('userSearch')?.addEventListener('keyup', debounce(filterUserData, 300));
}

// Switch Between Pages
async function switchPage(page) {
  currentPage = page;
  
  // Update active sidebar item
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`[data-page="${page}"]`).classList.add('active');
  
  // Hide all pages
  document.getElementById('dashboardPage').style.display = 'none';
  document.getElementById('gmailPage').style.display = 'none';
  document.getElementById('withdrawPage').style.display = 'none';
  document.getElementById('usersPage').style.display = 'none';
  document.getElementById('settingsPage').style.display = 'none';
  
  // Update header
  const titles = {
    dashboard: { title: 'Dashboard', subtitle: 'Kelola sistem Gmail Store' },
    gmail: { title: 'Data Gmail', subtitle: 'Kelola semua Gmail dari user' },
    withdraw: { title: 'Penarikan', subtitle: 'Proses permintaan penarikan' },
    users: { title: 'User', subtitle: 'Kelola daftar user' },
    settings: { title: 'Pengaturan', subtitle: 'Konfigurasi sistem' }
  };
  
  document.getElementById('pageTitle').textContent = titles[page].title;
  document.getElementById('pageSubtitle').textContent = titles[page].subtitle;
  
  // Load page data
  switch(page) {
    case 'dashboard':
      document.getElementById('dashboardPage').style.display = 'block';
      await loadDashboard();
      break;
    case 'gmail':
      document.getElementById('gmailPage').style.display = 'block';
      await loadGmailData();
      break;
    case 'withdraw':
      document.getElementById('withdrawPage').style.display = 'block';
      await loadWithdrawData();
      break;
    case 'users':
      document.getElementById('usersPage').style.display = 'block';
      await loadUserData();
      break;
    case 'settings':
      document.getElementById('settingsPage').style.display = 'block';
      await loadSettings();
      break;
  }
}

// Load Dashboard
async function loadDashboard() {
  try {
    const stats = await getStatistics(currentUserId, true);
    
    document.getElementById('totalUsers').textContent = stats.totalUser;
    document.getElementById('totalGmails').textContent = stats.totalGmail;
    document.getElementById('pendingGmails').textContent = stats.pending;
    document.getElementById('acceptedGmails').textContent = stats.diterima;
    document.getElementById('rejectedGmails').textContent = stats.ditolak;
    document.getElementById('totalRevenue').textContent = formatRupiah(stats.pendapatan);
    document.getElementById('withdrawPending').textContent = stats.withdrawPending;
    document.getElementById('withdrawCompleted').textContent = stats.withdrawSelesai;
  } catch (error) {
    console.error('Error loading dashboard:', error);
    showToast('Error loading dashboard', 'error');
  }
}

// Load Gmail Data
async function loadGmailData() {
  try {
    const snapshot = await getAllGmail();
    gmailList = [];
    
    snapshot.forEach(doc => {
      gmailList.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    filterGmailData();
  } catch (error) {
    console.error('Error loading gmail data:', error);
    showToast('Error loading gmail data', 'error');
  }
}

// Filter Gmail Data
function filterGmailData() {
  const searchText = document.getElementById('gmailSearch')?.value.toLowerCase() || '';
  const statusFilter = document.getElementById('gmailFilter')?.value || '';
  
  let filtered = gmailList.filter(item => {
    const matchSearch = item.gmail.toLowerCase().includes(searchText) || 
                       item.username.toLowerCase().includes(searchText);
    const matchStatus = !statusFilter || item.status === statusFilter;
    return matchSearch && matchStatus;
  });
  
  renderGmailTable(filtered);
}

// Render Gmail Table
function renderGmailTable(data) {
  const table = document.getElementById('gmailTable');
  
  if (data.length === 0) {
    table.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">Tidak ada data</td></tr>';
    return;
  }
  
  table.innerHTML = data.map(item => {
    const isApproved = item.status !== 'pending';
    return `
      <tr>
        <td>${item.username}</td>
        <td><small>${truncateText(item.emailUser, 20)}</small></td>
        <td><code style="background: rgba(0,0,0,0.05); padding: 0.25rem 0.5rem; border-radius: 4px;">${item.gmail}</code></td>
        <td><small>••••••••</small></td>
        <td>${formatRupiah(item.price)}</td>
        <td><span class="badge ${getBadgeClass(item.status)}">${getBadgeLabel(item.status)}</span></td>
        <td><small>${formatDateShort(item.createdAt)}</small></td>
        <td>
          ${isApproved ? '<small style="color: #999;">-</small>' : `
            <div class="table-actions">
              <button class="action-btn action-btn-success" onclick="openGmailAction('${item.id}', 'diterima')">✔</button>
              <button class="action-btn action-btn-danger" onclick="openGmailAction('${item.id}', 'ditolak')">❌</button>
            </div>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

// Open Gmail Action Modal
function openGmailAction(docId, action) {
  selectedGmailId = docId;
  document.getElementById('actionStatus').value = action;
  
  if (action === 'diterima') {
    document.querySelector('#gmailActionForm .form-group:last-child').style.display = 'none';
  } else {
    document.querySelector('#gmailActionForm .form-group:last-child').style.display = 'block';
  }
  
  showModal('gmailActionModal');
}

// Submit Gmail Action
async function submitGmailAction() {
  const status = document.getElementById('actionStatus').value;
  const reason = document.getElementById('actionReason').value.trim();
  
  if (!status) {
    showToast('Pilih status terlebih dahulu', 'error');
    return;
  }
  
  if (status === 'ditolak' && !reason) {
    showToast('Berikan alasan penolakan', 'error');
    return;
  }
  
  try {
    // Update gmail status
    await updateGmailStatus(selectedGmailId, status, reason);
    
    // If accepted, update user balance
    if (status === 'diterima') {
      const gmail = gmailList.find(g => g.id === selectedGmailId);
      if (gmail) {
        const userData = await getUserData(gmail.uid);
        const newBalance = (userData.data().saldo || 0) + gmail.price;
        await updateUserBalance(gmail.uid, newBalance);
      }
    }
    
    closeModal('gmailActionModal');
    await loadGmailData();
    showToast('Status berhasil diperbarui!', 'success');
  } catch (error) {
    showToast('Error: ' + error.message, 'error');
  }
}

// Export Gmail Data
async function exportGmailData() {
  const data = gmailList.map(item => ({
    username: item.username,
    email_user: item.emailUser,
    gmail: item.gmail,
    price: item.price,
    status: item.status,
    date: formatDate(item.createdAt)
  }));
  
  exportToCSV(data, 'gmail-data.csv');
  showToast('Data berhasil diekspor!', 'success');
}

// Load Withdraw Data
async function loadWithdrawData() {
  try {
    const snapshot = await getAllWithdraw();
    withdrawList = [];
    
    snapshot.forEach(doc => {
      withdrawList.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    renderWithdrawTable(withdrawList);
  } catch (error) {
    console.error('Error loading withdraw data:', error);
    showToast('Error loading withdraw data', 'error');
  }
}

// Render Withdraw Table
function renderWithdrawTable(data) {
  const table = document.getElementById('withdrawTable');
  
  if (data.length === 0) {
    table.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Tidak ada permintaan</td></tr>';
    return;
  }
  
  table.innerHTML = data.map(item => {
    const isPending = item.status === 'pending';
    return `
      <tr>
        <td>${item.username}</td>
        <td>${item.namaDana}</td>
        <td><code>${item.nomorDana}</code></td>
        <td>${formatRupiah(item.nominal)}</td>
        <td><span class="badge ${getBadgeClass(item.status)}">${getBadgeLabel(item.status)}</span></td>
        <td><small>${formatDateShort(item.createdAt)}</small></td>
        <td>
          ${isPending ? `
            <div class="table-actions">
              <button class="action-btn action-btn-success" onclick="openWithdrawAction('${item.id}', 'selesai')">✔</button>
              <button class="action-btn action-btn-danger" onclick="openWithdrawAction('${item.id}', 'gagal')">❌</button>
            </div>
          ` : '<small style="color: #999;">-</small>'}
        </td>
      </tr>
    `;
  }).join('');
}

// Open Withdraw Action Modal
function openWithdrawAction(docId, action) {
  selectedWithdrawId = docId;
  document.getElementById('withdrawActionStatus').value = action;
  
  if (action === 'selesai') {
    document.querySelector('#withdrawActionForm .form-group:last-child').style.display = 'none';
  } else {
    document.querySelector('#withdrawActionForm .form-group:last-child').style.display = 'block';
  }
  
  showModal('withdrawActionModal');
}

// Submit Withdraw Action
async function submitWithdrawAction() {
  const status = document.getElementById('withdrawActionStatus').value;
  const reason = document.getElementById('withdrawActionReason').value.trim();
  
  if (!status) {
    showToast('Pilih status terlebih dahulu', 'error');
    return;
  }
  
  if (status === 'gagal' && !reason) {
    showToast('Berikan alasan penolakan', 'error');
    return;
  }
  
  try {
    // Update withdraw status
    await updateWithdrawStatus(selectedWithdrawId, status, reason);
    
    // If completed, deduct user balance
    if (status === 'selesai') {
      const withdraw = withdrawList.find(w => w.id === selectedWithdrawId);
      if (withdraw) {
        const userData = await getUserData(withdraw.uid);
        const newBalance = Math.max(0, (userData.data().saldo || 0) - withdraw.nominal);
        await updateUserBalance(withdraw.uid, newBalance);
      }
    }
    
    closeModal('withdrawActionModal');
    await loadWithdrawData();
    showToast('Status berhasil diperbarui!', 'success');
  } catch (error) {
    showToast('Error: ' + error.message, 'error');
  }
}

// Load User Data
async function loadUserData() {
  try {
    const snapshot = await getAllUsers();
    userList = [];
    
    snapshot.forEach(doc => {
      userList.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    filterUserData();
  } catch (error) {
    console.error('Error loading user data:', error);
    showToast('Error loading user data', 'error');
  }
}

// Filter User Data
function filterUserData() {
  const searchText = document.getElementById('userSearch')?.value.toLowerCase() || '';
  
  let filtered = userList.filter(user => {
    return user.username.toLowerCase().includes(searchText) || 
           user.email.toLowerCase().includes(searchText);
  });
  
  renderUserTable(filtered);
}

// Render User Table
function renderUserTable(data) {
  const table = document.getElementById('usersTable');
  
  if (data.length === 0) {
    table.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Tidak ada user</td></tr>';
    return;
  }
  
  table.innerHTML = data.map(user => `
    <tr>
      <td>${user.username}</td>
      <td><small>${truncateText(user.email, 25)}</small></td>
      <td><span class="badge ${user.role === 'owner' ? 'badge-primary' : 'badge-secondary'}">${user.role === 'owner' ? 'Owner' : 'User'}</span></td>
      <td>${formatRupiah(user.saldo || 0)}</td>
      <td><small>${formatDateShort(user.createdAt)}</small></td>
    </tr>
  `).join('');
}

// Load Settings
async function loadSettings() {
  try {
    const userData = await getUserData(currentUserId);
    if (userData.exists) {
      const data = userData.data();
      document.getElementById('ownerEmail').textContent = data.email;
      document.getElementById('ownerUsername').textContent = data.username;
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initAuth().then(() => {
    initOwner();
  });
});
