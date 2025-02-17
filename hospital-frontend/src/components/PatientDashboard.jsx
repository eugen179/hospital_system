import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User, Trash2, Bell, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [reason, setReason] = useState('');
    const [patientName, setPatientName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [bookingError, setBookingError] = useState('');
    const [showMpesaPayment, setShowMpesaPayment] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [pendingAppointmentData, setPendingAppointmentData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedPatientName = localStorage.getItem('patientName');
        const patientId = localStorage.getItem('patientId');

        if (!patientId) {
            setErrorMessage('You are not logged in. Please log in first.');
            return;
        }

        if (!storedPatientName) {
            fetch(`http://127.0.0.1:8000/api/patient/${patientId}/`)
                .then((response) => response.json())
                .then((data) => {
                    setPatientName(data.name);
                    localStorage.setItem('patientName', data.name);
                })
                .catch((error) => {
                    console.error('Error fetching patient details:', error);
                    setErrorMessage('Failed to fetch patient details.');
                });
        } else {
            setPatientName(storedPatientName);
        }

        fetch(`http://127.0.0.1:8000/api/patient-appointments/${patientId}/`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch appointments.');
                }
                return response.json();
            })
            .then((data) => setAppointments(data))
            .catch((error) => {
                console.error('Error fetching appointments:', error);
                setErrorMessage('Error fetching your appointments.');
            });

        fetch('http://127.0.0.1:8000/api/doctors/')
            .then((response) => response.json())
            .then((data) => setDoctors(data))
            .catch((error) => console.error('Error fetching doctors:', error));

        const interval = setInterval(() => {
            fetch(`http://127.0.0.1:8000/api/notifications/${patientId}/`)
                .then((response) => response.json())
                .then((data) => setNotifications(data))
                .catch((error) => console.error('Error fetching notifications:', error));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const validateAppointmentDetails = () => {
        if (!selectedDoctor || !appointmentDate || !reason) {
            alert('Please fill in all fields.');
            return false;
        }
        return true;
    };

    const initiatePayment = () => {
        if (!validateAppointmentDetails()) {
            return;
        }

        const patientId = localStorage.getItem('patientId');
        const appointmentData = {
            doctor_id: selectedDoctor.id,
            patient_id: patientId,
            date: appointmentDate,
            reason: reason,
        };

        setPendingAppointmentData(appointmentData);
        setShowMpesaPayment(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            phone_number: phoneNumber,
            amount: "200",
            account_reference: "Hospital system",
            transaction_desc: "Commitment Fee"
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/mpesa/api/stk/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            
            if (response.ok) {
                alert('Payment notification sent successfully!');
                handleBookAppointment();
                setShowMpesaPayment(false);
            } else {
                alert('Payment failed: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong with the payment!');
        }
    };

    const handleBookAppointment = () => {
        if (!pendingAppointmentData) {
            setBookingError('Invalid appointment data.');
            return;
        }

        fetch('http://127.0.0.1:8000/api/appointments/create/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pendingAppointmentData),
        })
            .then(async (response) => {
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to create appointment.');
                }
                return response.json();
            })
            .then((data) => {
                setAppointments((prev) => [...prev, data]);
                setSelectedDoctor(null);
                setAppointmentDate('');
                setReason('');
                setBookingError('');
                setPendingAppointmentData(null);
                alert('Appointment booked successfully!');
            })
            .catch((error) => {
                console.error('Error:', error);
                if (error.message.includes('within 30 minutes')) {
                    setBookingError(
                        'This time slot is unavailable. The doctor already has an appointment scheduled within one hour of your requested time. Please either:' +
                        '\n• Select a different time slot (at least one hour before or after any existing appointment)' +
                        '\n• Choose a different doctor' +
                        '\n• Try booking for a different day'
                    );
                } else {
                    setBookingError('Error booking appointment. Please try again.');
                }
            });
    };

    const handleDeleteAppointment = (appointmentId) => {
        fetch(`http://127.0.0.1:8000/api/appointments/delete/${appointmentId}/`, {
            method: 'DELETE',
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to delete appointment.');
                }
                return response.json();
            })
            .then(() => {
                setAppointments(appointments.filter((appointment) => appointment.id !== appointmentId));
                alert('Appointment deleted successfully!');
            })
            .catch((error) => {
                console.error('Error:', error);
                setErrorMessage('Error deleting appointment.');
            });
    };

    const handleDeleteNotification = (notificationId) => {
        fetch(`http://127.0.0.1:8000/api/notifications/delete/${notificationId}/`, {
            method: 'DELETE',
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to delete notification.');
                }
                return response.json();
            })
            .then(() => {
                setNotifications(notifications.filter((notification) => notification.id !== notificationId));
                alert('Notification deleted successfully!');
            })
            .catch((error) => {
                console.error('Error:', error);
                setErrorMessage('Error deleting notification.');
            });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-6">
                        <div className="flex items-center space-x-4">
                            <User className="h-12 w-12 text-white" />
                            <h2 className="text-3xl font-bold text-white">Welcome, {patientName}!</h2>
                        </div>
                    </div>
                </div>

                {/* Booking Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    {!showMpesaPayment ? (
                        <>
                            <div className="flex items-center mb-6">
                                <PlusCircle className="h-6 w-6 text-teal-600 mr-2" />
                                <h3 className="text-2xl font-semibold text-gray-800">Book an Appointment</h3>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-500" />
                                            <span>Select Doctor</span>
                                        </div>
                                    </label>
                                    <select
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                                        value={selectedDoctor ? selectedDoctor.id : ''}
                                        onChange={(e) => {
                                            const doctor = doctors.find((doc) => doc.id === parseInt(e.target.value));
                                            setSelectedDoctor(doctor || null);
                                            setBookingError('');
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span>Date and Time</span>
                                        </div>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                                        value={appointmentDate}
                                        onChange={(e) => {
                                            setAppointmentDate(e.target.value);
                                            setBookingError('');
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-500" />
                                            <span>Reason for Visit</span>
                                        </div>
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 min-h-[100px]"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Please describe your symptoms or reason for visit..."
                                    />
                                </div>

                                {bookingError && (
                                    <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
                                        <div className="flex">
                                            <div className="ml-3">
                                                <p className="text-sm text-orange-700 font-medium">Booking Notice:</p>
                                                <p className="mt-2 text-sm text-orange-700 whitespace-pre-line">
                                                    {bookingError}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={initiatePayment}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-500 hover:to-teal-600 transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                                >
                                    <PlusCircle className="h-5 w-5" />
                                    <span>Proceed to Payment</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div
                            className="fixed top-0 left-0 right-0 bottom-0 bg-opacity-50 flex justify-center items-center p-5"
                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', zIndex: 99 }}
                        >
                            <form onSubmit={handleSubmit} className="text-center bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                                    Complete Payment of KES 200 via Mpesa to See a Doctor
                                </h3>

                                <p className="text-gray-700">Enter your Mpesa phone number to proceed with payment.</p>

                                <input
                                    className="w-full px-4 py-3 mt-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter phone number (254xxxxxxxxx)"
                                    type="number"
                                    id="phone_number"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    required
                                />

                                <div className="flex space-x-4 mt-6">
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-all duration-200 font-medium"
                                    >
                                        Pay Now
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowMpesaPayment(false);
                                            setPendingAppointmentData(null);
                                        }}
                                        className="flex-1 py-3 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-400 transition-all duration-200 font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Appointments Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="flex items-center mb-6">
                        <Calendar className="h-6 w-6 text-teal-600 mr-2" />
                        <h3 className="text-2xl font-semibold text-gray-800">Your Appointments</h3>
                    </div>

                    {appointments.length > 0 ? (
                        <div className="space-y-4">
                            {appointments.map((appointment) => (
                                <div
                                    key={appointment.id}
                                    className="bg-gray-50 rounded-xl p-6 transition-all duration-200 hover:shadow-md"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-grow">
                                            <h4 className="text-lg font-semibold text-gray-800">
                                                Dr. {appointment.doctor_name}
                                            </h4>
                                            <p className="text-gray-600 mt-1">
                                                {new Date(appointment.date).toLocaleString()}
                                            </p>
                                            <p className="text-gray-600 mt-2">{appointment.reason}</p>
                                            <p className="mt-2">
                                                Status:
                                                <span
                                                    className={`ml-2 ${appointment.is_approved
                                                        ? 'text-green-600'
                                                        : 'text-yellow-600'}`}
                                                >
                                                    {appointment.is_approved ? 'Approved' : 'Pending'}
                                                </span>
                                            </p>
                                            {appointment.is_approved && (
                                                <div className="mt-4 space-y-3">
                                                    {appointment.diagnosis && (
                                                        <div className="bg-blue-50 p-3 rounded-lg">
                                                            <h5 className="text-blue-800 font-semibold">Diagnosis:</h5>
                                                            <p className="text-blue-700 mt-1">
                                                                {appointment.diagnosis}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {appointment.prescription && (
                                                        <div className="bg-green-50 p-3 rounded-lg">
                                                            <h5 className="text-green-800 font-semibold">
                                                                Prescription:
                                                            </h5>
                                                            <p className="text-green-700 mt-1">
                                                                {appointment.prescription}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteAppointment(appointment.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No appointments scheduled yet.</p>
                    )}
                </div>

                {/* Notifications Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="flex items-center mb-6">
                        <Bell className="h-6 w-6 text-teal-600 mr-2" />
                        <h3 className="text-2xl font-semibold text-gray-800">Notifications</h3>
                    </div>

                    {notifications.length > 0 ? (
                        <div className="space-y-4">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="flex items-center justify-between bg-gray-50 rounded-xl p-4 transition-all duration-200 hover:shadow-md"
                                >
                                    <p className="text-gray-700">{notification.message}</p>
                                    <button
                                        onClick={() => handleDeleteNotification(notification.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No notifications yet.</p>
                    )}
                </div>

                {errorMessage && (
                    <div className="mt-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                        <p className="text-red-700">{errorMessage}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientDashboard;