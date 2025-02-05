import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function DoctorLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { username, password };
  
    try {
      const response = await fetch("http://127.0.0.1:8000/api/doctor/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        const { doctor_id } = result;  // Get doctor_id from response
        const doctorName = username;  // Use the username as the doctor name
  
        // Store doctor info in localStorage
        localStorage.setItem("doctorId", doctor_id);
        localStorage.setItem("doctorName", doctorName); // Store doctor name as well
        localStorage.setItem("role", "doctor");
  
        alert("Doctor login successful!");
        navigate("/doctor/dashboard");  // Redirect to dashboard after login
      } else {
        setErrorMessage(result.error || "Something went wrong.");
      }
    } catch (error) {
      setErrorMessage("Something went wrong.");
    }
  };
  

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: 'url(https://i.pinimg.com/736x/0d/01/95/0d01959517a38f0a50df0f85850f18aa.jpg)',
      }}
    >
      <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-80 md:w-96 max-w-md">
        <h2 className="text-2xl font-semibold text-center text-blue-600 mb-6">Doctor Login</h2>

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

          <div className="mb-5 relative">
            <label className="block text-gray-600 text-sm font-medium mb-2">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-10 text-gray-500 cursor-pointer text-sm"
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          {errorMessage && (
            <p className="text-red-500 text-center mb-4">{errorMessage}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}

export default DoctorLogin;
