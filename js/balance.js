// ============================================
// BALANCE PAGE LOGIC
// ============================================

let currentUserId = null;
let userBalance = 0;

async function initBalance() {
  try {
    const canAccess = await initPageSecurity();
    if (!canAccess) return;

    currentUserId = currentUser.uid;
    updateUserAvatar();
    setActiveNav('balance');
    
    await loadBalanceData();
    
    listenToUserBalance(currentUserId, (balance) => {
      userBalance = balance;
      updateBalanceDisplay();
    });
  } catch (error) {
    console.error('Balance initialization error:', error);
    showToast('Error loading balance', 'error');
  }
}

async function loadBalanceData() {
  try {
    const stats = await getStatistics(currentUserId, false);
    
    document.getElementById('currentBalance').textContent = formatRupiah(userBalance);
    document.getElementById('totalEarnings').textContent = formatRupiah(stats.pendapatan);
    document.getElementById('totalAccepted').textContent = stats.diterima;
  } catch (error) {
    console.error('Error loading balance data:', error);
  }
}

function updateBalanceDisplay() {
  document.getElementById('currentBalance').textContent = formatRupiah(userBalance);
}

async function updateUserAvatar() {
  try {
    const userData = await getUserData(currentUserId);
    if (userData.exists) {
      const data = userData.data();
      userBalance = data.saldo;
      const avatar = document.getElementById('userAvatar');
      if (data.photoURL) {
        avatar.innerHTML = `<img src="${data.photoURL}" alt="Avatar">`;
      }
    }
  } catch (error) {
    console.error('Error updating avatar:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initAuth().then(() => {
    initBalance();
  });
});
