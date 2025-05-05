<div align="center">
  <img src="https://i.imgur.com/58qUXV3.png" width="500">
</div>
 
**ServiceSync** is an innovative solution designed to streamline operations for small and medium-sized trade businesses. Recognizing the challenges of managing trade jobs—from scheduling and employee assignments to time tracking and payroll—ServiceSync simplifies and unifies these processes into a single, user-friendly platform.  

## <img src="https://i.imgur.com/lpOEMLo.png" width="40" height="40"> Key Challenges Addressed  
- **Fragmented Workflows**: Managing job information across multiple tools leads to inefficiencies, errors, and wasted time.  
- **Employee Accessibility**: Employees often struggle to access job details, track hours accurately, and find worksite locations.  
- **Administrative Burden**: Administrators face challenges in synchronizing schedules, assignments, and payroll, resulting in frustration and missed details.  

## <img src="https://i.imgur.com/Td36qPn.png" width="40" height="40"> How ServiceSync Helps  
ServiceSync bridges these gaps by offering an all-in-one platform with robust features:  
- **Integrated Scheduling and Time Tracking**: Ensure seamless job assignments and accurate timekeeping.  
- **Mobile Employee View**: Empower employees with real-time access to job details, worksite locations, and schedules while on the go.  
- **Admin Dashboard**: Simplifies task management with intuitive tools for organizing jobs, tracking progress, and managing payroll.  
- **Built-In Tools**: Includes maps for navigation, calendar integration, and QuickBooks API support to centralize all job-related operations.  

## <img src="https://i.imgur.com/M0yE4wR.png" width="40" height="40"> Benefits  
ServiceSync eliminates redundant data entry, reduces manual tasks, and enhances overall efficiency. With its mobile and web-based functionality, plumbing teams can focus more on delivering exceptional client service while administrators enjoy a hassle-free, streamlined workflow.  

## <img src="https://i.imgur.com/oOqbd1A.png" width="40" height="40"> Team Best Effort Members 
<table align="center">
<tr>
  <th>Team Member</th>
  <th>Email</th>
</tr>
<tr>
  <td>Mohammad Taufique Imrose</td>
  <td>taufiqsaimun@csus.edu</td>
</tr>
<tr>
  <td>Joshua Ortiz Pineda</td>
  <td>jortizpineda@csus.edu</td>
</tr>
<tr>
  <td>Bilal Baloch</td>
  <td>bbaloch2@csus.edu</td>
</tr>
<tr>
  <td>Bardia Mehrzad</td>
  <td>bardiamehrzad@csus.edu</td>
</tr>
<tr>
  <td>Max Rutherford</td>
  <td>mrutherford@csus.edu</td>
</tr>
<tr>
  <td>Mohamed Burhan</td>
  <td>mburhan@csus.edu</td>
</tr>
<tr>
  <td>Hashem Battah</td>
  <td>hbattah@csus.edu</td>
</tr>
<tr>
  <td>Khalid Abouelrous</td>
  <td>kabouelrous@csus.edu</td>
</tr>
</table>



## <img src="https://i.imgur.com/osRgn8I.png" width="40" height="40"> Tech Stack
<div align="center">
  <img src="https://i.imgur.com/b7qkiit.png" width="500">
</div>

### <img src="https://i.imgur.com/8k3qpxt.png" width="30" height="30"> Frontend
- **Programming Language**:  
  - **TypeScript**: Used in combination with React, resulting in `.tsx` files for type-safe component creation.  

- **Interactive Development Environment (IDE)**:  
  - **Visual Studio Code**: Highly compatible with TypeScript and React, offering extensions for `.tsx` files, Tailwind CSS, and seamless integration with GitHub for version control.  

- **Software Development Kits (SDKs)**:  
  - **React.js**: Offers flexibility, a rich ecosystem, and strong community support. Ideal for building a dynamic and responsive user interface.  
  - **Firebase**: Provides secure and scalable authentication, including social logins and single sign-on (SSO).  
  - **Tailwind CSS**: A utility-first CSS framework for efficient styling.  

---

### <img src="https://i.imgur.com/ZNHLJEh.png" width="30" height="30"> Backend
- **Amazon RDS (Relational Database Service)**:  
  Ideal for handling structured data, suitable for applications requiring relational data structures (e.g., MySQL or PostgreSQL).  

