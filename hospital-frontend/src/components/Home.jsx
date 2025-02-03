// Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 

function Home() {
  const [userType, setUserType] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const user = localStorage.getItem("role"); 
    if (user === "doctor") {
      setUserType("doctor");
    } else if (user === "patient") {
      setUserType("patient");
    } else {
      setUserType("guest"); 
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("role"); 
    localStorage.removeItem("username"); 
    navigate("/login"); 
  };

  return (
    <div className="bg-gradient-to-r from-teal-100 to-blue-200 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg text-center">
        <h1 className="text-4xl font-extrabold text-teal-600 mb-6">
          Welcome to the Hospital Management System
        </h1>
        {userType === "doctor" ? (
          <p className="text-xl text-gray-700 mb-4">
            Welcome, Dr. {localStorage.getItem("username")}! You are logged in as a doctor.
          </p>
        ) : userType === "patient" ? (
          <p className="text-xl text-gray-700 mb-4">
            Welcome, {localStorage.getItem("username")}! You are logged in as a patient.
          </p>
        ) : (
          <p className="text-xl text-gray-700 mb-4">
            Welcome, Guest! Please log in to access your account.
          </p>
        )}
        
        {(userType === "doctor" || userType === "patient") && (
          <button
            onClick={handleLogout}
            className="mt-6 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-300"
          >
            Logout
          </button>
        )}

        {userType === "guest" && (
          <div className="mt-6">
            <p className="text-gray-600 mb-4">To access the system, please log in.</p>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition duration-300"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;