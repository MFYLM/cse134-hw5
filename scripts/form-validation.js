let form_errors = [];

const form = document.querySelector('.contact-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const messageTextarea = document.getElementById('message');
const errorOutput = document.getElementById('error-message');
const infoOutput = document.getElementById('info-message');
const charCounter = document.getElementById('char-counter');
const charCount = document.getElementById('char-count');
const formErrorsInput = document.getElementById('form-errors');

const nameError = document.getElementById('name-error');
const emailError = document.getElementById('email-error');
const messageError = document.getElementById('message-error');

const MESSAGE_MAX_LENGTH = 500;
const MESSAGE_WARNING_THRESHOLD = 50;

/**
 * Show error message with fade-out effect
 */
function showErrorMessage(message, duration = 3000) {
    errorOutput.textContent = message;
    errorOutput.style.opacity = '1';
    
    setTimeout(() => {
        errorOutput.style.transition = 'opacity 1s ease';
        errorOutput.style.opacity = '0';
        setTimeout(() => {
            errorOutput.textContent = '';
            errorOutput.style.transition = '';
            errorOutput.style.opacity = '1';
        }, 2000);
    }, duration);
}


function showFieldError(errorElement, message) {
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearFieldError(errorElement) {
    if (errorElement) {
        errorElement.textContent = '';
    }
}

function logError(fieldName, errorType, errorMessage, value = '') {
    const error = {
        field: fieldName,
        type: errorType,
        message: errorMessage,
        value: value,
        timestamp: new Date().toISOString()
    };
    form_errors.push(error);
    console.log('Error logged:', error);
}

function validateInput(input) {
    const pattern = input.getAttribute('pattern');
    if (!pattern) return { valid: true };
    
    const value = input.value;
    if (value.length === 0) return { valid: true };
    
    try {
        const fullRegex = new RegExp(`^${pattern}$`);
        
        if (!fullRegex.test(value)) {
            if (pattern === '[A-Za-z\\s]+') {
                for (let i = 0; i < value.length; i++) {
                    if (!/[A-Za-z\s]/.test(value[i])) {
                        return { valid: false, illegalChar: value[i], position: i };
                    }
                }
            }
            
            return { valid: false, reason: 'invalid_format' };
        }
        
        return { valid: true };
    } catch (error) {
        console.error('Invalid regex pattern:', pattern, error);
        return { valid: true };
    }
}

function setupInputMasking(input, fieldName, errorElement) {
    let lastErrorValue = '';
    
    input.addEventListener('input', (e) => {
        const pattern = input.getAttribute('pattern');
        if (!pattern) return;
        
        const value = input.value;
        
        if (value === lastErrorValue) return;
        
        const validation = validateInput(input);
        
        if (!validation.valid) {            
            let errorMessage = '';
            if (validation.illegalChar) {
                errorMessage = `Illegal character "${validation.illegalChar}". Only ${getFieldDescription(fieldName)} allowed.`;
                input.setCustomValidity(errorMessage);
                showFieldError(errorElement, errorMessage);
                lastErrorValue = value;
            } else if (validation.reason === 'invalid_format') {
                errorMessage = `Invalid ${fieldName} format. ${getFormatHint(fieldName)}`;
                input.setCustomValidity(errorMessage);
                showFieldError(errorElement, errorMessage);
                lastErrorValue = value;
            }
        } else {
            input.setCustomValidity('');
            clearFieldError(errorElement);
            lastErrorValue = '';
        }
    });
}

function getFieldDescription(fieldName) {
    const descriptions = {
        'name': 'letters and spaces',
        'email': 'valid email characters',
        'message': 'any printable characters'
    };
    return descriptions[fieldName] || 'valid characters';
}

function getFormatHint(fieldName) {
    const hints = {
        'name': 'Use only letters and spaces',
        'email': 'Must be like: user@example.com',
        'message': 'Enter a valid message'
    };
    return hints[fieldName] || '';
}

function updateCharCounter() {
    const currentLength = messageTextarea.value.length;
    const remaining = MESSAGE_MAX_LENGTH - currentLength;
    
    charCount.textContent = remaining;
    
    charCounter.classList.remove('warning', 'error');
    
    if (remaining <= 0) {
        charCounter.classList.add('error');
    } else if (remaining <= MESSAGE_WARNING_THRESHOLD) {
        charCounter.classList.add('warning');
    }
}

function setupCustomValidation() {
    nameInput.addEventListener('invalid', (e) => {
        e.preventDefault();
        let errorMsg = '';
        if (nameInput.validity.valueMissing) {
            errorMsg = 'Name is required';
        } else if (nameInput.validity.tooShort) {
            errorMsg = 'Name must be at least 2 characters';
        } else if (nameInput.validity.patternMismatch) {
            errorMsg = 'Name can only contain letters and spaces';
        }
        nameInput.setCustomValidity(errorMsg);
        showFieldError(nameError, errorMsg);
    });
    
    nameInput.addEventListener('input', () => {
        const validation = validateInput(nameInput);
        if (validation.valid && nameInput.checkValidity()) {
            nameInput.setCustomValidity('');
            clearFieldError(nameError);
        }
    });
    
    emailInput.addEventListener('invalid', (e) => {
        e.preventDefault();
        let errorMsg = '';
        if (emailInput.validity.valueMissing) {
            errorMsg = 'Email is required';
        } else if (emailInput.validity.typeMismatch || emailInput.validity.patternMismatch) {
            errorMsg = 'Please enter a valid email address';
        }
        emailInput.setCustomValidity(errorMsg);
        showFieldError(emailError, errorMsg);
    });
    
    emailInput.addEventListener('input', () => {
        const validation = validateInput(emailInput);
        if (validation.valid && emailInput.checkValidity()) {
            emailInput.setCustomValidity('');
            clearFieldError(emailError);
        }
    });
    
    messageTextarea.addEventListener('invalid', (e) => {
        e.preventDefault();
        let errorMsg = '';
        if (messageTextarea.validity.valueMissing) {
            errorMsg = 'Message is required';
        } else if (messageTextarea.validity.tooShort) {
            errorMsg = 'Message must be at least 10 characters';
        } else if (messageTextarea.validity.tooLong) {
            errorMsg = 'Message must not exceed 500 characters';
        }
        messageTextarea.setCustomValidity(errorMsg);
        showFieldError(messageError, errorMsg);
    });
    
    messageTextarea.addEventListener('input', () => {
        if (messageTextarea.checkValidity()) {
            messageTextarea.setCustomValidity('');
            clearFieldError(messageError);
        }
        updateCharCounter();
    });
}

function setupFormSubmission() {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        nameInput.setCustomValidity('');
        emailInput.setCustomValidity('');
        messageTextarea.setCustomValidity('');
        
        const isValid = form.checkValidity();

        if (!isValid) {
            form.reportValidity();
            
            if (nameInput.validity.valueMissing || !nameInput.checkValidity()) {
                logError('name', 'submit_attempt_invalid', 'Submit attempted with invalid name', nameInput.value);
            }
            if (emailInput.validity.valueMissing || !emailInput.checkValidity()) {
                logError('email', 'submit_attempt_invalid', 'Submit attempted with invalid email', emailInput.value);
            }
            if (messageTextarea.validity.valueMissing || !messageTextarea.checkValidity()) {
                logError('message', 'submit_attempt_invalid', 'Submit attempted with invalid message', messageTextarea.value);
            }
            
            logError('form', 'submit_blocked', 'Form submission blocked due to validation errors');
            showErrorMessage('Please fix all errors before submitting', 3000);
            return;
        }
        
        formErrorsInput.value = JSON.stringify(form_errors);
        
        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: form.method,
                body: formData
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');                
            } else {
                showErrorMessage('There was an error submitting the form. Please try again.');
                logError('form', 'submission_error', 'Form submission failed with status: ' + response.status);
            }
        } catch (error) {
            showErrorMessage('Network error. Please check your connection and try again.');
            logError('form', 'network_error', 'Network error: ' + error.message);
        }
    });
}

function setupFormReset() {
    form.addEventListener('reset', () => {
        form_errors = [];
        formErrorsInput.value = '[]';
        errorOutput.textContent = '';
        infoOutput.textContent = '';
        
        clearFieldError(nameError);
        clearFieldError(emailError);
        clearFieldError(messageError);
        
        charCount.textContent = MESSAGE_MAX_LENGTH;
        charCounter.classList.remove('warning', 'error');
        
        nameInput.setCustomValidity('');
        emailInput.setCustomValidity('');
        messageTextarea.setCustomValidity('');        
    });
}

function init() {
    if (!form) {
        console.error('Form not found');
        return;
    }
    
    setupInputMasking(nameInput, 'name', nameError);
    setupInputMasking(emailInput, 'email', emailError);
    
    setupCustomValidation();
    
    updateCharCounter();
    
    setupFormSubmission();
    
    setupFormReset();
        
    console.log('Form validation initialized');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
