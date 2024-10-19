import React from "react";
import './CSS/AdminHome.css';

const AdminHome = () => {
    return (
        <div className="admin-home">
            <header className="navbar">
                <div className="navbar-left">
                    <div className="servicesync-text">ServiceSync</div>
                    <div className="company-logo">Company Logo Here</div>
                </div>
                <div className="navbar-right">
                    <button>Home</button>
                    <button>Calendar</button>
                    <button>Jobs</button>
                    <button>Payroll</button>
                    <button>Log Out</button>
                    <div className="user-info">User Info Here</div>
                </div>
            </header>

            <div className="page-content">
                <div className="calendar-section">
                    <h2>Calendar Overview</h2>
                    <div className="calendar">Calendar Goes Here</div>
                </div>
                <div className="job-list-section">
                    <h2>Job List</h2>
                    <div className="job-list">
                        <div className="job-item">
                            <span>Plumbing</span>
                            <span>1045 Random St</span>
                            <span>Assigned to: Jeff</span>
                            <span>9/28/24 9:00AM</span>
                        </div>
                    </div>
                </div>
                <div className="payroll-button">
                    <button>Payroll</button>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;