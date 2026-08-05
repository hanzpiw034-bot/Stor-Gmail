// ============================================
// FIREBASE CONFIGURATION
// ============================================
// CATATAN: Ganti dengan Firebase Config Anda sendiri

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAcsb57CiuzAJKt2uFpYcTal_2fq1M6AEM",
  authDomain: "project-stor-b9e7d.firebaseapp.com",
  projectId: "project-stor-b9e7d",
  storageBucket: "project-stor-b9e7d.firebasestorage.app",
  messagingSenderId: "740903702978",
  appId: "1:740903702978:web:7fc1a7bda5586deed8865b"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);

// Service Reference
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Test Firebase loaded
console.log('✓ Firebase initialized successfully');

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

const signUp = (email, password, username) => {
  return auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;
      
      return db.collection('users').doc(user.uid).set({
        uid: user.uid,
        username: username,
        email: email,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=0B5FFF&color=fff`,
        saldo: 0,
        role: 'user',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(() => user);
    });
};

const login = (email, password) => {
  return auth.signInWithEmailAndPassword(email, password);
};

const loginWithGoogle = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  return auth.signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      
      return db.collection('users').doc(user.uid).get().then(doc => {
        if (!doc.exists) {
          return db.collection('users').doc(user.uid).set({
            uid: user.uid,
            username: user.displayName || user.email.split('@')[0],
            email: user.email,
            photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=0B5FFF&color=fff`,
            saldo: 0,
            role: 'user',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      }).then(() => user);
    });
};

const logout = () => {
  return auth.signOut();
};

const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    });
  });
};

const getUserData = (uid) => {
  return db.collection('users').doc(uid).get();
};

const updateUserProfile = (uid, data) => {
  return db.collection('users').doc(uid).update(data);
};

// ============================================
// GMAIL STORE FUNCTIONS
// ============================================

const submitGmail = (uid, username, emails, password, price = 2000) => {
  const validEmails = [...new Set(emails)]
    .filter(email => email.match(/^[^\s@]+@gmail\.com$/i))
    .map(email => email.trim().toLowerCase());

  if (validEmails.length === 0) {
    return Promise.reject(new Error('No valid Gmail addresses found'));
  }

  const batch = db.batch();

  validEmails.forEach(gmail => {
    const docRef = db.collection('gmail_store').doc();
    batch.set(docRef, {
      uid: uid,
      username: username,
      emailUser: firebase.auth().currentUser.email,
      gmail: gmail,
      password: password.trim(),
      price: parseInt(price),
      status: 'pending',
      reason: '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  });

  return batch.commit();
};

const getUserGmail = (uid) => {
  return db.collection('gmail_store')
    .where('uid', '==', uid)
    .orderBy('createdAt', 'desc')
    .get();
};

const getAllGmail = () => {
  return db.collection('gmail_store')
    .orderBy('createdAt', 'desc')
    .get();
};

const updateGmailStatus = (docId, status, reason = '') => {
  return db.collection('gmail_store').doc(docId).update({
    status: status,
    reason: reason,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

const deleteGmailDoc = (docId) => {
  return db.collection('gmail_store').doc(docId).delete();
};

// ============================================
// WITHDRAW FUNCTIONS
// ============================================

const submitWithdraw = (uid, username, email, namaDana, nomorDana, nominal) => {
  return db.collection('withdraw').add({
    uid: uid,
    username: username,
    email: email,
    namaDana: namaDana,
    nomorDana: nomorDana,
    nominal: parseInt(nominal),
    status: 'pending',
    reason: '',
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

const getUserWithdraw = (uid) => {
  return db.collection('withdraw')
    .where('uid', '==', uid)
    .orderBy('createdAt', 'desc')
    .get();
};

const getAllWithdraw = () => {
  return db.collection('withdraw')
    .orderBy('createdAt', 'desc')
    .get();
};

const updateWithdrawStatus = (docId, status, reason = '') => {
  return db.collection('withdraw').doc(docId).update({
    status: status,
    reason: reason,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

// ============================================
// USER FUNCTIONS
// ============================================

const getAllUsers = () => {
  return db.collection('users').orderBy('createdAt', 'desc').get();
};

const getUserById = (uid) => {
  return db.collection('users').doc(uid).get();
};

const updateUserBalance = (uid, newBalance) => {
  return db.collection('users').doc(uid).update({
    saldo: newBalance
  });
};

// ============================================
// STORAGE FUNCTIONS
// ============================================

const uploadProfilePhoto = (uid, file) => {
  return new Promise((resolve, reject) => {
    const ref = storage.ref(`avatars/${uid}/profile.jpg`);
    ref.put(file).then(snapshot => {
      snapshot.ref.getDownloadURL().then(url => {
        db.collection('users').doc(uid).update({
          photoURL: url
        }).then(() => {
          resolve(url);
        }).catch(reject);
      }).catch(reject);
    }).catch(reject);
  });
};

// ============================================
// STATISTICS FUNCTIONS
// ============================================

const getStatistics = (uid, isOwner = false) => {
  return new Promise((resolve, reject) => {
    const stats = {
      totalGmail: 0,
      pending: 0,
      diterima: 0,
      ditolak: 0,
      totalUser: 0,
      pendapatan: 0,
      withdrawPending: 0,
      withdrawSelesai: 0,
      withdrawGagal: 0
    };

    Promise.all([
      isOwner ? getAllGmail() : getUserGmail(uid),
      isOwner ? getAllUsers() : Promise.resolve(null),
      isOwner ? getAllWithdraw() : getUserWithdraw(uid),
      getUserData(uid)
    ]).then(([gmailSnap, usersSnap, withdrawSnap, userSnap]) => {
      gmailSnap.forEach(doc => {
        const data = doc.data();
        stats.totalGmail++;
        if (data.status === 'pending') stats.pending++;
        if (data.status === 'diterima') {
          stats.diterima++;
          stats.pendapatan += data.price;
        }
        if (data.status === 'ditolak') stats.ditolak++;
      });

      if (isOwner && usersSnap) {
        stats.totalUser = usersSnap.size;
      }

      withdrawSnap.forEach(doc => {
        const data = doc.data();
        if (data.status === 'pending') stats.withdrawPending++;
        if (data.status === 'selesai') stats.withdrawSelesai++;
        if (data.status === 'gagal') stats.withdrawGagal++;
      });

      resolve(stats);
    }).catch(reject);
  });
};

// ============================================
// REAL-TIME LISTENERS
// ============================================

const listenToUserBalance = (uid, callback) => {
  return db.collection('users').doc(uid).onSnapshot(doc => {
    if (doc.exists) {
      callback(doc.data().saldo);
    }
  });
};

const listenToUserData = (uid, callback) => {
  return db.collection('users').doc(uid).onSnapshot(doc => {
    if (doc.exists) {
      callback(doc.data());
    }
  });
};
