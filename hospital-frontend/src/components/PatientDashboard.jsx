import React, { useEffect, useState } from "react";

const PatientDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [reason, setReason] = useState("");
  const [patientName, setPatientName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    const storedPatientName = localStorage.getItem("patientName");
    const patientId = localStorage.getItem("patientId");

    if (!patientId) {
      setErrorMessage("You are not logged in. Please log in first.");
      return;
    }

    setPatientName(storedPatientName || "Patient");

    fetch(`http://127.0.0.1:8000/api/patient-appointments/${patientId}/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch appointments.");
        }
        return response.json();
      })
      .then((data) => setAppointments(data))
      .catch((error) => {
        console.error("Error fetching appointments:", error);
        setErrorMessage("Error fetching your appointments.");
      });

    fetch("http://127.0.0.1:8000/api/doctors/")
      .then((response) => response.json())
      .then((data) => setDoctors(data))
      .catch((error) => console.error("Error fetching doctors:", error));

    const interval = setInterval(() => {
      fetch(`http://127.0.0.1:8000/api/notifications/${patientId}/`)
        .then((response) => response.json())
        .then((data) => setNotifications(data))
        .catch((error) => console.error("Error fetching notifications:", error));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleBookAppointment = () => {
    const patientId = localStorage.getItem("patientId");
    setBookingError(""); // Clear any previous booking errors

    if (!selectedDoctor || !appointmentDate || !reason) {
      alert("Please fill in all fields.");
      return;
    }

    const appointmentData = {
      doctor_id: selectedDoctor.id,
      patient_id: patientId,
      date: appointmentDate,
      reason: reason,
    };

    fetch("http://127.0.0.1:8000/api/appointments/create/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointmentData),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create appointment.");
        }
        return response.json();
      })
      .then((data) => {
        setAppointments((prev) => [...prev, data]);
        alert("Appointment booked successfully!");
        setSelectedDoctor(null);
        setAppointmentDate("");
        setReason("");
        setBookingError("");
      })
      .catch((error) => {
        console.error("Error:", error);
        if (error.message.includes("within 30 minutes")) {
          setBookingError(
            "This time slot is unavailable. The doctor already has an appointment scheduled within one hour of your requested time. Please either:" +
            "\n• Select a different time slot (at least one hour before or after any existing appointmen)" +
            "\n• Choose a different doctor" +
            "\n• Try booking for a different day"
          );
        } else {
          setBookingError("Error booking appointment. Please try again.");
        }
      });
  };

  const handleDeleteAppointment = (appointmentId) => {
    fetch(`http://127.0.0.1:8000/api/appointments/delete/${appointmentId}/`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete appointment.");
        }
        return response.json();
      })
      .then(() => {
        setAppointments(appointments.filter((appointment) => appointment.id !== appointmentId));
        alert("Appointment deleted successfully!");
      })
      .catch((error) => {
        console.error("Error:", error);
        setErrorMessage("Error deleting appointment.");
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
              setBookingError(""); // Clear error when doctor changes
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
            onChange={(e) => {
              setAppointmentDate(e.target.value);
              setBookingError(""); // Clear error when date changes
            }}
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
        
        {bookingError && (
          <div className="mb-4 p-4 bg-orange-100 border-l-4 border-orange-500 text-orange-700">
            <p className="font-medium mb-2">Booking Notice:</p>
            <p className="whitespace-pre-line">{bookingError}</p>
          </div>
        )}

        <button
          onClick={handleBookAppointment}
          className="w-full py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-500"
        >
          Book Appointment
        </button>

        {errorMessage && <p className="mt-4 text-red-600">{errorMessage}</p>}

        <h3 className="text-2xl mt-8 mb-6">Your Appointments</h3>
        {appointments.length > 0 ? (
          <ul>
            {appointments.map((appointment) => (
              <li key={appointment.id} className="mb-4 p-4 border rounded-lg">
                <div className="font-semibold">Dr. {appointment.doctor_name}</div>
                <div>{new Date(appointment.date).toLocaleString()}</div>
                <div>{appointment.reason}</div>
                <button
                  onClick={() => handleDeleteAppointment(appointment.id)}
                  className="mt-2 bg-red-500 text-white py-1 px-2 rounded-md hover:bg-red-600"
                >
                  Delete Appointment
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No appointments scheduled yet.</p>
        )}

        <h3 className="text-2xl mt-8 mb-6">Notifications</h3>
        {notifications.length > 0 ? (
          <ul>
            {notifications.map((notification) => (
              <li key={notification.id} className="border-b py-2">
                {notification.message}
              </li>
            ))}
          </ul>
        ) : (
          <p>No notifications yet.</p>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;