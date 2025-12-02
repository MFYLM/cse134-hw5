(function() {
    'use strict';

    const THEME_STORAGE_KEY = 'theme-preference';
    const THEME_DARK = 'dark';
    const THEME_LIGHT = 'light';
    
    const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
    
    if (!themeToggleCheckbox) {
        console.warn('Theme toggle checkbox not found');
        return;
    }

    /**
     * Get saved theme from localStorage
     * @returns {string|null} The saved theme or null if not set
     */
    function getSavedTheme() {
        try {
            return localStorage.getItem(THEME_STORAGE_KEY);
        } catch (e) {
            console.warn('localStorage not available:', e);
            return null;
        }
    }

    /**
     * Save theme preference to localStorage
     * @param {string} theme - The theme to save ('dark' or 'light')
     */
    function saveTheme(theme) {
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
            console.log(`Theme saved: ${theme}`);
        } catch (e) {
            console.warn('Could not save theme to localStorage:', e);
        }
    }

    /**
     * Apply theme by setting checkbox state
     * @param {string} theme - The theme to apply ('dark' or 'light')
     */
    function applyTheme(theme) {
        if (theme === THEME_DARK) {
            themeToggleCheckbox.checked = true;
        } else {
            themeToggleCheckbox.checked = false;
        }
    }

    /**
     * Initialize theme from localStorage or system preference
     */
    function initTheme() {
        const savedTheme = getSavedTheme();
        
        if (savedTheme) {
            // Use saved preference
            applyTheme(savedTheme);
            console.log(`Applied saved theme: ${savedTheme}`);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia && 
                               window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            const theme = prefersDark ? THEME_DARK : THEME_LIGHT;
            applyTheme(theme);
            saveTheme(theme);
            console.log(`Applied system theme: ${theme}`);
        }
    }

    /**
     * Handle theme toggle change
     */
    function handleThemeChange() {
        const newTheme = themeToggleCheckbox.checked ? THEME_DARK : THEME_LIGHT;
        saveTheme(newTheme);
        console.log(`Theme changed to: ${newTheme}`);
    }

    // Initialize theme on page load
    initTheme();

    // Listen for theme toggle changes
    themeToggleCheckbox.addEventListener('change', handleThemeChange);

    // Optional: Listen for system theme changes
    if (window.matchMedia) {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Some browsers support addEventListener on MediaQueryList
        if (darkModeQuery.addEventListener) {
            darkModeQuery.addEventListener('change', (e) => {
                // Only update if user hasn't set a preference
                const savedTheme = getSavedTheme();
                if (!savedTheme) {
                    const theme = e.matches ? THEME_DARK : THEME_LIGHT;
                    applyTheme(theme);
                    console.log(`System theme changed to: ${theme}`);
                }
            });
        }
    }

    console.log('Theme toggle initialized with localStorage persistence');
})();

