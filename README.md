# 📧 Gmail Store - Platform Jual Beli Gmail Account

Platform terpercaya untuk jual beli account Gmail dengan sistem pembayaran terintegrasi Firebase.

## ✨ Fitur Utama

### User Features
- ✅ Register & Login (Email + Google)
- ✅ Setor Gmail dengan validasi otomatis
- ✅ Lihat riwayat Gmail dengan status real-time
- ✅ Dashboard dengan statistik lengkap
- ✅ Penarikan saldo ke rekening DANA
- ✅ Profile management & upload foto
- ✅ Dark mode / Light mode
- ✅ Mobile responsive

### Owner Features
- ✅ Dashboard dengan statistik lengkap
- ✅ Kelola semua Gmail dari user
- ✅ Approve/Reject Gmail dengan alasan
- ✅ Kelola permintaan penarikan
- ✅ Lihat daftar semua user
- ✅ Export data ke CSV
- ✅ Pengaturan sistem

## 🏗️ Teknologi

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6)
- **Backend**: Firebase
  - Authentication
  - Cloud Firestore (Database)
  - Firebase Storage
  - Firebase Hosting
- **UI Framework**: Custom Glassmorphism Design
- **Design**: Dark Blue, Emerald Green, Neon Accent

## 📁 Struktur Project

```
gmail-store/
├── index.html              # Landing page
├── login.html              # Login page
├── register.html           # Register page
├── 404.html                # Error page
│
├── pages/
│   ├── dashboard.html      # User dashboard
│   ├── store.html          # Submit Gmail
│   ├── history.html        # Gmail history
│   ├── balance.html        # Balance info
│   ├── withdraw.html       # Withdraw form
│   ├── withdraw-history.html
│   ├── rules.html          # Syarat & ketentuan
│   ├── profile.html        # User profile
│   └── owner.html          # Owner panel
│
├── css/
│   ├── style.css           # Main styles
│   ├── auth.css            # Auth pages
│   ├── dashboard.css       # Dashboard layout
│   ├── owner.css           # Owner panel
│   └── animation.css       # Animations
│
├── js/
│   ├── firebase.js         # Firebase config & functions
│   ├── auth.js             # Auth state management
│   ├── utils.js            # Utility functions
│   ├── theme.js            # Dark mode
│   ├── dashboard.js
│   ├── store.js
│   ├── history.js
│   ├── balance.js
│   ├── withdraw.js
│   ├── withdraw-history.js
│   ├── profile.js
│   └── owner.js
│
├── firebase/
│   ├── firestore.rules     # Security rules
│   ├── firestore.indexes.json
│   └── firebase.json
│
└── README.md
```

## 🚀 Quick Start

### 1. Setup Firebase Project

