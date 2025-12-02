(function() {
    'use strict';

    const LOCAL_STORAGE_KEY = 'publications-data';
    const REMOTE_JSON_URL = 'https://api.jsonbin.io/v3/b/6926397a43b1c97be9c53315';
    const API_KEY = '$2a$10$bzG2ZR2n5Qt67wn7BB/tqusE0rB74EU7h0aQiOuOaCePdKQDl.A.m';

    let currentMode = 'local';

    function loadFromLocalStorage() {
        try {
            const data = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (!data) return { publications: [] };
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return { publications: [] };
        }
    }

    function saveToLocalStorage(data) {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
            console.log('Saved to localStorage');
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            showNotification('Error saving to localStorage: ' + error.message, 'error');
            return false;
        }
    }

    // Load publications from remote JSONBin
    async function loadFromRemote() {
        try {
            const response = await fetch(REMOTE_JSON_URL, {
                headers: {
                    'X-Master-Key': API_KEY
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // JSONBin wraps data in 'record' property
            return data.record || data;
        } catch (error) {
            console.error('Error loading from remote:', error);
            showNotification('Error loading from remote: ' + error.message, 'error');
            return { publications: [] };
        }
    }

    // Save publications to remote JSONBin (PUT request)
    async function saveToRemote(data) {
        try {
            const response = await fetch(REMOTE_JSON_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': API_KEY
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Saved to remote:', result);
            return true;
        } catch (error) {
            console.error('Error saving to remote:', error);
            showNotification('Error saving to remote: ' + error.message, 'error');
            return false;
        }
    }

    // CREATE: Add new publication
    async function createPublication(pubData) {
        showNotification('Creating publication...', 'info');

        const data = currentMode === 'local' 
            ? loadFromLocalStorage() 
            : await loadFromRemote();

        // Generate a unique ID
        const newPub = {
            id: Date.now().toString(),
            ...pubData
        };

        data.publications.push(newPub);

        // Save based on current mode
        const success = currentMode === 'local'
            ? saveToLocalStorage(data)
            : await saveToRemote(data);

        if (success) {
            showNotification(`✓ Publication created in ${currentMode} storage`, 'success');
            refreshPublicationsList();
            return newPub;
        }

        return null;
    }

    async function updatePublication(id, updatedData) {
        showNotification('Updating publication...', 'info');
        console.log(`[UPDATE] Attempting to update publication with ID: ${id} in ${currentMode} mode`);

        const data = currentMode === 'local' 
            ? loadFromLocalStorage() 
            : await loadFromRemote();

        // Convert ID to string for consistent comparison
        const idStr = String(id);
        console.log(`[UPDATE] Looking for ID: "${idStr}" among ${data.publications.length} publications`);
        console.log(`[UPDATE] Available IDs:`, data.publications.map(p => String(p.id)));
        
        const index = data.publications.findIndex(pub => String(pub.id) === idStr);
        
        if (index === -1) {
            console.error(`[UPDATE] Publication not found with ID: ${idStr}`);
            showNotification('Publication not found', 'error');
            return false;
        }
        
        console.log(`[UPDATE] Found publication at index ${index}`);

        data.publications[index] = {
            ...data.publications[index],
            ...updatedData,
            id
        };

        const success = currentMode === 'local'
            ? saveToLocalStorage(data)
            : await saveToRemote(data);

        if (success) {
            showNotification(`✓ Publication updated in ${currentMode} storage`, 'success');
            refreshPublicationsList();
            return true;
        }

        return false;
    }

    async function deletePublication(id) {
        if (!confirm('Are you sure you want to delete this publication?')) {
            return false;
        }

        showNotification('Deleting publication...', 'info');
        console.log(`[DELETE] Attempting to delete publication with ID: ${id} in ${currentMode} mode`);

        const data = currentMode === 'local' 
            ? loadFromLocalStorage() 
            : await loadFromRemote();

        // Convert ID to string for consistent comparison
        const idStr = String(id);
        console.log(`[DELETE] Looking for ID: "${idStr}" among ${data.publications.length} publications`);
        console.log(`[DELETE] Available IDs:`, data.publications.map(p => String(p.id)));
        
        const index = data.publications.findIndex(pub => String(pub.id) === idStr);
        
        if (index === -1) {
            console.error(`[DELETE] Publication not found with ID: ${idStr}`);
            showNotification('Publication not found', 'error');
            return false;
        }
        
        console.log(`[DELETE] Found publication at index ${index}`);

        data.publications.splice(index, 1);

        // Save based on current mode
        const success = currentMode === 'local'
            ? saveToLocalStorage(data)
            : await saveToRemote(data);

        if (success) {
            showNotification(`✓ Publication deleted from ${currentMode} storage`, 'success');
            refreshPublicationsList();
            return true;
        }

        return false;
    }

    // Load and display all publications in the management list
    async function refreshPublicationsList() {
        const data = currentMode === 'local' 
            ? loadFromLocalStorage() 
            : await loadFromRemote();

        const container = document.getElementById('publications-list');
        if (!container) return;

        container.innerHTML = '';

        if (!data.publications || data.publications.length === 0) {
            container.innerHTML = '<p style="color: var(--color-text-secondary-light);">No publications found. Create one below!</p>';
            return;
        }

        data.publications.forEach(pub => {
            const item = createPublicationListItem(pub);
            container.appendChild(item);
        });

        // Update count
        const countElement = document.getElementById('pub-count');
        if (countElement) {
            countElement.textContent = data.publications.length;
        }
    }

    // Create a list item for publication management
    function createPublicationListItem(pub) {
        const div = document.createElement('div');
        div.className = 'publication-item';
        
        // Escape ID for safe HTML attribute usage
        const escapedId = String(pub.id).replace(/'/g, "\\'");
        
        div.innerHTML = `
            <div class="pub-info">
                <h3>${pub.title}</h3>
                <p class="pub-meta">${pub.authors} • ${pub.venue} • ${pub.year}</p>
                <p class="pub-desc">${pub.description ? pub.description.substring(0, 100) + '...' : 'No description'}</p>
            </div>
            <div class="pub-actions">
                <button onclick="window.crudOps.editPublication('${escapedId}')" class="btn-edit">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="window.crudOps.deletePublication('${escapedId}')" class="btn-delete">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        return div;
    }

    // Edit publication - populate form with existing data
    async function editPublication(id) {
        console.log(`[EDIT] Attempting to edit publication with ID: ${id} in ${currentMode} mode`);
        
        const data = currentMode === 'local' 
            ? loadFromLocalStorage() 
            : await loadFromRemote();

        // Convert ID to string for consistent comparison
        const idStr = String(id);
        console.log(`[EDIT] Looking for ID: "${idStr}" among ${data.publications.length} publications`);
        console.log(`[EDIT] Available IDs:`, data.publications.map(p => String(p.id)));
        
        const pub = data.publications.find(p => String(p.id) === idStr);
        
        if (!pub) {
            console.error(`[EDIT] Publication not found with ID: ${idStr}`);
            showNotification('Publication not found', 'error');
            return;
        }
        
        console.log(`[EDIT] Found publication:`, pub.title);

        // Populate form
        document.getElementById('pub-id').value = pub.id;
        document.getElementById('pub-title').value = pub.title;
        document.getElementById('pub-authors').value = pub.authors;
        document.getElementById('pub-venue').value = pub.venue;
        document.getElementById('pub-year').value = pub.year;
        document.getElementById('pub-link').value = pub.link;
        document.getElementById('pub-image').value = pub.image || '';
        document.getElementById('pub-image-alt').value = pub.imageAlt || '';
        document.getElementById('pub-description').value = pub.description || '';

        // Scroll to form
        document.getElementById('crud-form').scrollIntoView({ behavior: 'smooth' });
        
        // Update form title
        document.querySelector('#crud-form h2').textContent = 'Update Publication';
        document.querySelector('#crud-form button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Update Publication';
    }

    // Handle form submission (Create or Update)
    async function handleFormSubmit(event) {
        event.preventDefault();

        const id = document.getElementById('pub-id').value;
        const pubData = {
            title: document.getElementById('pub-title').value,
            authors: document.getElementById('pub-authors').value,
            venue: document.getElementById('pub-venue').value,
            year: document.getElementById('pub-year').value,
            link: document.getElementById('pub-link').value,
            image: document.getElementById('pub-image').value || 'https://via.placeholder.com/300x200?text=Publication',
            imageAlt: document.getElementById('pub-image-alt').value,
            description: document.getElementById('pub-description').value
        };

        if (id) {
            // Update existing
            await updatePublication(id, pubData);
        } else {
            // Create new
            await createPublication(pubData);
        }

        // Reset form
        document.getElementById('crud-form').reset();
        document.getElementById('pub-id').value = '';
        document.querySelector('#crud-form h2').textContent = 'Create New Publication';
        document.querySelector('#crud-form button[type="submit"]').innerHTML = '<i class="fas fa-plus"></i> Create Publication';
    }

    // Switch between local and remote storage
    function switchMode(mode) {
        currentMode = mode;
        
        // Update UI
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

        // Update indicator
        const indicator = document.getElementById('current-mode');
        if (indicator) {
            indicator.textContent = mode === 'local' ? 'Local Storage' : 'Remote (JSONBin)';
        }

        // Refresh list
        refreshPublicationsList();
    }

    // Show notification message
    function showNotification(message, type = 'info') {
        const existing = document.getElementById('crud-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.id = 'crud-notification';
        notification.textContent = message;
        
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

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Initialize on page load
    function init() {
        // Set up form submission
        const form = document.getElementById('crud-form');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }

        // Load initial list
        refreshPublicationsList();

        console.log('CRUD operations initialized');
    }

    // Export functions to global scope
    window.crudOps = {
        createPublication,
        updatePublication,
        deletePublication,
        editPublication,
        switchMode,
        refreshPublicationsList,
        init
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

