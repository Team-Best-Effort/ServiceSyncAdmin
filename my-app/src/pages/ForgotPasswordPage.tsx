import React, { useState } from "react";
import './CSS/LoginPage.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        alert(`Password reset link sent to: ${email}`);
        // Here you can integrate Firebase or backend logic for password recovery
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Forgot Password?</h2>
                <p>Enter your email to receive a password reset link.</p>

                <form onSubmit={handleSubmit}>
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
                    <button type="submit" className="sign-in-button">Send Reset Link</button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
