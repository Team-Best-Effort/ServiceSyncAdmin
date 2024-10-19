import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import DefaultHome from "./pages/DefaultHome";
import AdminCalendar from "./pages/AdminCalendar";
import AdminHome from "./pages/AdminHome";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DefaultHome/>} />
        <Route path="/AdminCalendar" element={<AdminCalendar/>} />
        <Route path="/AdminHome" element={<AdminHome/>} />
      </Routes>
    </Router>
  );
}

export default App;