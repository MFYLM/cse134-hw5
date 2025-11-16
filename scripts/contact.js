class HelloWorld extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        console.log('Hello World!');
    }
}

customElements.define('hello-world', HelloWorld);



// Contact form dialog handling
const contactDialog = document.getElementById('contactDialog');
const contactForm = document.querySelector('.contact-form');

// Add close button functionality
if (contactDialog && contactForm) {
    // Create and add a close button to the form
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.textContent = 'Cancel';
    closeButton.className = 'close-dialog-btn';
    
    // Create button container if it doesn't exist
    let buttonContainer = contactForm.querySelector('.form-buttons');
    if (!buttonContainer) {
        buttonContainer = document.createElement('div');
        buttonContainer.className = 'form-buttons';
        
        // Move submit button to container
        const submitButton = contactForm.querySelector('button[type="submit"]');
        if (submitButton) {
            buttonContainer.appendChild(closeButton);
            buttonContainer.appendChild(submitButton);
            contactForm.querySelector('fieldset').appendChild(buttonContainer);
        }
    } else {
        buttonContainer.insertBefore(closeButton, buttonContainer.firstChild);
    }
    
    // Close dialog on cancel button click
    closeButton.addEventListener('click', () => {
        contactDialog.close();
    });
    
    // Close dialog when clicking outside
    contactDialog.addEventListener('click', (e) => {
        const rect = contactDialog.getBoundingClientRect();
        if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
        ) {
            contactDialog.close();
        }
    });
    
    // Handle form submission
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // Show loading state
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                // Success
                alert('Thank you for your message! I\'ll get back to you soon.');
                contactForm.reset();
                contactDialog.close();
            } else {
                // Error
                alert('Oops! There was a problem submitting your form. Please try again.');
            }
        } catch (error) {
            alert('Oops! There was a problem submitting your form. Please try again.');
            console.error('Form submission error:', error);
        } finally {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
}