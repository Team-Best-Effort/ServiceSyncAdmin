import React, { useState } from "react"; // Import React and hooks for state management.
import './CSS/LoginPage.css'; // Import custom CSS for styling.
import { Link, useNavigate } from 'react-router-dom'; // Import navigation utilities.
import { signInWithEmailAndPassword } from "firebase/auth"; // Firebase authentication function.
import { auth } from "../pages/APIs/firebase.js"; // Import Firebase auth instance.

const LoginPage = () => {
    const [email, setEmail] = useState(""); // State for email input.
    const [password, setPassword] = useState(""); // State for password input.
    const [companyCode, setCompanyCode] = useState(""); // State for company code input.
    const [error, setError] = useState<string | null>(null); // State for error messages.
    const navigate = useNavigate(); // Hook for navigation.

    // Handle form submission for login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent default form submission behavior.

        if (companyCode.trim() === "") {
            setError("Company Code is required.");
            return;
        }

        try {
            // Attempt to log in using Firebase Authentication
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/AdminHome"); // Redirect to AdminHome on successful login
        } catch (err) {
            setError("Invalid email or password. Please try again.");
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="logo">
                    {/* Logo placeholder */}
                    <img src="https://via.placeholder.com/50" alt="Logo" />
                </div>
                <h2>Sign In</h2>
                <p>Don't have an account? <Link to="/RegisterPage">Sign Up</Link></p>

                {error && (
                    <div className="alert-box">
                        {/* Display error messages */}
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>Email*</label>
                        <input
                            type="email"
                            placeholder="Your Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Password*</label>
                        <input
                            type="password"
                            placeholder="******"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Company Code*</label>
                        <input
                            type="text"
                            placeholder="******"
                            value={companyCode}
                            onChange={(e) => setCompanyCode(e.target.value)}
                            required
                        />
                    </div>
                    <div className="options">
                        <label>
                            <input type="checkbox" /> Remember me
                        </label>
                        <a href="#forgot-password">Forgot Password?</a>
                    </div>
                    <button type="submit" className="sign-in-button">Sign In</button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage; // Export the LoginPage component.