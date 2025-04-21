class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.darkIcon = this.themeToggle.querySelector('.dark-icon');
        this.lightIcon = this.themeToggle.querySelector('.light-icon');
        this.themeText = this.themeToggle.querySelector('.theme-text');
        
        // Load saved theme from localStorage
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.applyTheme(this.currentTheme);
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-bs-theme', theme);
        
        // Update button icons and text
        if (theme === 'dark') {
            this.darkIcon.classList.remove('d-none');
            this.lightIcon.classList.add('d-none');
            this.themeText.textContent = 'Light Mode';
        } else {
            this.darkIcon.classList.add('d-none');
            this.lightIcon.classList.remove('d-none');
            this.themeText.textContent = 'Dark Mode';
        }
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
});
