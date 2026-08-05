// ============================================
// HISTORY PAGE LOGIC
// ============================================

let currentUserId = null;
let allGmailData = [];
let filteredData = [];

async function initHistory() {
  try {
    const canAccess = await initPageSecurity();
    if (!canAccess) return;

    currentUserId = currentUser.uid;
    updateUserAvatar();
    setActiveNav('history');
    
    document.getElementById('searchInput').addEventListener('keyup', debounce(filterHistory, 300));
    document.getElementById('filterStatus').addEventListener('change', filterHistory);
    
    await loadHistory();
  } catch (error) {
    console.error('History initialization error:', error);
    showToast('Error loading history', 'error');
  }
}

async function loadHistory() {
  try {
    const snapshot = await getUserGmail(currentUserId);
    allGmailData = [];
    
    snapshot.forEach(doc => {
      allGmailData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    filterHistory();
  } catch (error) {
    console.error('Error loading history:', error);
    showToast('Error loading history', 'error');
  }
}

function filterHistory() {
  const searchText = document.getElementById('searchInput').value.toLowerCase();
  const statusFilter = document.getElementById('filterStatus').value;
  
  filteredData = allGmailData.filter(item => {
    const matchSearch = item.gmail.toLowerCase().includes(searchText) || 
                       (item.username && item.username.toLowerCase().includes(searchText));
    const matchStatus = !statusFilter || item.status === statusFilter;
    return matchSearch && matchStatus;
  });
  
  renderHistory();
}

function renderHistory() {
  const table = document.getElementById('historyTable');
  
  if (filteredData.length === 0) {
    table.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Tidak ada data</td></tr>';
    return;
  }
  
  table.innerHTML = filteredData.map(item => `
    <tr>
      <td><code style="background: rgba(0,0,0,0.05); padding: 0.25rem 0.5rem; border-radius: 4px;">${truncateText(item.gmail, 25)}</code></td>
      <td>${formatRupiah(item.price)}</td>
      <td><span class="badge ${getBadgeClass(item.status)}">${getBadgeLabel(item.status)}</span></td>
      <td>${formatDate(item.createdAt)}</td>
      <td>${item.reason ? `<small>${truncateText(item.reason, 20)}</small>` : '-'}</td>
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
    initHistory();
  });
});