---

### <img src="https://i.imgur.com/MwX33K3.png" width="30" height="30"> API
1. **QuickBooks API**: For payroll and financial management.  
2. **Google Maps API**: For GPS check-in and employee tracking.  
<!-- 3. **Stripe API**: Handles secure online payments from clients, automates invoicing, and processes transactions within the app.  -->
4. **Twilio API**: Supports scalability as the business grows, allowing easy expansion of communication features.  

---

### <img src="https://i.imgur.com/5QpZqVi.png" width="30" height="30"> Servers
- **AWS Amplify**: Supports real-time data synchronization, essential for the application's requirements, such as employee tracking and scheduling updates.
  
## <img src="https://i.imgur.com/k7hvCvD.png" width="40" height="40"> Developer Instructions 
This guide will walk you through the steps required to set up the development environment for the ServiceSync project. Follow the instructions below to clone the repository, navigate to the appropriate directories, and run the servers.
1. **Clone the repository**  
   Run the following command to clone the repository:
   ```bash
   git clone https://github.com/Team-Best-Effort/ServiceSync.git
2. **Go to the project directory**  
   After cloning the repository, navigate to the root of the project directory:
   ```bash
    cd .\my-app\
3. **Install dependencies and run the servers**  
   Install the necessary dependencies and run the servers. Run the following commands in the terminal:
   ```bash
   npm install
   npm start

---

## Test Environment Setup

Follow these steps to clone the repos and run the Vitest suite:

1. **Clone the repositories**  
   ```bash
   git clone https://github.com/Team-Best-Effort/ServiceSyncAdmin.git
   git clone https://github.com/Team-Best-Effort/ServiceSyncEmployee.git
   ```

2. **Install dependencies**  
   ```bash
   cd ServiceSyncAdmin/my-app1     # navigate into admin app folder
   npm install

   cd ../../ServiceSyncEmployee/my-app1   # navigate into employee app folder
   npm install
   ```

3. **Run a specific test**  
   ```bash
   cd ServiceSyncAdmin/my-app                  # or ServiceSyncEmployee/my-app1
   npx vitest run app/dashboard/serviceStatus/ServiceStatus.test.tsx
   ```

4. **Run all tests**  
   ```bash
   npx vitest run
   ```

5. **Supported environments**  
   These tests can be executed on **Windows**, **macOS**, or **Linux**—no additional setup required.


## Testing Instructions
- TBA, will be done in CSC 191

---

## <img src="https://e7.pngegg.com/pngimages/993/133/png-clipart-calendar-computer-icons-calendar-date-mount-olivet-lutheran-church-of-plymouth-time-calender-miscellaneous-calendar-thumbnail.png" width="40" height="40"> Development Timeline
<table align="center">
<tr>
  <th>Task to Completle</th>
  <th>Sprint Info</th>
  <th>Status</th>
</tr>
<tr>
  <td>Project Mockups & Research</td>
  <td>Sprints 0 & 1: August 26 to October 6, 2024</td>
  <td>Completed</td>
</tr>
<tr>
  <td>Creating a Non-Functional UI for the Application</td>
  <td>Sprints 2 & 3: October 7 to November 10, 2024</td>
  <td>Completed</td>
</tr>
<tr>
  <td>Linking the Pages Togther and Implementing the API's</td>
  <td>Sprint 4: November 11 to November 24, 2024</td>
  <td>Completed</td>
</tr>
<tr>
  <td>Account Creation/Login</td>
  <td>Sprint 5: January 26 to February 8, 2025</td>
  <td>Completed</td>
</tr>
<tr>
  <td>Linking the API's Together</td>
  <td>Sprint 6: February 9 to February 22, 2025</td>
  <td>Completed</td>
</tr>
<tr>
  <td>Implementing Code Testing</td>
  <td>Sprint 7: February 23 to March 8, 2025</td>
  <td>Completed</td>
</tr>
<tr>
  <td>Overhauling the UI</td>
  <td>Sprint 8: March 9 to March 22, 2025</td>
  <td>Completed</td>
</tr>
<tr>
  <td>Tech Debt & Code Cleanup</td>
  <td>Sprint 9: March 23 to April 5, 2025</td>
  <td>Completed</td>
</tr>
</table>

