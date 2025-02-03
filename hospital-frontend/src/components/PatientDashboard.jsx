import React, { useEffect, useState } from "react";

const PatientDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [reason, setReason] = useState("");
  const [patientName, setPatientName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const storedPatientName = localStorage.getItem("patientName");
    setPatientName(storedPatientName || "Patient");

    // Fetch doctors
    fetch("http://127.0.0.1:8000/api/doctors/")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched doctors:", data);  // Debugging
        setDoctors(data);
      })
      .catch((error) => console.error("Error fetching doctors:", error));

    // Fetch appointments without token
    fetch("http://127.0.0.1:8000/api/patient-appointments/")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched appointments:", data);  // Debugging
        setAppointments(data);
      })
      .catch((error) => console.error("Error fetching appointments:", error));
  }, []);

  const handleBookAppointment = () => {
    if (!selectedDoctor || !appointmentDate || !reason) {
      alert("Please fill in all fields.");
      return;
    }
  
    const appointmentData = {
      doctor_id: selectedDoctor.id,
      patient_id: localStorage.getItem('patientId'),  // Assuming you save patient ID in localStorage
      date: appointmentDate,
      reason: reason,
    };
  
    console.log("Appointment Data:", appointmentData); // Debugging the data
  
    fetch("http://127.0.0.1:8000/api/appointments/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(appointmentData),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to create appointment. Status: " + response.status);
        }
        return response.json();
      })
      .then(data => {
        console.log("Appointment Created:", data);  // Debugging
        alert("Appointment booked successfully!");
        setAppointments(prev => [...prev, { ...data, doctor: selectedDoctor }]);
        setSelectedDoctor(null);
        setAppointmentDate("");
        setReason("");
      })
      .catch((error) => {
        console.error("Error:", error);
        setErrorMessage("Detailed error: " + error.message);  // Better error message
      });
  };
  

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center py-8">
      <div className="bg-white p-10 shadow-lg rounded-lg max-w-lg w-full">
        <h2 className="text-3xl font-semibold text-center text-teal-600 mb-4">
          Welcome, {patientName}!
        </h2>
        <h3 className="text-2xl text-center mb-6">Book an Appointment</h3>
        <div className="mb-4">
          <label className="block text-gray-700">Select Doctor:</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            value={selectedDoctor ? selectedDoctor.id : ""}
            onChange={(e) => {
              const doctor = doctors.find(
                (doc) => doc.id === parseInt(e.target.value)
              );
              setSelectedDoctor(doctor || null);
            }}
          >
            <option value="">Choose a doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                Dr. {doctor.user.username} - {doctor.specialty}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Date and Time:</label>
          <input
            type="datetime-local"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Reason:</label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for your visit"
          />
        </div>
        <button
          onClick={handleBookAppointment}
          className="w-full py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-500"
        >
          Book Appointment
        </button>

        {errorMessage && (
          <p className="mt-4 text-red-600">{errorMessage}</p>
        )}

        <h3 className="text-2xl mt-8 mb-6">Your Appointments</h3>
        {appointments.length > 0 ? (
          <ul>
            {appointments.map((appointment) => (
              <li key={appointment.id} className="mb-4">
                <div className="font-semibold">
                  Dr. {appointment.doctor.user.username} -{" "}
                  {appointment.doctor.specialty}
                </div>
                <div>{appointment.date}</div>
                <div>{appointment.reason}</div>
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

export default PatientDashboard;
