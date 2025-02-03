import React, { useEffect, useState } from "react";

const DoctorDashboard = () => {
  const [doctorName, setDoctorName] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    console.log("Stored username:", storedUsername); 

    if (storedUsername) {
      setDoctorName(storedUsername);
    }

    // Fetch appointments for the logged-in doctor (no need for doctorId in the URL)
    const doctorId = localStorage.getItem("doctorId");  // Assuming doctorId is stored in localStorage
    if (doctorId) {
      fetch(`http://127.0.0.1:8000/api/doctor-appointments/`) // Adjusted endpoint to fetch appointments for the logged-in doctor
        .then((response) => response.json())
        .then((data) => {
          console.log("Fetched appointments:", data);
          setAppointments(data);
        })
        .catch((error) => {
          console.error("Error fetching appointments:", error);
          setErrorMessage("There was an error fetching your appointments.");
        });
    }
  }, []);

  // Assuming doctorData is being fetched after a successful login
  // Here's where the doctorId and username would be set in localStorage after login
  const doctorData = { id: "1", username: "Dr. Willson" }; // Sample doctor data, replace with real data from login API

  // Set doctorId and username in localStorage after login
  localStorage.setItem('doctorId', doctorData.id);
  localStorage.setItem('username', doctorData.username);

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center py-8">
      <div className="bg-white p-10 shadow-lg rounded-lg max-w-lg w-full">
        <h2 className="text-3xl font-semibold text-center text-blue-600 mb-4">
          Welcome, Dr. {doctorName || "User"}!
        </h2>
        <p className="text-lg text-gray-700 mb-6 text-center">
          You are logged in as a Doctor. Below are your dashboard options:
        </p>
        <div className="grid grid-cols-1 gap-6">
          <button className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300">
            View Appointments
          </button>
          <button className="w-full py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition duration-300">
            View Patient Records
          </button>
          <button className="w-full py-3 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700 transition duration-300">
            Update Schedule
          </button>
        </div>

        <h3 className="text-2xl mt-8 mb-4">Your Appointments</h3>
        {errorMessage && (
          <p className="text-red-500 mb-4">{errorMessage}</p>
        )}
        {appointments.length > 0 ? (
          <ul className="space-y-4">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="font-semibold">
                  Patient: {appointment.patient.user.username}
                </div>
                <div>Date: {new Date(appointment.date).toLocaleString()}</div>
                <div>Reason: {appointment.reason}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have no upcoming appointments.</p>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
