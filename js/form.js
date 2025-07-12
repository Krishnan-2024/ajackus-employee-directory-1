// This is the form controller - it handles everything that happens on the add/edit employee page
// Think of it as the "brain" that manages the form functionality and validation
class FormManager {
    constructor() {
        // When the form starts up, we need to set some initial values
        // These are like settings that control how the form behaves
        
        // This will hold the ID of the employee we're editing (if we're editing)
        // If it's null, we're adding a new employee
        this.employeeId = null;
        
        // This flag tells us if we're in "edit mode" or "add mode"
        // It affects things like the page title and button text
        this.isEditMode = false;
        
        // This object will hold the form data as the user types
        // We use this to check for unsaved changes
        this.formData = {};
        
        // These are the rules that determine if the form data is valid
        // Each field has its own validation rules (required, min length, etc.)
        this.validationRules = {
            firstName: { required: true, minLength: 2, maxLength: 50 },
            lastName: { required: true, minLength: 2, maxLength: 50 },
            email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
            department: { required: true, minLength: 2, maxLength: 50 },
            role: { required: true, minLength: 2, maxLength: 50 }
        };
        
        // Now let's set up the form and load any existing data
        this.initializeForm();
        this.initializeEventListeners();
        this.loadEmployeeData();
    }

    // This method sets up the form when the page loads
    // It's like preparing a form before someone starts filling it out
    initializeForm() {
        // Check if there's an employee ID in the URL (like form.html?id=5)
        // This tells us if we're editing an existing employee
        const urlParams = new URLSearchParams(window.location.search);
        this.employeeId = urlParams.get('id');
        
        // If we have an ID, we're in edit mode; otherwise, we're adding a new employee
        this.isEditMode = !!this.employeeId;

        // Update the page title and button text based on whether we're adding or editing
        this.updateFormHeader();
        
        // Set up the form fields with validation and character counters
        this.initializeFormFields();
    }

    // This method updates the page title and button text based on the mode
    // It's like changing the sign on a door from "Add Employee" to "Edit Employee"
    updateFormHeader() {
        // Find the elements we need to update
        const title = document.getElementById('formTitle');
        const subtitle = document.getElementById('formSubtitle');
        const submitBtn = document.getElementById('submitBtn');

        // If we're editing an existing employee
        if (this.isEditMode) {
            if (title) title.textContent = 'Edit Employee';
            if (subtitle) subtitle.textContent = 'Update employee information';
            if (submitBtn) submitBtn.textContent = 'Update Employee';
        } else {
            // If we're adding a new employee
            if (title) title.textContent = 'Add New Employee';
            if (subtitle) subtitle.textContent = 'Enter employee details below';
            if (submitBtn) submitBtn.textContent = 'Add Employee';
        }
    }

