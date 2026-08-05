// ============================================
// WITHDRAW PAGE LOGIC
// ============================================

let currentUserId = null;
let userBalance = 0;

async function initWithdraw() {
  try {
    const canAccess = await initPageSecurity();
    if (!canAccess) return;

    currentUserId = currentUser.uid;
    updateUserAvatar();
    setActiveNav('balance');
    
    await loadUserBalance();
    document.getElementById('withdrawForm').addEventListener('submit', handleWithdrawSubmit);
  } catch (error) {
    console.error('Withdraw initialization error:', error);
    showToast('Error initializing form', 'error');
  }
}

async function loadUserBalance() {
  try {
    const userData = await getUserData(currentUserId);
    if (userData.exists) {
      userBalance = userData.data().saldo;
      document.getElementById('availableBalance').textContent = formatRupiah(userBalance);
    }
  } catch (error) {
    console.error('Error loading balance:', error);
  }
}

async function handleWithdrawSubmit(e) {
  e.preventDefault();
  
  const namaDana = document.getElementById('namaDana').value.trim();
  const nomorDana = document.getElementById('nomorDana').value.trim();
  const nominal = parseInt(document.getElementById('nominal').value);
  
  // Validation
  if (!namaDana || namaDana.length < 3) {
    showToast('Nama DANA minimal 3 karakter', 'error');
    return;
  }
  
  if (!validateDANANumber(nomorDana)) {
    showToast('Nomor DANA harus minimal 10 digit', 'error');
    return;
  }
  
  if (nominal < 50000) {
    showToast('Minimal penarikan Rp. 50.000', 'error');
    return;
  }
  
  if (nominal > userBalance) {
    showToast('Saldo tidak cukup', 'error');
    return;
  }
  
  const btn = document.querySelector('#withdrawForm button[type="submit"]');
  btn.disabled = true;
  
  try {
    const userData = await getUserData(currentUserId);
    await submitWithdraw(
      currentUserId,
      userData.data().username,
      userData.data().email,
      namaDana,
      nomorDana,
      nominal
    );
    
    showToast('Penarikan berhasil diajukan!', 'success');
    setTimeout(() => {
      location.href = 'withdraw-history.html';
    }, 1000);
  } catch (error) {
    showToast('Error: ' + error.message, 'error');
    btn.disabled = false;
  }
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
    initWithdraw();
  });
});
