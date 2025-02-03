import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import PatientSignup from "./components/PatientSignup";
import PatientLogin from "./components/PatientLogin";
import DoctorLogin from "./components/DoctorLogin";
import PatientDashboard from "./components/PatientDashboard";
import DoctorDashboard from "./components/DoctorDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const userType = localStorage.getItem("role");

  return (
    <Router>
      <div className="h-screen flex flex-col overflow-hidden">
        <nav className="bg-blue-600 text-white py-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center px-4">
            <h1 className="text-xl font-bold">Hospital Management System</h1>
            <div className="space-x-4">
              {userType ? (
                <>
                  <Link to="/" className="hover:text-gray-300">Home</Link>
                  <Link to="/login" onClick={() => { localStorage.clear(); }} className="hover:text-gray-300">Logout</Link>
                  {userType === "doctor" ? (
                    <Link to="/doctor/dashboard" className="hover:text-gray-300">Doctor Dashboard</Link>
                  ) : (
                    <Link to="/patient/dashboard" className="hover:text-gray-300">Patient Dashboard</Link>
                  )}
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:text-gray-300">Login</Link>
                  <Link to="/signup" className="hover:text-gray-300">Signup</Link>
                </>
              )}
            </div>
          </div>
        </nav>

        <main className="flex-grow overflow-y-auto">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<PatientSignup />} />
            <Route path="/login" element={<PatientLogin />} />
            <Route path="/doctor/login" element={<DoctorLogin />} />
            {/* Protected Routes for Dashboards */}
            <Route
              path="/patient/dashboard"
              element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>}
            />
            <Route
              path="/doctor/dashboard"
              element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>}
            />
          </Routes>
        </main>

        <footer className="bg-blue-600 text-white py-2 text-center">
          <p className="text-sm">© 2025 Hospital Management System. All Rights Reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
