// This is the main dashboard controller - it handles everything that happens on the employee list page
// Think of it as the "brain" that manages the dashboard functionality
class DashboardManager {
    constructor() {
        // When the dashboard starts up, we need to set some initial values
        // These are like settings that control how the dashboard behaves
        
        // Which page of employees we're currently looking at (start with page 1)
        this.currentPage = 1;
        
        // How many employees to show on each page (start with 10)
        this.itemsPerPage = 10;
        
        // This will hold the list of employees after we apply search/filter
        // We start with an empty array and fill it when we load data
        this.filteredEmployees = [];
        
        // This object keeps track of what filters are currently active
        // For example: { department: "Engineering", role: "Developer" }
        this.currentFilters = {};
        
        // This object keeps track of how we're sorting the employees
        // For example: { field: "firstName", order: "asc" } means sort by first name A-Z
        this.currentSort = { field: 'firstName', order: 'asc' };
        
        // This flag tells us if we're currently loading data
        // We use this to show loading spinners and prevent multiple requests
        this.isLoading = false;
        
        // Now let's set up all the event listeners and load the initial data
        this.initializeEventListeners();
        this.loadEmployees();
    }

    // This method sets up all the click handlers and input listeners
    // It's like connecting all the buttons and inputs to their functions
    initializeEventListeners() {
        // Set up the search box to respond when someone types
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            // We use a "debounced" search, which means it waits until the user stops typing
            // This prevents the search from running on every single keystroke
            searchInput.addEventListener('input', this.debounce(() => {
                this.handleSearch();
            }, 300)); // Wait 300 milliseconds after the user stops typing
        }

