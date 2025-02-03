// LandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center text-white"
      style={{
        backgroundImage: 'url(https://i.pinimg.com/736x/a5/48/2f/a5482f913970577ecee40882ed430daf.jpg)', 
      }}
    >
      {/* Overlay for contrast */}
      <div className="absolute inset-0 bg-black opacity-50"></div>
      
      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen text-center space-y-6 px-6">
        <h1 className="text-5xl font-bold mb-4 text-shadow-md sm:text-6xl md:text-7xl">
          Welcome to the Hospital Management System
        </h1>
        <p className="text-xl sm:text-2xl max-w-3xl mb-10 text-shadow-md">
          Your health is our top priority. Choose your path to get started:
        </p>

        <div className="space-y-4 sm:flex sm:space-y-0 sm:space-x-6 sm:flex-row">
          <button
            onClick={() => navigate("/signup")}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
          >
            Signup as Patient
          </button>
          <button
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
          >
            Login as Patient
          </button>
          <button
            onClick={() => navigate("/doctor/login")}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
          >
            Doctor Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
