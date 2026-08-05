// ============================================
// WITHDRAW HISTORY PAGE LOGIC
// ============================================

let currentUserId = null;
let withdrawData = [];

async function initWithdrawHistory() {
  try {
    const canAccess = await initPageSecurity();
    if (!canAccess) return;

    currentUserId = currentUser.uid;
    updateUserAvatar();
    setActiveNav('balance');
    
    await loadWithdrawHistory();
  } catch (error) {
    console.error('Withdraw history error:', error);
    showToast('Error loading history', 'error');
  }
}

async function loadWithdrawHistory() {
  try {
    const snapshot = await getUserWithdraw(currentUserId);
    withdrawData = [];
    
    snapshot.forEach(doc => {
      withdrawData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    renderWithdrawHistory();
  } catch (error) {
    console.error('Error loading withdraw history:', error);
    showToast('Error loading history', 'error');
  }
}

function renderWithdrawHistory() {
  const table = document.getElementById('withdrawTable');
  
  if (withdrawData.length === 0) {
    table.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Tidak ada riwayat</td></tr>';
    return;
  }
  
  table.innerHTML = withdrawData.map(item => `
    <tr>
      <td>
        <div style="font-size: 0.9rem;"><strong>${item.namaDana}</strong></div>
        <div style="font-size: 0.8rem; color: #999;">${item.nomorDana}</div>
      </td>
      <td>${formatRupiah(item.nominal)}</td>
      <td><span class="badge ${getBadgeClass(item.status)}">${getBadgeLabel(item.status)}</span></td>
      <td>${formatDate(item.createdAt)}</td>
      <td>${item.reason ? `<small style="color: var(--danger);">${truncateText(item.reason, 20)}</small>` : '-'}</td>
    </tr>
  `).join('');
}

async function updateUserAvatar() {
  try {
    const userData = await getUserData(currentUserId);
    if (userData.exists) {
      const data = userData.data();
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
    initWithdrawHistory();
  });
});
