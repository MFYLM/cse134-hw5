(function() {
    'use strict';

    const LOCAL_STORAGE_KEY = 'publications-data';
    const REMOTE_JSON_URL = 'https://api.jsonbin.io/v3/b/6926397a43b1c97be9c53315';
    const LOCAL_JSON_URL = '/data-local-publications.json';

    // Initialize local storage with sample data if empty
    function initializeLocalStorage() {
        const existingData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!existingData) {
            // Fetch and store local data
            fetch(LOCAL_JSON_URL)
                .then(response => response.json())
                .then(data => {
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
                    console.log('Local storage initialized with sample data');
                })
                .catch(error => {
                    console.error('Error initializing local storage:', error);
                });
        }
    }

    // Clear all cards from container
    function clearCards(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Remove only publication-card elements
        const cards = container.querySelectorAll('publication-card');
        cards.forEach(card => card.remove());
    }

    // Create a publication card element from data
    function createPublicationCard(pub) {
        const card = document.createElement('publication-card');
        card.setAttribute('title', pub.title);
        card.setAttribute('authors', pub.authors);
        card.setAttribute('venue', pub.venue);
        card.setAttribute('year', pub.year);
        card.setAttribute('link', pub.link);
        card.setAttribute('image', pub.image);
        card.setAttribute('image-alt', pub.imageAlt || 'Publication image');
        card.setAttribute('description', pub.description);
        return card;
    }

    // Render cards to the DOM
    function renderCards(publications, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with id "${containerId}" not found`);
            return;
        }

        clearCards(containerId);

        if (!publications || publications.length === 0) {
            const message = document.createElement('p');
            message.textContent = 'No publications found.';
            message.style.color = 'var(--color-text-secondary-light)';
            message.id = 'no-data-message';
            container.appendChild(message);
            return;
        }

        // Remove any "no data" message
        const noDataMsg = container.querySelector('#no-data-message');
        if (noDataMsg) noDataMsg.remove();

        publications.forEach(pub => {
            const card = createPublicationCard(pub);
            container.appendChild(card);
        });

        console.log(`Rendered ${publications.length} publication cards`);
    }

    // Load data from localStorage
    function loadFromLocalStorage(containerId) {
        try {
            const data = localStorage.getItem(LOCAL_STORAGE_KEY);
            
            if (!data) {
                alert('No data found in localStorage. Initializing with sample data...');
                initializeLocalStorage();
                // Retry after initialization
                setTimeout(() => loadFromLocalStorage(containerId), 500);
                return;
            }

            const parsedData = JSON.parse(data);
            const publications = parsedData.publications || [];
            
            renderCards(publications, containerId);
            
            // Show success message
            showNotification('✓ Loaded from localStorage', 'success');
            
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            alert('Error loading data from localStorage: ' + error.message);
        }
    }

    // Load data from remote server using fetch
    function loadFromRemote(containerId) {
        // Show loading state
        showNotification('Loading from remote server...', 'info');
        
        fetch(REMOTE_JSON_URL, {
            headers: {
                'X-Master-Key': '$2a$10$bzG2ZR2n5Qt67wn7BB/tqusE0rB74EU7h0aQiOuOaCePdKQDl.A.m' // this is unsafe!
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // JSONBin wraps data in a 'record' property
                const publications = data.record?.publications || data.publications || [];
                
                renderCards(publications, containerId);
                
                // Show success message
                showNotification('✓ Loaded from remote server', 'success');
            })
            .catch(error => {
                console.error('Error loading from remote:', error);
                showNotification('✗ Error loading from remote: ' + error.message, 'error');
                
                // Fallback: try to load from a backup local file
                console.log('Attempting fallback to local file...');
                fetch(LOCAL_JSON_URL)
                    .then(response => response.json())
                    .then(data => {
                        const publications = data.publications || [];
                        renderCards(publications, containerId);
                        showNotification('✓ Loaded from fallback local file', 'warning');
                    })
                    .catch(fallbackError => {
                        console.error('Fallback also failed:', fallbackError);
                    });
            });
    }

    // Show notification message
    function showNotification(message, type = 'info') {
        // Remove existing notification if any
        const existing = document.getElementById('data-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.id = 'data-notification';
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        // Set color based on type
        const colors = {
            success: { bg: '#10b981', text: '#ffffff' },
            error: { bg: '#ef4444', text: '#ffffff' },
            info: { bg: '#3b82f6', text: '#ffffff' },
            warning: { bg: '#f59e0b', text: '#ffffff' }
        };
        
        const color = colors[type] || colors.info;
        notification.style.backgroundColor = color.bg;
        notification.style.color = color.text;

        document.body.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Initialize localStorage on page load
    initializeLocalStorage();

    // Export functions to global scope for button onclick handlers
    window.dataLoader = {
        loadLocal: loadFromLocalStorage,
        loadRemote: loadFromRemote,
        clearCards: clearCards
    };

    console.log('Data loader initialized');
})();

