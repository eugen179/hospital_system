import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function PatientSignup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      user: { username, email, password },
      patient: { birth_date: birthDate, phone_number: phoneNumber },
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/patient/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Signup successful! Redirecting to login...", {
          position: "top-center",
          autoClose: 2000,
        });

        setTimeout(() => navigate("/login"), 2500);
      } else {
        setErrorMessage(result.error || "Something went wrong.");
        toast.error(result.error || "Something went wrong.");
      }
    } catch (error) {
      setErrorMessage("Something went wrong.");
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-500 to-blue-300">
      <ToastContainer />
      <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-80 md:w-96 max-w-md">
        <h2 className="text-2xl font-semibold text-center text-blue-600 mb-6">Patient Signup</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-gray-600 text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username"
              required
            />
          </div>
          <div className="mb-5">
            <label className="block text-gray-600 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email"
              required
            />
          </div>
          <div className="mb-5">
            <label className="block text-gray-600 text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
              required
            />
          </div>
          <div className="mb-5">
            <label className="block text-gray-600 text-sm font-medium mb-2">Birth Date</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-5">
            <label className="block text-gray-600 text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter phone number"
              required
            />
          </div>
          {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
          <button type="submit" className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200">
            Signup
          </button>
        </form>
      </div>
    </div>
  );
}

export default PatientSignup;
