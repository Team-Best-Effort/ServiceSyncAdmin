
import React from "react";
import './CSS/LoginPage.css';
import { Link } from 'react-router-dom';

const SignUpPage = () => {
    return (
        <div className="login-container">
            <div className="login-box">
                <div className="logo">
                    <img src="https://via.placeholder.com/50" alt="Logo" />
                </div>
                <h2>Sign Up</h2>
                <p>Already have an account? <Link to="/SignIn">Sign In</Link></p>

                <div className="alert-box">
                    <p>Please enter your details to create an account.</p>
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
                            <input type="checkbox" /> Agree to terms and conditions
                        </label>
                    </div>
                    <button type="submit" className="sign-up-button">Sign Up</button>
                </form>
            </div>
        </div>
    );
};

export default SignUpPage;


















// import React from "react"; // Import React for creating components.
// import './CSS/LoginPage.css'; // Import custom CSS for styling.
// import { Link } from 'react-router-dom';

// const LoginPage = () => {
//     return (
//         <div className="login-container">
//             <div className="login-box">
//                 <div className="logo">
//                     {/* Logo placeholder - you can replace this with an actual image */}
//                     <img src="https://via.placeholder.com/50" alt="Logo" />
//                 </div>
//                 <h2>Sign In</h2>
//                 <p>Don't have an account? <a href="#signup">Sign Up</a></p>

//                 <div className="alert-box">
//                     {/* Alert notification box */}
//                     <p>Please log in with your email, password, and company key.</p>
//                 </div>

//                 <form>
//                     <div className="input-group">
//                         <label>Email*</label>
//                         <input type="email" placeholder="Your Email" required />
//                     </div>
//                     <div className="input-group">
//                         <label>Password*</label>
//                         <input type="password" placeholder="******" required />
//                     </div>
//                     <div className="input-group">
//                         <label>Company Code*</label>
//                         <input type="text" placeholder="******" required />
//                     </div>
//                     <div className="options">
//                         <label>
//                             <input type="checkbox" /> Remember me
//                         </label>
//                         <a href="#forgot-password">Forgot Password?</a>
//                     </div>
//                     <Link to="/AdminHome"><button type="submit" className="sign-in-button">Sign In</button></Link>
//                     <Link to="/AdminHome"><button type="button" className="sign-up-button">Sign Up</button></Link>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default LoginPage; // Export the LoginPage component.