    // This method sets up all the form fields with validation and event listeners
    // It's like connecting all the form inputs to their validation functions
    initializeFormFields() {
        // List of all the form fields we need to set up
        const formFields = ['firstName', 'lastName', 'email', 'department', 'role'];
        
        // For each field, set up validation when the user leaves the field (blur event)
        // and clear errors when the user starts typing (input event)
        formFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                // When the user leaves a field, validate it
                field.addEventListener('blur', () => this.validateField(fieldName));
                
                // When the user types in a field, clear any error messages
                field.addEventListener('input', () => this.clearFieldError(fieldName));
            }
        });

        // For text fields, we also want to show character counters
        // This helps users know how much they can type
        const textFields = ['firstName', 'lastName', 'department', 'role'];
        textFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                // Update the character counter as the user types
                field.addEventListener('input', () => this.updateCharacterCounter(fieldName));
            }
        });
    }

    // This method sets up all the click handlers and form submission
    // It's like connecting all the buttons to their functions
    initializeEventListeners() {
        // Set up the form to handle submission (when user clicks submit button)
        const form = document.getElementById('employeeForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Set up the cancel button to go back to the dashboard
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.handleCancel());
        }

        // Set up real-time email validation as the user types
        const emailField = document.getElementById('email');
        if (emailField) {
            emailField.addEventListener('input', () => this.validateEmailFormat());
        }
    }

    // This method loads existing employee data if we're in edit mode
    // It's like opening a file to edit it
    loadEmployeeData() {
        // If we're not in edit mode, there's nothing to load
        if (!this.isEditMode) return;

        // Try to find the employee in our data
        const employee = employeeDataManager.getEmployeeById(parseInt(this.employeeId));
        
        // If we can't find the employee, show an error and go back to dashboard
        if (!employee) {
            this.showMessage('Employee not found!', 'error');
            
            // Wait 2 seconds, then go back to the dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
            return;
        }

        // If we found the employee, fill in the form fields with their data
        this.populateFormFields(employee);
    }

    // This method fills in the form fields with existing employee data
    // It's like copying information from a business card to a form
    populateFormFields(employee) {
        // List of all the fields we need to fill in
        const fields = ['firstName', 'lastName', 'email', 'department', 'role'];
        
        // For each field, if the employee has data for it, put it in the form
        fields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field && employee[fieldName]) {
                field.value = employee[fieldName];
                
                // Update the character counter to show the current length
                this.updateCharacterCounter(fieldName);
            }
        });
    }

    // This method handles when the user submits the form
    // It's like processing a completed form
    handleFormSubmit(e) {
        // Prevent the form from submitting normally (which would reload the page)
        e.preventDefault();
        
        // Check if all the form fields are valid
        if (this.validateForm()) {
            // If everything is valid, submit the form data
            this.submitForm();
        }
    }

    // This method checks if the entire form is valid
    // It's like checking if all the required fields are filled out correctly
    validateForm() {
        // Start by assuming the form is valid
        let isValid = true;
        
        // Get a list of all the field names we need to validate
        const fields = Object.keys(this.validationRules);

        // Check each field one by one
        fields.forEach(fieldName => {
            // If any field fails validation, mark the whole form as invalid
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        });

        // Return whether the entire form is valid
        return isValid;
    }

    // This method validates a single form field
    // It's like checking if one specific field is filled out correctly
    validateField(fieldName) {
        // Find the form field and its error message element
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(`${fieldName}Error`);
        const rules = this.validationRules[fieldName];
        
        // If we can't find the field or don't have rules for it, assume it's valid
        if (!field || !rules) return true;

        // Get the value the user entered and remove extra spaces
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Check if the field is required but empty
        if (rules.required && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        // Check if the field is too short
        else if (rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = `Minimum ${rules.minLength} characters required`;
        }
        // Check if the field is too long
        else if (rules.maxLength && value.length > rules.maxLength) {
            isValid = false;
            errorMessage = `Maximum ${rules.maxLength} characters allowed`;
        }
        // Check if the field matches a specific pattern (like email format)
        else if (rules.pattern && !rules.pattern.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }

        // Update the visual appearance of the field and show/hide error message
        this.updateFieldValidation(fieldName, isValid, errorMessage);
        
        // Return whether this field is valid
        return isValid;
    }

    // This method updates the visual appearance of a field based on validation
    // It's like putting a red border around invalid fields and green around valid ones
    updateFieldValidation(fieldName, isValid, errorMessage = '') {
        // Find the form field, error message, and the form group container
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(`${fieldName}Error`);
        const formGroup = field?.closest('.form-group');

        // Update the field's appearance
        if (field) {
            // Add or remove the 'error' class (red border)
            field.classList.toggle('error', !isValid);
            
            // Add or remove the 'valid' class (green border) if the field has content
            field.classList.toggle('valid', isValid && field.value.trim() !== '');
        }

        // Update the error message
        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.classList.toggle('show', !isValid);
        }

        // Update the form group's appearance
        if (formGroup) {
            formGroup.classList.toggle('valid', isValid && field.value.trim() !== '');
        }
    }

    // This method clears the error state of a field
    // It's like removing the red border when the user starts typing
    clearFieldError(fieldName) {
        // Find the form field, error message, and form group
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(`${fieldName}Error`);
        const formGroup = field?.closest('.form-group');

        // Remove the error styling from the field
        if (field) {
            field.classList.remove('error');
        }

        // Hide the error message
        if (errorElement) {
            errorElement.classList.remove('show');
        }

        // Remove the valid styling from the form group
        if (formGroup) {
            formGroup.classList.remove('valid');
        }
    }

    // This method validates the email format in real-time
    // It's like checking if an email address looks correct as the user types
    validateEmailFormat() {
        // Find the email field and its error message
        const emailField = document.getElementById('email');
        const emailError = document.getElementById('emailError');
        
        // If we can't find the elements, stop here
        if (!emailField || !emailError) return;

        // Get the email value and remove extra spaces
        const email = emailField.value.trim();
        
        // This is a pattern that matches most valid email addresses
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        // If there's an email and it doesn't match the pattern, show an error
        if (email && !emailPattern.test(email)) {
            emailField.classList.add('error');
            emailError.textContent = 'Please enter a valid email address';
            emailError.classList.add('show');
        } else {
            // If the email is valid or empty, remove the error
            emailField.classList.remove('error');
            emailError.classList.remove('show');
        }
    }

    // This method updates the character counter for text fields
    // It's like showing "15/50 characters" to help users know how much they can type
    updateCharacterCounter(fieldName) {
        // Find the field and its counter element
        const field = document.getElementById(fieldName);
        const counter = document.getElementById(`${fieldName}Counter`);
        
        // If we can't find the elements, stop here
        if (!field || !counter) return;

        // Count how many characters the user has typed
        const currentLength = field.value.length;
        
        // Get the maximum allowed length from the validation rules
        const maxLength = this.validationRules[fieldName]?.maxLength || 50;
        
        // Update the counter text (e.g., "15/50")
        counter.textContent = `${currentLength}/${maxLength}`;
        
        // Change the counter color based on how close to the limit the user is
        counter.classList.toggle('warning', currentLength > maxLength * 0.8); // Yellow when 80% full
        counter.classList.toggle('danger', currentLength > maxLength); // Red when over limit
    }

    // This method submits the form data to add or update an employee
    // It's like sending the completed form to be processed
    submitForm() {
        // Find the form element
        const form = document.getElementById('employeeForm');
        if (!form) return;

        // Show a loading state so the user knows something is happening
        form.classList.add('form-loading');
        
        // Collect all the data from the form fields
        const formData = this.collectFormData();
        
        // Simulate what it would be like to send data to a server
        // We add a delay to make it feel more realistic
        setTimeout(() => {
            try {
                // If we're editing an existing employee
                if (this.isEditMode) {
                    this.updateEmployee(formData);
                } else {
                    // If we're adding a new employee
                    this.addEmployee(formData);
                }
            } catch (error) {
                // If something goes wrong, show an error message
                this.showMessage('An error occurred. Please try again.', 'error');
            } finally {
                // Always remove the loading state, whether it succeeded or failed
                form.classList.remove('form-loading');
            }
        }, 1000); // Wait 1 second to simulate server processing time
    }

    // This method collects all the data from the form fields
    // It's like gathering all the information from a completed form
    collectFormData() {
        // List of all the fields we want to collect
        const fields = ['firstName', 'lastName', 'email', 'department', 'role'];
        const formData = {};

        // For each field, get the value and store it in our data object
        fields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                // Store the value with extra spaces removed
                formData[fieldName] = field.value.trim();
            }
        });

        // Return all the collected data
        return formData;
    }

    // This method adds a new employee to the system
    // It's like creating a new record in a database
    addEmployee(formData) {
        // Use our data manager to add the new employee
        const newEmployee = employeeDataManager.addEmployee(formData);
        
        // If the employee was added successfully
        if (newEmployee) {
            // Show a success message
            this.showMessage('Employee added successfully!', 'success');
            
            // Wait 1.5 seconds, then go back to the dashboard
            // This gives the user time to see the success message
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            // If adding failed, show an error message
            this.showMessage('Failed to add employee. Please try again.', 'error');
        }
    }

    // This method updates an existing employee in the system
    // It's like editing a record in a database
    updateEmployee(formData) {
        // Use our data manager to update the employee
        const updatedEmployee = employeeDataManager.updateEmployee(parseInt(this.employeeId), formData);
        
        // If the employee was updated successfully
        if (updatedEmployee) {
            // Show a success message
            this.showMessage('Employee updated successfully!', 'success');
            
            // Wait 1.5 seconds, then go back to the dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            // If updating failed, show an error message
            this.showMessage('Failed to update employee. Please try again.', 'error');
        }
    }

    // This method handles when the user clicks the cancel button
    // It's like asking "Are you sure you want to leave without saving?"
    handleCancel() {
        // Check if the user has made any changes to the form
        if (this.hasUnsavedChanges()) {
            // If there are unsaved changes, ask for confirmation
            if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
                // If they confirm, go back to the dashboard
                window.location.href = 'dashboard.html';
            }
            // If they don't confirm, stay on the form page
        } else {
            // If there are no unsaved changes, just go back to the dashboard
            window.location.href = 'dashboard.html';
        }
    }

    // This method checks if the user has made any changes to the form
    // It's like checking if any fields have been modified
    hasUnsavedChanges() {
        // List of all the fields we want to check
        const fields = ['firstName', 'lastName', 'email', 'department', 'role'];
        
        // Check each field to see if it has any content
        for (const fieldName of fields) {
            const field = document.getElementById(fieldName);
            if (field && field.value.trim() !== '') {
                // If any field has content, there are unsaved changes
                return true;
            }
        }
        
        // If no fields have content, there are no unsaved changes
        return false;
    }

    // This method shows messages to the user (success, error, etc.)
    // It's like showing a notification popup
    showMessage(message, type = 'info') {
        // Find the message container where we'll display the message
        const messageContainer = document.getElementById('messageContainer');
        if (!messageContainer) return;

        // Choose the right CSS class based on the message type
        const alertClass = type === 'success' ? 'alert-success' : 
                          type === 'error' ? 'alert-danger' : 'alert-warning';

        // Create the message HTML with a close button
        messageContainer.innerHTML = `
            <div class="alert ${alertClass}">
                ${message}
                <button type="button" class="close-btn" onclick="this.parentElement.remove()">&times;</button>
            </div>
        `;

        // Automatically hide the message after 5 seconds
        // This prevents the screen from getting cluttered with old messages
        setTimeout(() => {
            const alert = messageContainer.querySelector('.alert');
            if (alert) {
                alert.remove();
            }
        }, 5000);
    }

    // This method resets the form back to its original state
    // It's like clearing all the fields and starting over
    resetForm() {
        // Find the form element
        const form = document.getElementById('employeeForm');
        if (form) {
            // Reset all the form fields to their default values
            form.reset();
            
            // Clear all error states and styling
            const fields = Object.keys(this.validationRules);
            fields.forEach(fieldName => {
                this.clearFieldError(fieldName);
                this.updateCharacterCounter(fieldName);
            });
        }
    }
}

// This runs when the page finishes loading
// It's like turning on the form when the page is ready
document.addEventListener('DOMContentLoaded', function() {
    // Create the form manager and store it globally so other functions can access it
    window.formManager = new FormManager();
});

// These are global functions that can be called from HTML onclick attributes
// They're like shortcuts that other parts of the code can use

// Function to reset the form (called from the Reset button)
function resetForm() {
    if (window.formManager) {
        formManager.resetForm();
    }
}

// Function to validate a specific field (can be called from anywhere)
function validateField(fieldName) {
    if (window.formManager) {
        return formManager.validateField(fieldName);
    }
    return true;
} 