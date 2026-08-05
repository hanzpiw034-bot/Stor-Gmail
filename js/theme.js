// ============================================
// THEME MANAGEMENT (DARK MODE)
// ============================================

class ThemeManager {
  constructor() {
    this.lightMode = 'light';
    this.darkMode = 'dark';
    this.currentTheme = localStorage.getItem('theme') || this.lightMode;
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.attachEventListeners();
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    
    if (theme === this.darkMode) {
      document.documentElement.setAttribute('data-theme', this.darkMode);
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.documentElement.setAttribute('data-theme', this.lightMode);
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
    
    localStorage.setItem('theme', theme);
    this.updateThemeButton();
  }

  toggle() {
    const newTheme = this.currentTheme === this.lightMode ? this.darkMode : this.lightMode;
    this.applyTheme(newTheme);
  }

  isDarkMode() {
    return this.currentTheme === this.darkMode;
  }

  attachEventListeners() {
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggle());
    }
  }

  updateThemeButton() {
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      if (this.isDarkMode()) {
        themeBtn.innerHTML = '☀️';
        themeBtn.title = 'Switch to Light Mode';
      } else {
        themeBtn.innerHTML = '🌙';
        themeBtn.title = 'Switch to Dark Mode';
      }
    }
  }
}

// Initialize theme manager
let themeManager = null;

document.addEventListener('DOMContentLoaded', () => {
  themeManager = new ThemeManager();
});
