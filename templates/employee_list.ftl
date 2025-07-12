<#-- Freemarker template for rendering employee list -->
<#-- This simulates how data would be passed from backend to frontend -->

<#-- Mock data assignment - simulating backend data -->
<#assign employees = [
    {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@ajackus.com",
        "department": "Engineering",
        "role": "Senior Developer"
    },
    {
        "id": 2,
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane.smith@ajackus.com",
        "department": "Design",
        "role": "UI/UX Designer"
    },
    {
        "id": 3,
        "firstName": "Mike",
        "lastName": "Johnson",
        "email": "mike.johnson@ajackus.com",
        "department": "Marketing",
        "role": "Marketing Manager"
    },
    {
        "id": 4,
        "firstName": "Sarah",
        "lastName": "Williams",
        "email": "sarah.williams@ajackus.com",
        "department": "Engineering",
        "role": "Frontend Developer"
    },
    {
        "id": 5,
        "firstName": "David",
        "lastName": "Brown",
        "email": "david.brown@ajackus.com",
        "department": "Sales",
        "role": "Sales Representative"
    },
    {
        "id": 6,
        "firstName": "Emily",
        "lastName": "Davis",
        "email": "emily.davis@ajackus.com",
        "department": "HR",
        "role": "HR Specialist"
    },
    {
        "id": 7,
        "firstName": "Robert",
        "lastName": "Wilson",
        "email": "robert.wilson@ajackus.com",
        "department": "Engineering",
        "role": "Backend Developer"
    },
    {
        "id": 8,
        "firstName": "Lisa",
        "lastName": "Anderson",
        "email": "lisa.anderson@ajackus.com",
        "department": "Design",
        "role": "Graphic Designer"
    },
    {
        "id": 9,
        "firstName": "James",
        "lastName": "Taylor",
        "email": "james.taylor@ajackus.com",
        "department": "Finance",
        "role": "Financial Analyst"
    },
    {
        "id": 10,
        "firstName": "Amanda",
        "lastName": "Martinez",
        "email": "amanda.martinez@ajackus.com",
        "department": "Engineering",
        "role": "QA Engineer"
    },
    {
        "id": 11,
        "firstName": "Christopher",
        "lastName": "Garcia",
        "email": "christopher.garcia@ajackus.com",
        "department": "Marketing",
        "role": "Content Writer"
    },
    {
        "id": 12,
        "firstName": "Jessica",
        "lastName": "Rodriguez",
        "email": "jessica.rodriguez@ajackus.com",
        "department": "Sales",
        "role": "Account Manager"
    }
]>

<#-- Template for rendering employee cards -->
<#macro renderEmployeeCard employee>
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
            <button class="btn btn-warning btn-sm" onclick="editEmployee(${employee.id})">
                Edit
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteEmployee(${employee.id})">
                Delete
            </button>
        </div>
    </div>
</#macro>

<#-- Template for rendering employee list -->
<#macro renderEmployeeList employeeList>
    <div class="employee-container">
        <#if employeeList?has_content>
            <#list employeeList as employee>
                <@renderEmployeeCard employee=employee />
            </#list>
        <#else>
            <div class="empty-state">
                <div class="empty-state-icon">👥</div>
                <h3>No employees found</h3>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
        </#if>
    </div>
</#macro>

<#-- Template for rendering pagination -->
<#macro renderPagination currentPage totalPages totalItems itemsPerPage>
    <div class="pagination-container">
        <div class="pagination-info">
            Showing ${((currentPage - 1) * itemsPerPage) + 1} to ${(currentPage * itemsPerPage)?min(totalItems)} of ${totalItems} employees
        </div>
        <div class="pagination-controls">
            <button class="btn btn-secondary btn-sm" onclick="goToPage(${currentPage - 1})" ${(currentPage <= 1)?string('disabled', '')}>
                Previous
            </button>
            <#list 1..totalPages as pageNum>
                <button class="btn ${(pageNum == currentPage)?string('btn-primary', 'btn-secondary')} btn-sm" onclick="goToPage(${pageNum})">
                    ${pageNum}
                </button>
            </#list>
            <button class="btn btn-secondary btn-sm" onclick="goToPage(${currentPage + 1})" ${(currentPage >= totalPages)?string('disabled', '')}>
                Next
            </button>
        </div>
        <div class="page-size-selector">
            <label>Show:</label>
            <select onchange="changePageSize(this.value)">
                <option value="10" ${(itemsPerPage == 10)?string('selected', '')}>10</option>
                <option value="25" ${(itemsPerPage == 25)?string('selected', '')}>25</option>
                <option value="50" ${(itemsPerPage == 50)?string('selected', '')}>50</option>
                <option value="100" ${(itemsPerPage == 100)?string('selected', '')}>100</option>
            </select>
        </div>
    </div>
</#macro>

<#-- Template for rendering filter options -->
<#macro renderFilterOptions departments roles>
    <div class="filter-group">
        <label class="filter-label">Department</label>
        <select class="filter-select" id="departmentFilter">
            <option value="">All Departments</option>
            <#list departments as dept>
                <option value="${dept}">${dept}</option>
            </#list>
        </select>
    </div>
    <div class="filter-group">
        <label class="filter-label">Role</label>
        <select class="filter-select" id="roleFilter">
            <option value="">All Roles</option>
            <#list roles as role>
                <option value="${role}">${role}</option>
            </#list>
        </select>
    </div>
</#macro>

<#-- Template for rendering sort options -->
<#macro renderSortOptions>
    <div class="sort-controls">
        <label>Sort by:</label>
        <select class="sort-select" id="sortBy" onchange="handleSort()">
            <option value="firstName">First Name</option>
            <option value="lastName">Last Name</option>
            <option value="department">Department</option>
            <option value="role">Role</option>
        </select>
        <select class="sort-select" id="sortOrder" onchange="handleSort()">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
        </select>
    </div>
</#macro> 