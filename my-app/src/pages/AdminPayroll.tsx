import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import './CSS/AdminCalendar.css';
import { Link } from 'react-router-dom'; // You can reuse the same CSS file

interface Invoice {
    Id: string;
    TotalAmt: number;
    CurrencyRef: { name: string };
}

const AdminPayroll = () => {
    const location = useLocation();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [invoiceError, setInvoiceError] = useState<string | null>(null);
    const [isTokenFetched, setIsTokenFetched] = useState(false);

    // Effect to monitor the token fetching status and fetch invoices only when the token is ready
    useEffect(() => {
        const checkTokenStatus = async () => {
            console.log("Checking token status..."); // Debugging log
            try {
                // Delay for 500ms to give the server time to set the token
                await new Promise(resolve => setTimeout(resolve, 500));

                const response = await fetch('http://localhost:5001/api/check-token');
                if (!response.ok) {
                    throw new Error("Failed to check token status");
                }
                const data = await response.json();
                console.log("Token status checked:", data); // Debugging log
                if (data.tokenAvailable) {
                    setIsTokenFetched(true);
                    console.log("Token is available, fetching invoices..."); // Debugging log
                } else {
                    console.log("Token is not available"); // Debugging log
                }
            } catch (error) {
                console.error("Error checking token status:", error);
            }
        };

        checkTokenStatus();
    }, []);

    useEffect(() => {
        if (isTokenFetched) {
            console.log("Fetching invoices..."); // Debugging log
            fetch('http://localhost:5001/api/invoices')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch invoices');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Invoices fetched:", data); // Debugging log
                    setInvoices(data.QueryResponse.Invoice || []);
                })
                .catch(error => setInvoiceError(error.message));
        }
    }, [isTokenFetched]);


    //authorization for Quickbooks hook
    useEffect(() => {
        // Check if the URL contains the authorization code and state
        const query = new URLSearchParams(location.search);
        const authCode = query.get("code");
        const state = query.get("state");

        if (authCode && state) {
            // If the authorization code is present, send it to the backend for token exchange
            fetch(`http://localhost:5001/callback?code=${authCode}&state=${state}`)
                .then(response => response.text())
                .then(data => console.log("Tokens received:", data))
                .catch(error => console.error("Error:", error));
        } else {
            // If no authorization code, redirect to the QuickBooks OAuth flow
            window.location.href = "http://localhost:5001/auth/quickbooks";
        }
    }, [location]);



    //page content
    return (
        <div className="admin-calendar">
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
            <div className="page-content">
                <h2>Payroll Information</h2>
                <h4>Invoices</h4>
                {invoiceError && <p className="error-message">Error: {invoiceError}</p>}
                {invoices.length > 0 ? (
                    <ul>
                        {invoices.map(invoice => (
                            <li key={invoice.Id}>
                                Invoice ID: {invoice.Id}, Amount: {invoice.TotalAmt} {invoice.CurrencyRef.name}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No invoices found.</p>
                )}
            </div>
        </div>
    );
};

export default AdminPayroll;