        // Set up the filter button to open/close the filter sidebar
        const filterBtn = document.getElementById('filterBtn');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => this.toggleFilterSidebar());
        }

        // Set up the close button in the filter sidebar
        const closeFilterBtn = document.getElementById('closeFilter');
        if (closeFilterBtn) {
            closeFilterBtn.addEventListener('click', () => this.toggleFilterSidebar());
        }

        // Set up the "Apply Filters" button
        const applyFiltersBtn = document.getElementById('applyFilters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => this.applyFilters());
        }

        // Set up the "Clear All" button to reset all filters
        const clearFiltersBtn = document.getElementById('clearFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }

        // This is a special listener that closes the filter sidebar when someone clicks outside of it
        // It makes the interface feel more natural and intuitive
        document.addEventListener('click', (e) => {
            const filterSidebar = document.getElementById('filterSidebar');
            const filterBtn = document.getElementById('filterBtn');
            
            // If someone clicked outside the sidebar and outside the filter button
            if (filterSidebar && !filterSidebar.contains(e.target) && !filterBtn.contains(e.target)) {
                this.closeFilterSidebar();
            }
        });
    }

    // This method loads all the employee data and displays it
    // It's like opening a book to the first page
    loadEmployees() {
        // Set the loading flag to true so we can show a loading spinner
        this.isLoading = true;
        this.showLoadingState();

        // We add a small delay to simulate what it would be like if we were loading from a real server
        // This gives users visual feedback that something is happening
        setTimeout(() => {
            // Get all employees from our data manager
            this.filteredEmployees = employeeDataManager.getAllEmployees();
            
            // Display the employees on the page
            this.renderEmployees();
            
            // Update the pagination controls (page numbers, etc.)
            this.updatePagination();
            
            // Fill in the filter dropdown menus with available options
            this.populateFilterOptions();
            
            // We're done loading, so turn off the loading flag
            this.isLoading = false;
            this.hideLoadingState();
        }, 500); // Wait 500 milliseconds to simulate server delay
    }

    // This method creates the HTML for displaying employees on the page
    // It's like creating a photo album with employee cards
    renderEmployees() {
        // Find the container where we want to put the employee cards
        const container = document.getElementById('employeeContainer');
        if (!container) return; // If we can't find the container, stop here

        // Calculate which employees to show on the current page
        // For example, if we're on page 2 and showing 10 per page, show employees 11-20
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const employeesToShow = this.filteredEmployees.slice(startIndex, endIndex);

        // If there are no employees to show, display a friendly message
        if (employeesToShow.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <h3>No employees found</h3>
                    <p>Try adjusting your search or filter criteria.</p>
                </div>
            `;
            return;
        }

        // Create HTML for each employee and join them all together
        // This is like creating a bunch of business cards and putting them in a grid
        container.innerHTML = employeesToShow.map(employee => this.createEmployeeCard(employee)).join('');
    }

    // This method creates the HTML for a single employee card
    // It's like designing a business card template
    createEmployeeCard(employee) {
        return `
            <div class="employee-card" data-employee-id="${employee.id}">
                <div class="employee-header">
                    <div>
                        <div class="employee-name">${employee.firstName} ${employee.lastName}</div>
                        <div class="employee-id">ID: ${employee.id}</div>
                    </div>
                </div>
                <div class="employee-info">
                    <div class="employee-info-item">
                        <span class="employee-info-label">Email:</span>
                        <span class="employee-info-value">${employee.email}</span>
                    </div>
                    <div class="employee-info-item">
                        <span class="employee-info-label">Department:</span>
                        <span class="employee-info-value">${employee.department}</span>
                    </div>
                    <div class="employee-info-item">
                        <span class="employee-info-label">Role:</span>
                        <span class="employee-info-value">${employee.role}</span>
                    </div>
                </div>
                <div class="employee-actions">
                    <button class="btn btn-warning btn-sm" onclick="dashboardManager.editEmployee(${employee.id})">
                        Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="dashboardManager.deleteEmployee(${employee.id})">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }

    // This method handles the search functionality
    // It's like having a search box that filters the employee list as you type
    handleSearch() {
        // Get what the user typed in the search box and remove extra spaces
        const searchTerm = document.getElementById('searchInput').value.trim();
        
        // If the search box is empty, show all employees
        if (searchTerm === '') {
            this.filteredEmployees = employeeDataManager.getAllEmployees();
        } else {
            // If there's a search term, find employees that match
            this.filteredEmployees = employeeDataManager.searchEmployees(searchTerm);
        }

        // Reset to the first page since we're showing different results
        this.currentPage = 1;
        
        // Apply any current sorting to the search results
        this.applySorting();
        
        // Update the display with the new results
        this.renderEmployees();
        this.updatePagination();
    }

    // This method opens or closes the filter sidebar
    // It's like opening and closing a drawer
    toggleFilterSidebar() {
        const sidebar = document.getElementById('filterSidebar');
        if (sidebar) {
            // Toggle means "if it's open, close it; if it's closed, open it"
            sidebar.classList.toggle('open');
        }
    }

    // This method closes the filter sidebar
    // It's like closing a drawer
    closeFilterSidebar() {
        const sidebar = document.getElementById('filterSidebar');
        if (sidebar) {
            sidebar.classList.remove('open');
        }
    }

    // This method applies the filters that the user has selected
    // It's like using multiple filters on a shopping website
    applyFilters() {
        // Get the values from all the filter inputs
        const firstNameFilter = document.getElementById('firstNameFilter')?.value || '';
        const departmentFilter = document.getElementById('departmentFilter')?.value || '';
        const roleFilter = document.getElementById('roleFilter')?.value || '';

        // Store these filter values so we can remember what's active
        this.currentFilters = {
            firstName: firstNameFilter,
            department: departmentFilter,
            role: roleFilter
        };

        // Apply the filters to get the filtered employee list
        this.filteredEmployees = employeeDataManager.filterEmployees(this.currentFilters);
        
        // Reset to the first page since we're showing different results
        this.currentPage = 1;
        
        // Apply any current sorting to the filtered results
        this.applySorting();
        
        // Update the display
        this.renderEmployees();
        this.updatePagination();
        
        // Close the filter sidebar since we're done
        this.closeFilterSidebar();
        
        // Show a success message to let the user know the filters were applied
        this.showMessage('Filters applied successfully!', 'success');
    }

    // This method clears all the active filters
    // It's like resetting all the filter settings back to "show everything"
    clearFilters() {
        // Clear our stored filter settings
        this.currentFilters = {};
        
        // Get all employees (no filters applied)
        this.filteredEmployees = employeeDataManager.getAllEmployees();
        
        // Clear all the filter input fields so they're empty
        const filterInputs = ['firstNameFilter', 'departmentFilter', 'roleFilter'];
        filterInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });

        // Reset to the first page
        this.currentPage = 1;
        
        // Apply any current sorting
        this.applySorting();
        
        // Update the display
        this.renderEmployees();
        this.updatePagination();
        
        // Close the filter sidebar
        this.closeFilterSidebar();
        
        // Show a message that filters were cleared
        this.showMessage('Filters cleared!', 'success');
    }

    // This method handles the sorting functionality
    // It's like organizing a list alphabetically or by any other criteria
    handleSort() {
        // Get the current sort settings from the dropdown menus
        const sortBy = document.getElementById('sortBy')?.value || 'firstName';
        const sortOrder = document.getElementById('sortOrder')?.value || 'asc';

        // Store these sort settings
        this.currentSort = { field: sortBy, order: sortOrder };
        
        // Apply the sorting to our employee list
        this.applySorting();
        
        // Update the display with the sorted results
        this.renderEmployees();
    }

    // This method applies the current sort settings to the employee list
    // It's like organizing a deck of cards
    applySorting() {
        this.filteredEmployees = employeeDataManager.sortEmployees(
            this.filteredEmployees,
            this.currentSort.field,
            this.currentSort.order
        );
    }

    // This method updates the pagination controls (page numbers, etc.)
    // It's like updating the page numbers in a book
    updatePagination() {
        // Calculate how many total employees we have and how many pages that makes
        const totalItems = this.filteredEmployees.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        // Calculate which employees are being shown (e.g., "Showing 11-20 of 45 employees")
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, totalItems);

        // Find the pagination container where we'll put the page controls
        const paginationContainer = document.getElementById('paginationContainer');
        if (!paginationContainer) return;

        // If there are no employees to show, don't show pagination
        if (totalItems === 0) {
            paginationContainer.innerHTML = '';
            return;
        }

        // Create the pagination HTML with page numbers and navigation buttons
        paginationContainer.innerHTML = `
            <div class="pagination-info">
                Showing ${startItem} to ${endItem} of ${totalItems} employees
            </div>
            <div class="pagination-controls">
                <button class="btn btn-secondary btn-sm" onclick="dashboardManager.goToPage(${this.currentPage - 1})" ${this.currentPage <= 1 ? 'disabled' : ''}>
                    Previous
                </button>
                ${this.generatePageNumbers(totalPages)}
                <button class="btn btn-secondary btn-sm" onclick="dashboardManager.goToPage(${this.currentPage + 1})" ${this.currentPage >= totalPages ? 'disabled' : ''}>
                    Next
                </button>
            </div>
            <div class="page-size-selector">
                <label>Show:</label>
                <select onchange="dashboardManager.changePageSize(this.value)">
                    <option value="10" ${this.itemsPerPage === 10 ? 'selected' : ''}>10</option>
                    <option value="25" ${this.itemsPerPage === 25 ? 'selected' : ''}>25</option>
                    <option value="50" ${this.itemsPerPage === 50 ? 'selected' : ''}>50</option>
                    <option value="100" ${this.itemsPerPage === 100 ? 'selected' : ''}>100</option>
                </select>
            </div>
        `;
    }

    // This method creates the page number buttons
    // It's like creating numbered tabs for different pages
    generatePageNumbers(totalPages) {
        let pageNumbers = '';
        const maxVisiblePages = 5; // Show at most 5 page numbers at once
        
        // Calculate which page numbers to show
        // We want to show the current page in the middle if possible
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Adjust if we're near the end of the list
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Create a button for each page number
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers += `
                <button class="btn ${i === this.currentPage ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="dashboardManager.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        return pageNumbers;
    }

    // This method navigates to a specific page
    // It's like turning to a specific page in a book
    goToPage(page) {
        // Calculate how many total pages we have
        const totalPages = Math.ceil(this.filteredEmployees.length / this.itemsPerPage);
        
        // Only go to the page if it's valid (between 1 and the total number of pages)
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            
            // Update the display
            this.renderEmployees();
            this.updatePagination();
            
            // Scroll to the top of the page so the user can see the new results
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // This method changes how many employees to show per page
    // It's like changing the font size in a book
    changePageSize(size) {
        // Convert the size to a number and store it
        this.itemsPerPage = parseInt(size);
        
        // Reset to the first page since we're changing the layout
        this.currentPage = 1;
        
        // Update the display
        this.renderEmployees();
        this.updatePagination();
    }

    // This method fills in the filter dropdown menus with available options
    // It's like creating a menu with all the available choices
    populateFilterOptions() {
        // Get all the unique departments and roles from our employee data
        const departments = employeeDataManager.getDepartments();
        const roles = employeeDataManager.getRoles();

        // Fill in the department dropdown
        const departmentFilter = document.getElementById('departmentFilter');
        if (departmentFilter) {
            departmentFilter.innerHTML = '<option value="">All Departments</option>' +
                departments.map(dept => `<option value="${dept}">${dept}</option>`).join('');
        }

        // Fill in the role dropdown
        const roleFilter = document.getElementById('roleFilter');
        if (roleFilter) {
            roleFilter.innerHTML = '<option value="">All Roles</option>' +
                roles.map(role => `<option value="${role}">${role}</option>`).join('');
        }
    }

    // This method opens the edit form for a specific employee
    // It's like opening a form to edit someone's contact information
    editEmployee(id) {
        // Navigate to the form page with the employee ID in the URL
        // This tells the form page which employee to edit
        window.location.href = `form.html?id=${id}`;
    }

    // This method deletes an employee after asking for confirmation
    // It's like asking "Are you sure?" before doing something important
    deleteEmployee(id) {
        // Show a confirmation dialog to make sure the user really wants to delete
        if (confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
            // Try to delete the employee
            const success = employeeDataManager.deleteEmployee(id);
            
            if (success) {
                // If deletion was successful, reload the employee list
                this.loadEmployees();
                
                // Show a success message
                this.showMessage('Employee deleted successfully!', 'success');
            } else {
                // If deletion failed, show an error message
                this.showMessage('Failed to delete employee. Please try again.', 'error');
            }
        }
    }

    // This method shows a loading spinner while data is being loaded
    // It's like showing a "please wait" message
    showLoadingState() {
        const container = document.getElementById('employeeContainer');
        if (container) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading employees...</p>
                </div>
            `;
        }
    }

    // This method hides the loading spinner when data loading is complete
    // It's like removing the "please wait" message
    hideLoadingState() {
        // The loading state is automatically cleared when renderEmployees is called
        // So we don't need to do anything special here
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

        // Create the message HTML
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

    // This is a utility function that prevents a function from running too often
    // It's like putting a delay on a light switch so it doesn't flicker
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// These are global functions that can be called from HTML onclick attributes
// They're like shortcuts that other parts of the code can use

// Function to edit an employee (called from the Edit button)
function editEmployee(id) {
    if (window.dashboardManager) {
        dashboardManager.editEmployee(id);
    }
}

// Function to delete an employee (called from the Delete button)
function deleteEmployee(id) {
    if (window.dashboardManager) {
        dashboardManager.deleteEmployee(id);
    }
}

// Function to go to a specific page (called from pagination buttons)
function goToPage(page) {
    if (window.dashboardManager) {
        dashboardManager.goToPage(page);
    }
}

// Function to change how many employees to show per page
function changePageSize(size) {
    if (window.dashboardManager) {
        dashboardManager.changePageSize(size);
    }
}

// Function to handle sorting (called from sort dropdowns)
function handleSort() {
    if (window.dashboardManager) {
        dashboardManager.handleSort();
    }
}

// This runs when the page finishes loading
// It's like turning on the dashboard when the page is ready
document.addEventListener('DOMContentLoaded', function() {
    // Create the dashboard manager and store it globally so other functions can access it
    window.dashboardManager = new DashboardManager();
}); 