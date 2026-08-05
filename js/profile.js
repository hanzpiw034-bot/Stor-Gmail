// ============================================
// PROFILE PAGE LOGIC
// ============================================

let currentUserId = null;

async function initProfile() {
  try {
    const canAccess = await initPageSecurity();
    if (!canAccess) return;

    currentUserId = currentUser.uid;
    setActiveNav('profile');
    
    await loadProfile();
    
  } catch (error) {
    console.error('Profile initialization error:', error);
    showToast('Error loading profile', 'error');
  }
}

async function loadProfile() {
  try {
    const userData = await getUserData(currentUserId);
    if (userData.exists) {
      const data = userData.data();
      
      // Update avatar
      const avatar = document.getElementById('profileAvatar');
      if (data.photoURL) {
        avatar.innerHTML = `<img src="${data.photoURL}" alt="Avatar">`;
      }
      
      // Update info
      document.getElementById('profileName').textContent = data.username;
      document.getElementById('profileUsername').textContent = data.username;
      document.getElementById('profileEmail').textContent = data.email;
      document.getElementById('profileUID').textContent = data.uid;
      document.getElementById('profileRole').textContent = data.role === 'owner' ? 'Owner' : 'User';
      document.getElementById('profileJoined').textContent = formatDate(data.createdAt);
      
      // Update header avatar
      const headerAvatar = document.getElementById('userAvatar');
      if (data.photoURL) {
        headerAvatar.innerHTML = `<img src="${data.photoURL}" alt="Avatar">`;
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    showToast('Error loading profile', 'error');
  }
}

async function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    showToast('Hanya file gambar yang diizinkan', 'error');
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    showToast('Ukuran file maksimal 5MB', 'error');
    return;
  }
  
  try {
    showToast('Uploading...', 'info');
    const url = await uploadProfilePhoto(currentUserId, file);
    
    document.getElementById('profileAvatar').innerHTML = `<img src="${url}" alt="Avatar">`;
    document.getElementById('userAvatar').innerHTML = `<img src="${url}" alt="Avatar">`;
    
    showToast('Foto berhasil diupload!', 'success');
  } catch (error) {
    showToast('Error uploading photo: ' + error.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initAuth().then(() => {
    initProfile();
  });
});
