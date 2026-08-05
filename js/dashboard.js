// ============================================
// DASHBOARD LOGIC
// ============================================

let currentUserId = null;
let userBalance = 0;
let gmailStats = {};
let balanceListener = null;

// Initialize Dashboard
async function initDashboard() {
  try {
    const canAccess = await initPageSecurity();
    if (!canAccess) return;

    currentUserId = currentUser.uid;
    
    // Update user avatar
    updateUserAvatar();
    
    // Load statistics
    await loadDashboardStats();
    
    // Listen to balance changes
    balanceListener = listenToUserBalance(currentUserId, (balance) => {
      userBalance = balance;
      document.getElementById('balanceDisplay').textContent = formatRupiah(balance);
    });
    
    // Set active nav
    setActiveNav('dashboard');
  } catch (error) {
    console.error('Dashboard initialization error:', error);
    showToast('Error loading dashboard: ' + error.message, 'error');
  }
}

// Update User Avatar
async function updateUserAvatar() {
  try {
    const userData = await getUserData(currentUserId);
    if (userData.exists) {
      const data = userData.data();
      const avatar = document.getElementById('userAvatar');
      
      if (data.photoURL) {
        avatar.innerHTML = `<img src="${data.photoURL}" alt="Avatar">`;
      } else {
        avatar.textContent = '👤';
      }
    }
  } catch (error) {
    console.error('Error updating avatar:', error);
  }
}

// Load Dashboard Statistics
async function loadDashboardStats() {
  try {
    const stats = await getStatistics(currentUserId, false);
    gmailStats = stats;
    
    // Update UI
    document.getElementById('totalGmail').textContent = stats.totalGmail;
    document.getElementById('pendingGmail').textContent = stats.pending;
    document.getElementById('acceptedGmail').textContent = stats.diterima;
    document.getElementById('rejectedGmail').textContent = stats.ditolak;
    document.getElementById('totalIncome').textContent = formatRupiah(stats.pendapatan);
  } catch (error) {
    console.error('Error loading stats:', error);
    showToast('Error loading statistics', 'error');
  }
}

// Clean up listeners
function cleanupDashboard() {
  if (balanceListener) {
    balanceListener();
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  initAuth().then(() => {
    initDashboard();
  });
});

// Cleanup on page unload
window.addEventListener('unload', () => {
  cleanupDashboard();
});
