// ============================================
// UTILITY FUNCTIONS
// ============================================

// Toast Notification
const showToast = (message, type = 'success') => {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span>${message}</span>
      <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// Format Rupiah
const formatRupiah = (num) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(num);
};

// Format Date
const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatDateShort = (timestamp) => {
  if (!timestamp) return '-';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

// Copy to Clipboard
const copyToClipboard = (text, label = 'Copied!') => {
  navigator.clipboard.writeText(text).then(() => {
    showToast(label, 'success');
  }).catch(err => {
    showToast('Failed to copy', 'error');
  });
};

// Validate Email
const validateEmail = (email) => {
  const re = /^[^\s@]+@gmail\.com$/i;
  return re.test(email);
};

// Validate DANA Number
const validateDANANumber = (number) => {
  return /^\d{10,}$/.test(number);
};

// Get Badge Class
const getBadgeClass = (status) => {
  switch (status) {
    case 'pending':
      return 'badge-warning';
    case 'diterima':
    case 'selesai':
      return 'badge-success';
    case 'ditolak':
    case 'gagal':
      return 'badge-danger';
    default:
      return 'badge-secondary';
  }
};

// Get Badge Label
const getBadgeLabel = (status) => {
  const labels = {
    'pending': 'Pending',
    'diterima': 'Diterima',
    'ditolak': 'Ditolak',
    'selesai': 'Selesai',
    'gagal': 'Gagal'
  };
  return labels[status] || status;
};

// CSV Export
const exportToCSV = (data, filename = 'export.csv') => {
  let csv = '';
  
  // Headers
  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    csv += headers.map(h => `"${h}"`).join(',') + '\n';
    
    // Rows
    data.forEach(row => {
      const values = headers.map(h => {
        const value = row[h];
        if (typeof value === 'string') {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csv += values.join(',') + '\n';
    });
  }
  
  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Loading Skeleton
const createSkeleton = (count = 3) => {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="skeleton-card">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    `;
  }
  return html;
};

// Check Authentication Status
const checkAuth = async () => {
  const user = await getCurrentUser();
  
  if (!user) {
    window.location.href = '/login.html';
    return false;
  }
  
  return user;
};

// Check Owner Role
const checkOwnerRole = async () => {
  const user = await getCurrentUser();
  
  if (!user) {
    window.location.href = '/login.html';
    return false;
  }
  
  const userData = await getUserData(user.uid);
  
  if (!userData.exists || userData.data().role !== 'owner') {
    window.location.href = '/pages/dashboard.html';
    return false;
  }
  
  return user;
};

// Initialize Remember Me
const initRememberMe = () => {
  const remembered = localStorage.getItem('rememberMe');
  const savedEmail = localStorage.getItem('savedEmail');
  
  if (remembered && savedEmail) {
    const emailInput = document.querySelector('input[type="email"]');
    if (emailInput) {
      emailInput.value = savedEmail;
      const rememberCheckbox = document.querySelector('input[name="remember"]');
      if (rememberCheckbox) {
        rememberCheckbox.checked = true;
      }
    }
  }
};

// Save Remember Me
const saveRememberMe = (email, remember) => {
  if (remember) {
    localStorage.setItem('rememberMe', 'true');
    localStorage.setItem('savedEmail', email);
  } else {
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('savedEmail');
  }
};

// Pagination Helper
const paginate = (data, pageSize = 10) => {
  const pages = [];
  for (let i = 0; i < data.length; i += pageSize) {
    pages.push(data.slice(i, i + pageSize));
  }
  return pages;
};

// Debounce Function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Show Loading Spinner
const showLoading = (show = true) => {
  const spinner = document.querySelector('.loading-spinner');
  if (spinner) {
    spinner.style.display = show ? 'flex' : 'none';
  }
};

// Safe Firestore Timestamp
const getTimestampValue = (timestamp) => {
  if (!timestamp) return new Date();
  return timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
};

// Generate Random ID
const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Close Modal
const closeModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
};

// Show Modal
const showModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  }
};

// Truncate Text
const truncateText = (text, length = 20) => {
  if (text.length > length) {
    return text.substr(0, length) + '...';
  }
  return text;
};

// Format Time Ago
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '-';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' tahun lalu';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' bulan lalu';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' hari lalu';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' jam lalu';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' menit lalu';
  
  return Math.floor(seconds) + ' detik lalu';
};

// Initialize Page Security
const initPageSecurity = async () => {
  const user = await checkAuth();
  if (!user) return false;
  
  // Check if current page is owner only
  const path = window.location.pathname;
  if (path.includes('owner.html')) {
    const userData = await getUserData(user.uid);
    if (!userData.exists || userData.data().role !== 'owner') {
      window.location.href = '/pages/dashboard.html';
      return false;
    }
  }
  
  return true;
};

// Get URL Parameter
const getURLParameter = (name) => {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
};

// Set Active Nav
const setActiveNav = (page) => {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  const activeItem = document.querySelector(`[data-page="${page}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
  }
};
