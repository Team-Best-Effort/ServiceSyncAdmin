import React, { useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import './CSS/AdminCalendar.css';
import { Link } from 'react-router-dom';
import GoogleCalendar from "./APIs/GoogleCalendar"; // Ensure this path is correct and the file exists

const AdminCalendar = () => {
    const [date, setDate] = useState(new Date());

    // Function to handle date selection (example use case)
    const handleSelectDate = () => {
        const newDate = new Date(2024, 9, 20); // Note: Month is 0-indexed in JS
        setDate(newDate);
    };

    return (
        <div className="admin-calendar">
            {/* Navbar Section */}
            <header className="navbar">
                <div className="navbar-left">
                    <div className="servicesync-text">ServiceSync</div>
                    <div className="company-logo">Company Logo Here</div>
                </div>
                <div className="navbar-right">
                    <Link to="/AdminHome"><button>Home</button></Link>
                    <Link to="/AdminCalendar"><button>Calendar</button></Link>
                    <Link to="/AdminJobPage"><button>Jobs</button></Link>
                    <Link to="/AdminPayroll"><button>Payroll</button></Link>
                    <Link to="/SignIn"><button>Log Out</button></Link>
                    <div className="user-info">User Info Here</div>
                </div>
            </header>

            {/* Page Content */}
            <div className="page-content">
                {/* Google Calendar Section */}
                <div className="google-calendar-section">
                    <GoogleCalendar />
                </div>
            </div>
        </div>
    );
};

export default AdminCalendar;