1. Buat project baru di [Firebase Console](https://console.firebase.google.com)
2. Enable Firebase Authentication (Email & Google)
3. Buat Firestore Database (Production mode)
4. Enable Firebase Storage
5. Copy Firebase config

### 2. Update Firebase Config

Edit `js/firebase.js` dan ganti config dengan Firebase project Anda:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Upload Firestore Rules

1. Buka Firebase Console → Firestore → Rules
2. Copy isi file `firebase/firestore.rules`
3. Publish

### 4. Create Firestore Indexes

1. Firebase Console → Firestore → Indexes
2. Copy isi `firebase/firestore.indexes.json`
3. Buat indexes sesuai konfigurasi

### 5. Deploy ke Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize project
firebase init hosting

# Deploy
firebase deploy --only hosting
```

## 👤 Akun Default

```
Email: hanzpiw.owner@example.com
Password: hanzpiwsukatobrut
Username: hanzpiwsakitpinggang
Role: Owner
```

**Akun ini otomatis dibuat saat pertama kali aplikasi dijalankan.**

## 💰 Konfigurasi Harga

- **Harga Gmail Default**: Rp. 2.000
- **Minimal Penarikan**: Rp. 50.000
- **Metode Pembayaran**: DANA

Untuk mengubah harga, edit di `js/firebase.js` pada fungsi `submitGmail()`.

## 🔒 Keamanan

### Firestore Rules
- User hanya bisa lihat data miliknya
- Owner bisa akses semua data
- Update/Delete hanya oleh owner

### Authentication
- Firebase Authentication built-in
- Password minimal 8 karakter
- Token auto-refresh
- Auto logout jika token invalid

### Data Protection
- Semua email terenkripsi di Firestore
- Password tidak pernah di-log
- Secure Storage untuk foto profil

## 📊 Database Schema

### Collection: users
```javascript
{
  uid: string,
  username: string,
  email: string,
  photoURL: string,
  saldo: number,
  role: 'user' | 'owner',
  createdAt: timestamp
}
```

### Collection: gmail_store
```javascript
{
  uid: string,
  username: string,
  emailUser: string,
  gmail: string,
  password: string,
  price: number,
  status: 'pending' | 'diterima' | 'ditolak',
  reason: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Collection: withdraw
```javascript
{
  uid: string,
  username: string,
  email: string,
  namaDana: string,
  nomorDana: string,
  nominal: number,
  status: 'pending' | 'selesai' | 'gagal',
  reason: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🎨 Desain & UI

### Color Palette
- **Primary**: #0B5FFF (Blue)
- **Secondary**: #13B981 (Emerald Green)
- **Accent**: #2DD4BF (Cyan)
- **Success**: #22C55E
- **Danger**: #EF4444
- **Dark BG**: #09131F
- **Light BG**: #F5FAFF

### Features
- Glassmorphism design
- Smooth transitions
- Responsive layout
- Dark mode support
- Loading skeletons
- Toast notifications
- Modal dialogs
- Ripple effects

## 📱 Browser Support

- Chrome/Chromium (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)
- Mobile browsers (iOS Safari, Chrome Android)

## 🛠️ Development

### Edit Mode
Semua file HTML, CSS, dan JS dapat diedit langsung.

### Testing Locally
1. Use live server extension di VS Code
2. Atau: `python -m http.server 8000`
3. Buka: `http://localhost:8000`

### Debugging
- Firebase Console untuk melihat data
- Chrome DevTools untuk debugging
- Console untuk error checking

## 📝 API Endpoints (Firebase Functions)

Semua logic ada di `js/firebase.js`:

### Authentication
- `signUp(email, password, username)`
- `login(email, password)`
- `loginWithGoogle()`
- `logout()`
- `getCurrentUser()`

### Gmail Management
- `submitGmail(uid, username, emails, password, price)`
- `getUserGmail(uid)`
- `getAllGmail()`
- `updateGmailStatus(docId, status, reason)`

### Withdraw Management
- `submitWithdraw(uid, username, email, namaDana, nomorDana, nominal)`
- `getUserWithdraw(uid)`
- `getAllWithdraw()`
- `updateWithdrawStatus(docId, status, reason)`

### User Management
- `getUserData(uid)`
- `getAllUsers()`
- `updateUserProfile(uid, data)`
- `updateUserBalance(uid, newBalance)`

## 🐛 Troubleshooting

### Error: "Firebase not initialized"
- Pastikan firebase.js dimuat sebelum file lain
- Check Firebase config di console

### Error: "Permission denied"
- Check Firestore Rules
- Ensure user authenticated
- Verify rule syntax

### Gmail tidak muncul
- Refresh halaman
- Check Firestore punya data
- Lihat di browser console untuk error

### Foto tidak terupload
- Pastikan Storage bucket aktif
- Check file size < 5MB
- Verify Storage Rules

## 📞 Support

Untuk masalah:
1. Cek console browser (F12)
2. Lihat Firebase Console logs
3. Verify Firestore Rules syntax
4. Check Firebase config

## 📄 License

MIT License - Bebas digunakan untuk project pribadi maupun komersial.

## 🚀 Version

- **Versi**: 1.0
- **Release**: 2024
- **Status**: Production Ready

---

**Made with ❤️ for Gmail Store Community**
