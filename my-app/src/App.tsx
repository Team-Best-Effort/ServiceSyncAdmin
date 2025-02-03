import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import DefaultHome from "./pages/DefaultHome";
import AdminCalendar from "./pages/AdminCalendar";
import AdminHome from "./pages/AdminHome";
import AdminPayroll from "./pages/AdminPayroll";
import LoginPage from "./pages/LoginPage";
import CompanyCreation from "./pages/CompanyCreation";
import AdminJobPage from "./pages/AdminJobPage";
import EmployeeCalendar from "./pages/EmployeeCalendar";

// Import Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Import AuthContext
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-zHokpPV316sdixgDhPizAgz4h_m1U84",
  authDomain: "fir-for-auth-web-app.firebaseapp.com",
  projectId: "fir-for-auth-web-app",
  storageBucket: "fir-for-auth-web-app.firebasestorage.app",
  messagingSenderId: "79542475148",
  appId: "1:79542475148:web:2e835ba094dbf469979ea9",
  measurementId: "G-CVX4XY78EL",
};

// Initialize Firebase and Authentication
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ProtectedRoute component for securing routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/LoginPage" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<DefaultHome />} />
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route path="/CompanyCreation" element={<CompanyCreation />} />

          {/* Protected Routes */}
          <Route
            path="/AdminHome"
            element={
              <ProtectedRoute>
                <AdminHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AdminCalendar"
            element={
              <ProtectedRoute>
                <AdminCalendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AdminPayroll"
            element={
              <ProtectedRoute>
                <AdminPayroll />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AdminJobPage"
            element={
              <ProtectedRoute>
                <AdminJobPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/EmployeeCalendar"
            element={
              <ProtectedRoute>
                <EmployeeCalendar />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;