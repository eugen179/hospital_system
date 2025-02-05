import React, { useEffect, useState } from "react";

const DoctorDashboard = () => {
  const [doctorName, setDoctorName] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const storedDoctorName = localStorage.getItem("doctorName");
    const storedDoctorId = localStorage.getItem("doctorId");
  
    if (storedDoctorName) {
      setDoctorName(storedDoctorName);  // Set doctor name from localStorage
    }
  
    if (storedDoctorId) {
      fetch(`http://127.0.0.1:8000/api/doctor-appointments/${storedDoctorId}/`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch appointments.");
          }
          return response.json();
        })
        .then((data) => {
          setAppointments(data);
        })
        .catch((error) => {
          console.error("Error fetching appointments:", error);
          setErrorMessage("There was an error fetching your appointments.");
        });
    }
  }, []);
  
  
  

  const handleApprove = (appointmentId) => {
    fetch(`http://127.0.0.1:8000/api/appointments/approve/${appointmentId}/`, {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
        setAppointments((prevAppointments) =>
          prevAppointments.map((appointment) =>
            appointment.id === appointmentId
              ? { ...appointment, is_approved: true }
              : appointment
          )
        );
      })
      .catch((error) => {
        console.error("Error approving appointment:", error);
        alert("There was an error approving the appointment.");
      });
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center py-8">
      <div className="bg-white p-10 shadow-lg rounded-lg max-w-lg w-full">
        <h2 className="text-3xl font-semibold text-center text-blue-600 mb-4">
          Welcome, Dr. {doctorName || "User"}!
        </h2>
        <h3 className="text-2xl mt-8 mb-4">Your Appointments</h3>
        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
        {appointments.length > 0 ? (
          <ul className="space-y-4">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="font-semibold">Patient: {appointment.patient_name}</div>
                <div>Date: {new Date(appointment.date).toLocaleString()}</div>
                <div>Reason: {appointment.reason}</div>
                {!appointment.is_approved && (
                  <button
                    onClick={() => handleApprove(appointment.id)}
                    className="mt-2 bg-blue-500 text-white py-1 px-4 rounded"
                  >
                    Approve
                  </button>
                )}
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
