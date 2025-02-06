import React from "react"; // Import React for creating components.
import './CSS/LoginPage.css'; // Import custom CSS for styling.
import { Link } from 'react-router-dom';
import CryptoJS from 'crypto-js';

const LoginPage = () => {
    const userDatabase = new Map<string, string>();

const registerUser = (email: string, password: string) => {
    if (userDatabase.has(email)) {
        console.log('Registration Failed: Email already exists');
    } else {
        const hashedPassword = CryptoJS.SHA256(password).toString();
        userDatabase.set(email, hashedPassword);
        console.log('Registration Successful: User added to database');
    }
};

const validateUser = (email: string, password: string) => {
    const hashedPassword = CryptoJS.SHA256(password).toString();
    if (userDatabase.has(email) && userDatabase.get(email) === hashedPassword) {
        console.log('User validated successfully');
        return true;
    } else {
        console.log('User validation failed');
        return false;
    }
};
    return (
        <div className="login-container">
            <div className="login-box">
                <div className="logo">
                    {/* Logo placeholder - you can replace this with an actual image */}
                    <img src="https://via.placeholder.com/50" alt="Logo" />
                </div>
                <h2>Sign In</h2>
                <p>Don't have an account? <a href="#signup">Sign Up</a></p>

                <div className="alert-box">
                    {/* Alert notification box */}
                    <p>Please log in with your email, password, and company key.</p>
                </div>

                <form>
                    <div className="input-group">
                        <label>Email*</label>
                        <input type="email" placeholder="Your Email" required />
                    </div>
                    <div className="input-group">
                        <label>Password*</label>
                        <input type="password" placeholder="******" required />
                    </div>
                    <div className="input-group">
                        <label>Company Code*</label>
                        <input type="text" placeholder="******" required />
                    </div>
                    <div className="options">
                        <label>
                            <input type="checkbox" /> Remember me
                        </label>
                        <a href="#forgot-password">Forgot Password?</a>
                    </div>
                    <Link to="/AdminHome"><button type="submit" className="sign-in-button">Sign In</button></Link>
                    <Link to="/AdminHome"><button type="button" className="sign-up-button">Sign Up</button></Link>
                </form>
            </div>
        </div>
    );
};

export default LoginPage; // Export the LoginPage component.
