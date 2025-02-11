// src/App.js
import React, { useState } from 'react';
import './CSS/CompanyCreation.css'; // Import custom styles
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../pages/APIs/firebase.js"; // Import Firebase authentication instance
import { getFirestore, doc, setDoc } from "firebase/firestore"; // Import Firestore functions

const db = getFirestore(); // Initialize Firestore

const CompanyCreation = () => {
  // State for form inputs
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyKey, setCompanyKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle form submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !companyName || !email || !password || !companyKey) {
      setError("All fields are required.");
      return;
    }

    try {
      // Register user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save company details to Firestore
      await setDoc(doc(db, "companies", user.uid), {
        firstName,
        lastName,
        companyName,
        email,
        companyKey,
      });

      setSuccess("Company registered successfully!");
      setError(null);

      // Clear form inputs
      setFirstName("");
      setLastName("");
      setCompanyName("");
      setEmail("");
      setPassword("");
      setCompanyKey("");
    } catch (err) {
      console.error("Error during registration:", err);
      setError("Failed to register company. Please try again.");
      setSuccess(null);
    }
  };

  return (
    <div className="company-creation">
      <div className="sitemap-background"></div>
      <div className="welcome-text">Welcome!</div>
      <div className="subtext">Get started today—schedule, manage, and stay organized</div>
      <div className="sign-in">Already have an account? Sign in</div>

      <div className="form">
        <form onSubmit={handleSignUp}>
          <div className="form-group">
            <label>First Name*</label>
            <input
              type="text"
              className="text-field"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Last Name*</label>
            <input
              type="text"
              className="text-field"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Company Name*</label>
            <input
              type="text"
              className="text-field"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Email*</label>
            <input
              type="email"
              className="text-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Password*</label>
            <input
              type="password"
              className="text-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Company Key*</label>
            <input
              type="text"
              className="text-field"
              value={companyKey}
              onChange={(e) => setCompanyKey(e.target.value)}
            />
          </div>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <div className="form-group">
            <button type="submit" className="button">Sign up</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyCreation;