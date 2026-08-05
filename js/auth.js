// ============================================
// AUTHENTICATION STATE & MANAGEMENT
// ============================================

let currentUser = null;
let currentUserData = null;
let authStateListener = null;

// Initialize Authentication Listener
const initAuth = () => {
  return new Promise((resolve) => {
    auth.onAuthStateChanged(async (user) => {
      currentUser = user;
      
      if (user) {
        try {
          const userData = await getUserData(user.uid);
          if (userData.exists) {
            currentUserData = userData.data();
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        currentUserData = null;
      }
      
      resolve(user);
    });
  });
};

// Get Current User Info
const getCurrentUserInfo = () => {
  return {
    user: currentUser,
    data: currentUserData
  };
};

// Handle Auto Login on Page Load
const handleAutoLogin = async () => {
  const path = window.location.pathname;
  
  // Pages that don't require auth
  const publicPages = [
    '/index.html',
    '/login.html',
    '/register.html',
    '/404.html'
  ];
  
  const isPublicPage = publicPages.some(page => path.includes(page));
  
  if (!isPublicPage) {
    const user = await getCurrentUser();
    
    if (!user) {
      window.location.href = '/login.html';
      return false;
    }
    
    // If user is owner, redirect to owner panel
    if (currentUserData && currentUserData.role === 'owner' && !path.includes('owner')) {
      // Don't redirect automatically, let user choose
    }
    
    return true;
  }
  
  // If already logged in and on login/register page, redirect to dashboard
  if ((path.includes('login.html') || path.includes('register.html')) && currentUser) {
    if (currentUserData && currentUserData.role === 'owner') {
      window.location.href = '/pages/owner.html';
    } else {
      window.location.href = '/pages/dashboard.html';
    }
  }
  
  return false;
};

// Redirect based on role
const redirectByRole = () => {
  if (!currentUserData) return;
  
  if (currentUserData.role === 'owner') {
    window.location.href = '/pages/owner.html';
  } else {
    window.location.href = '/pages/dashboard.html';
  }
};

// Check if user is owner
const isOwner = () => {
  return currentUserData && currentUserData.role === 'owner';
};

// Check if user is authenticated
const isAuthenticated = () => {
  return currentUser !== null;
};

// Get user role
const getUserRole = () => {
  return currentUserData ? currentUserData.role : null;
};

// Update current user data
const updateCurrentUserData = async () => {
  if (!currentUser) return;
  
  try {
    const userData = await getUserData(currentUser.uid);
    if (userData.exists) {
      currentUserData = userData.data();
      return currentUserData;
    }
  } catch (error) {
    console.error('Error updating user data:', error);
  }
};

// Handle Logout
const handleLogout = async () => {
  try {
    await logout();
    currentUser = null;
    currentUserData = null;
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('savedEmail');
    showToast('Berhasil logout', 'success');
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 500);
  } catch (error) {
    showToast('Error logout: ' + error.message, 'error');
  }
};

// Initialize Owner Account
const initializeOwnerAccount = async () => {
  try {
    const ownerData = {
      email: 'admin@stor.com',
      password: 'TempAdmin123!',
      username: 'StorAdmin'
    };
    
    // Check if owner exists
    const ownerCheck = await db.collection('users')
      .where('role', '==', 'owner')
      .limit(1)
      .get();
    
    if (ownerCheck.empty) {
      // Create owner account
      const userCredential = await auth.createUserWithEmailAndPassword(
        ownerData.email,
        ownerData.password
      );
      
      const user = userCredential.user;
      
      await db.collection('users').doc(user.uid).set({
        uid: user.uid,
        username: ownerData.username,
        email: ownerData.email,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerData.username)}&background=0B5FFF&color=fff&bold=true`,
        saldo: 0,
        role: 'owner',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // Sign out owner
      await auth.signOut();
      
      console.log('✓ Owner account initialized successfully');
    } else {
      console.log('✓ Owner account already exists');
    }
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('✓ Owner account already exists');
    } else {
      console.error('Owner initialization error:', error.message);
    }
  }
};

// Initialize auth when page loads
document.addEventListener('DOMContentLoaded', () => {
  try {
    initAuth().then(() => {
      handleAutoLogin();
    }).catch(err => {
      console.error('Auth init error:', err);
    });
    
    // Initialize owner account on first load (skip on public pages)
    const path = window.location.pathname;
    const publicPages = ['/index.html', '/login.html', '/register.html', '/404.html'];
    const isPublicPage = publicPages.some(page => path.includes(page));
    
    if (!isPublicPage) {
      const ownerInitialized = localStorage.getItem('ownerInitialized');
      if (!ownerInitialized) {
        initializeOwnerAccount().then(() => {
          localStorage.setItem('ownerInitialized', 'true');
        }).catch(err => {
          console.error('Owner init error:', err);
        });
      }
    }
  } catch (error) {
    console.error('DOMContentLoaded error:', error);
  }
});

// Export auth functions
// signUp, login, loginWithGoogle, logout, getCurrentUser are defined in firebase.js
