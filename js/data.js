// This is where we store all our employee data - like a mini database in the browser
// We're simulating what would normally come from a real backend server
let employees = [
    {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@ajackus.com",
        department: "Engineering",
        role: "Senior Developer"
    },
    {
        id: 2,
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@ajackus.com",
        department: "Design",
        role: "UI/UX Designer"
    },
    {
        id: 3,
        firstName: "Mike",
        lastName: "Johnson",
        email: "mike.johnson@ajackus.com",
        department: "Marketing",
        role: "Marketing Manager"
    },
    {
        id: 4,
        firstName: "Sarah",
        lastName: "Williams",
        email: "sarah.williams@ajackus.com",
        department: "Engineering",
        role: "Frontend Developer"
    },
    {
        id: 5,
        firstName: "David",
        lastName: "Brown",
        email: "david.brown@ajackus.com",
        department: "Sales",
        role: "Sales Representative"
    },
    {
        id: 6,
        firstName: "Emily",
        lastName: "Davis",
        email: "emily.davis@ajackus.com",
        department: "HR",
        role: "HR Specialist"
    },
    {
        id: 7,
        firstName: "Robert",
        lastName: "Wilson",
        email: "robert.wilson@ajackus.com",
        department: "Engineering",
        role: "Backend Developer"
    },
    {
        id: 8,
        firstName: "Lisa",
        lastName: "Anderson",
        email: "lisa.anderson@ajackus.com",
        department: "Design",
        role: "Graphic Designer"
    },
    {
        id: 9,
        firstName: "James",
        lastName: "Taylor",
        email: "james.taylor@ajackus.com",
        department: "Finance",
        role: "Financial Analyst"
    },
    {
        id: 10,
        firstName: "Amanda",
        lastName: "Martinez",
        email: "amanda.martinez@ajackus.com",
        department: "Engineering",
        role: "QA Engineer"
    },
    {
        id: 11,
        firstName: "Christopher",
        lastName: "Garcia",
        email: "christopher.garcia@ajackus.com",
        department: "Marketing",
        role: "Content Writer"
    },
    {
        id: 12,
        firstName: "Jessica",
        lastName: "Rodriguez",
        email: "jessica.rodriguez@ajackus.com",
        department: "Sales",
        role: "Account Manager"
    }
];

// This class is like a manager that handles all the employee data operations
// Think of it as a helper that knows how to add, edit, delete, and find employees
class EmployeeDataManager {
    constructor() {
        // When we create this manager, we copy all the existing employees
        // We use the spread operator (...) to make a copy, not just a reference
        this.employees = [...employees];
        
        // We need to keep track of what the next employee ID should be
        // So we find the highest ID in our list and add 1 to it
        // This prevents duplicate IDs when adding new employees
        this.nextId = Math.max(...this.employees.map(emp => emp.id)) + 1;
    }

    // This method gives us a copy of all employees
    // We return a copy (not the original) so other code can't accidentally change our data
    getAllEmployees() {
        return [...this.employees];
    }

    // This method finds one specific employee by their ID
    // It's like looking up someone in a phone book by their number
    getEmployeeById(id) {
        return this.employees.find(emp => emp.id === id);
    }

    // This method adds a new employee to our list
    // We take the employee data (like name, email, etc.) and create a complete employee record
    addEmployee(employeeData) {
        // Create a new employee object by combining the provided data with a new ID
        const newEmployee = {
            ...employeeData,  // This spreads all the employee data (name, email, etc.)
            id: this.nextId   // Add a unique ID to this employee
        };
        
        // Add this new employee to our list
        this.employees.push(newEmployee);
        
        // Increase the next ID so the next employee gets a different number
        this.nextId++;
        
        // Return the complete employee record we just created
        return newEmployee;
    }

    // This method updates an existing employee's information
    // We find the employee by ID and replace their old data with new data
    updateEmployee(id, employeeData) {
        // Find the position (index) of the employee in our array
        const index = this.employees.findIndex(emp => emp.id === id);
        
        // If we found the employee (index is not -1)
        if (index !== -1) {
            // Update the employee by combining their old data with the new data
            // The spread operator (...) keeps old data and overwrites with new data
            this.employees[index] = { ...this.employees[index], ...employeeData };
            
            // Return the updated employee record
            return this.employees[index];
        }
        
        // If we didn't find the employee, return null to indicate failure
        return null;
    }

    // This method removes an employee from our list
    // We find them by ID and delete their record
    deleteEmployee(id) {
        // Find the position of the employee in our array
        const index = this.employees.findIndex(emp => emp.id === id);
        
        // If we found the employee
        if (index !== -1) {
            // Remove them from the array using splice
            // splice(index, 1) means "remove 1 item starting at this position"
            this.employees.splice(index, 1);
            
            // Return true to indicate success
            return true;
        }
        
        // If we didn't find the employee, return false
        return false;
    }

    // This method searches for employees by name or email
    // It's like a search box that looks through all employee records
    searchEmployees(query) {
        // Convert the search term to lowercase so the search is not case-sensitive
        const searchTerm = query.toLowerCase();
        
        // Filter the employees array to find matches
        return this.employees.filter(emp => 
            // Check if the search term appears in the first name
            emp.firstName.toLowerCase().includes(searchTerm) ||
            // Check if the search term appears in the last name
            emp.lastName.toLowerCase().includes(searchTerm) ||
            // Check if the search term appears in the email
            emp.email.toLowerCase().includes(searchTerm)
        );
    }

    // This method filters employees based on specific criteria
    // It's like having filters on a shopping website
    filterEmployees(filters) {
        return this.employees.filter(emp => {
            // If there's a first name filter, check if the employee's first name contains it
            if (filters.firstName && !emp.firstName.toLowerCase().includes(filters.firstName.toLowerCase())) {
                return false; // This employee doesn't match, so exclude them
            }
            
            // If there's a department filter, check if the employee's department matches exactly
            if (filters.department && emp.department !== filters.department) {
                return false; // This employee doesn't match, so exclude them
            }
            
            // If there's a role filter, check if the employee's role matches exactly
            if (filters.role && emp.role !== filters.role) {
                return false; // This employee doesn't match, so exclude them
            }
            
            // If we get here, the employee matches all the filters
            return true;
        });
    }

    // This method sorts employees by a specific field (like name or department)
    // It's like organizing a list alphabetically or by any other criteria
    sortEmployees(employees, sortBy, sortOrder = 'asc') {
        // Create a copy of the employees array so we don't change the original
        return [...employees].sort((a, b) => {
            // Get the values we want to compare
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            
            // If the values are strings, convert them to lowercase for better comparison
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            // Sort in ascending order (A to Z, 1 to 10)
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                // Sort in descending order (Z to A, 10 to 1)
                return aValue < bValue ? 1 : -1;
            }
        });
    }

    // This method gets all the unique departments from our employee list
    // It's useful for creating dropdown menus in the filter section
    getDepartments() {
        // Map all employees to just their department names
        // Then use Set to remove duplicates
        // Then convert back to an array
        return [...new Set(this.employees.map(emp => emp.department))];
    }

    // This method gets all the unique roles from our employee list
    // It's useful for creating dropdown menus in the filter section
    getRoles() {
        // Map all employees to just their role names
        // Then use Set to remove duplicates
        // Then convert back to an array
        return [...new Set(this.employees.map(emp => emp.role))];
    }
}

// Create an instance of our employee data manager
// This is like creating a manager that will handle all our employee data
const employeeDataManager = new EmployeeDataManager();

// This part is for if someone wants to use this code in a Node.js environment
// It's not really needed for our web app, but it's good practice
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { employeeDataManager, employees };
} 