import React, { useEffect, useState } from "react";

const DoctorDashboard = () => {
  const [doctorName, setDoctorName] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    const storedDoctorName = localStorage.getItem("doctorName");
    const storedDoctorId = localStorage.getItem("doctorId");

    if (storedDoctorName) {
      setDoctorName(storedDoctorName);
    }

    if (storedDoctorId) {
      fetchAppointments(storedDoctorId);
    }
  }, []);

  const fetchAppointments = async (doctorId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/doctor-appointments/${doctorId}/`);
      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setErrorMessage("There was an error fetching your appointments.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointmentId) => {
    setApproving(true);
    setErrorMessage("");

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/appointments/approve/${appointmentId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to approve appointment");
      }

      const data = await response.json();
      
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, is_approved: true }
          : apt
      ));

      alert(data.message || "Appointment approved successfully");

      const storedDoctorId = localStorage.getItem("doctorId");
      if (storedDoctorId) {
        await fetchAppointments(storedDoctorId);
      }
    } catch (error) {
      console.error("Error approving appointment:", error);
      setErrorMessage("Failed to approve appointment. Please try again.");
    } finally {
      setApproving(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center py-8">
      <div className="bg-white p-10 shadow-lg rounded-lg max-w-4xl w-full">
        <h2 className="text-3xl font-semibold text-center text-blue-600 mb-4">
          Welcome, Dr. {doctorName || "User"}!
        </h2>

        <h3 className="text-2xl mt-8 mb-4">Your Appointments</h3>
        
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errorMessage}
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">
            <p className="text-gray-600">Loading appointments...</p>
          </div>
        ) : appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="font-semibold text-lg">
                      Patient: {appointment.patient_name}
                    </div>
                    <div className="text-gray-600">
                      Date: {formatDate(appointment.date)}
                    </div>
                    <div className="text-gray-600">
                      Reason: {appointment.reason}
                    </div>
                    <div className="text-gray-600">
                      Status: {appointment.is_approved ? (
                        <span className="text-green-600">Approved</span>
                      ) : (
                        <span className="text-yellow-600">Pending</span>
                      )}
                    </div>
                  </div>
                  
                  {!appointment.is_approved && (
                    <button
                      onClick={() => handleApprove(appointment.id)}
                      disabled={approving}
                      className={`${
                        approving 
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600'
                      } text-white py-2 px-6 rounded-lg transition duration-200`}
                    >
                      {approving ? 'Approving...' : 'Approve'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-600">
            You have no upcoming appointments.
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;