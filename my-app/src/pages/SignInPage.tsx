import React from "react";
import './CSS/LoginPage.css';
import { Link } from 'react-router-dom';

const SignInPage = () => {
    return (
        <div className="login-container">
            <div className="login-box">
                <div className="logo">
                    <img src="https://via.placeholder.com/50" alt="Logo" />
                </div>
                <h2>Sign In</h2>
                <p>Don't have an account? <Link to="/SignUp">Sign Up</Link></p>

                <form>
                    <div className="input-group">
                        <label>Email*</label>
                        <input type="email" placeholder="Your Email" required />
                    </div>
                    <div className="input-group">
                        <label>Password*</label>
                        <input type="password" placeholder="******" required />
                    </div>
                    <div className="options">
                        <label>
                            <input type="checkbox" /> Remember me
                        </label>
                        <Link to="/ForgotPassword">Forgot Password?</Link>
                    </div>
                    <button type="submit" className="sign-in-button">Sign In</button>
                </form>
            </div>
        </div>
    );
};

export default SignInPage;
