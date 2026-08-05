// ============================================
// STORE PAGE LOGIC
// ============================================

let currentUserId = null;

async function initStore() {
  try {
    const canAccess = await initPageSecurity();
    if (!canAccess) return;

    currentUserId = currentUser.uid;
    updateUserAvatar();
    setActiveNav('store');
    
    document.getElementById('storeForm').addEventListener('submit', handleStoreSubmit);
  } catch (error) {
    console.error('Store initialization error:', error);
    showToast('Error initializing store', 'error');
  }
}

async function handleStoreSubmit(e) {
  e.preventDefault();
  
  const gmailText = document.getElementById('gmail').value.trim();
  const password = document.getElementById('password').value.trim();
  
  if (!gmailText || !password) {
    showToast('Email dan password harus diisi', 'error');
    return;
  }

  // Parse emails
  const emails = gmailText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (emails.length === 0) {
    showToast('Tidak ada email yang valid', 'error');
    return;
  }

  // Show loading
  const btn = document.querySelector('#storeForm button[type="submit"]');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-small"></span> Memproses...';

  try {
    // Get user data for username
    const userData = await getUserData(currentUserId);
    const username = userData.data().username;
    
    // Submit emails
    await submitGmail(currentUserId, username, emails, password, 2000);
    
    showToast(`${emails.length} Gmail berhasil dikirim!`, 'success');
    
    // Reset form
    document.getElementById('storeForm').reset();
    
    // Redirect to history
    setTimeout(() => {
      location.href = 'history.html';
    }, 1000);
  } catch (error) {
    showToast('Error: ' + error.message, 'error');
    btn.disabled = false;
    btn.innerHTML = originalText;
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
    initStore();
  });
});
