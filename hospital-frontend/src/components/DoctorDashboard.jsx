import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Clock, User, Calendar, FileText } from 'lucide-react';

const DoctorDashboard = () => {
	const [ doctorName, setDoctorName ] = useState('');
	const [ appointments, setAppointments ] = useState([]);
	const [ errorMessage, setErrorMessage ] = useState('');
	const [ loading, setLoading ] = useState(false);
	const [ editingAppointment, setEditingAppointment ] = useState(null);
	const [ diagnosis, setDiagnosis ] = useState('');
	const [ prescription, setPrescription ] = useState('');

	useEffect(() => {
		const storedDoctorName = localStorage.getItem('doctorName');
		const storedDoctorId = localStorage.getItem('doctorId');

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
				throw new Error('Failed to fetch appointments');
			}
			const data = await response.json();
			setAppointments(data);
		} catch (error) {
			console.error('Error fetching appointments:', error);
			setErrorMessage('There was an error fetching your appointments.');
		} finally {
			setLoading(false);
		}
	};

	const handleApprove = async (appointmentId) => {
		try {
			const response = await fetch(`http://127.0.0.1:8000/api/appointments/approve/${appointmentId}/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				throw new Error('Failed to approve appointment');
			}

			const data = await response.json();

			setAppointments(
				appointments.map((apt) => (apt.id === appointmentId ? { ...apt, is_approved: true } : apt))
			);

			alert(data.message || 'Appointment approved successfully');
		} catch (error) {
			console.error('Error approving appointment:', error);
			setErrorMessage('Failed to approve appointment. Please try again.');
		}
	};

	const handleEdit = (appointment) => {
		setEditingAppointment(appointment);
		setDiagnosis(appointment.diagnosis || '');
		setPrescription(appointment.prescription || '');
	};

	const handleUpdateAppointment = async () => {
		if (!editingAppointment) return;

		try {
			const response = await fetch(`http://127.0.0.1:8000/api/appointments/update/${editingAppointment.id}/`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					prescription,
					diagnosis,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to update appointment');
			}

			const data = await response.json();
			alert('Appointment updated successfully!');
			setEditingAppointment(null);

			const doctorId = localStorage.getItem('doctorId');
			if (doctorId) {
				await fetchAppointments(doctorId);
			}
		} catch (error) {
			console.error('Error updating appointment:', error);
			setErrorMessage('Failed to update appointment.');
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-8">
			<div className="max-w-4xl w-full mx-4">
				<div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
					<div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 relative overflow-hidden">
						<div className="absolute inset-0 bg-pattern opacity-10" />
						<h2 className="text-3xl font-bold text-white text-center relative z-10">
							Welcome, Dr. {doctorName}!
						</h2>
					</div>

					{loading && (
						<div className="p-4 bg-blue-50 text-blue-700 text-center animate-pulse">
							Loading appointments...
						</div>
					)}

					{errorMessage && (
						<div className="mx-6 mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-red-700">
							{errorMessage}
						</div>
					)}

					<div className="p-6 space-y-4">
						{appointments.map((appointment) => (
							<div
								key={appointment.id}
								className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 p-6"
							>
								<div className="flex justify-between items-start flex-wrap gap-4 w-full">
									<div className="space-y-3 flex-1">
										<div className="flex items-center gap-2">
											<User className="text-blue-600" size={20} />
											<h4 className="text-lg font-semibold text-gray-900">
												{appointment.patient_name}
											</h4>
										</div>

										<div className="flex items-center gap-2 text-gray-600">
											<Calendar size={18} />
											<p>{new Date(appointment.date).toLocaleString()}</p>
										</div>

										<div className="flex items-center gap-2 text-gray-600">
											<FileText size={18} />
											<p>Reason: {appointment.reason}</p>
										</div>

										<div className="flex items-center gap-2">
											{appointment.is_approved ? (
												<div className="flex items-center gap-1 text-green-600">
													<CheckCircle size={18} />
													<span className="font-medium">Approved</span>
												</div>
											) : (
												<div className="flex items-center gap-1 text-yellow-600">
													<Clock size={18} />
													<span className="font-medium">Pending</span>
												</div>
											)}
										</div>

										{appointment.diagnosis && (
											<div className="bg-blue-50 rounded-lg p-3 mt-4 w-full">
												<p className="text-blue-800">
													<span className="font-medium">Diagnosis:</span>{' '}
													{appointment.diagnosis}
												</p>
											</div>
										)}

										{appointment.prescription && (
											<div className="bg-green-50 rounded-lg p-3 mt-4 w-full">
												<p className="text-green-800">
													<span className="font-medium">Prescription:</span>{' '}
													{appointment.prescription}
												</p>
											</div>
										)}
									</div>

									<div className="flex gap-2 mt-4">
										{!appointment.is_approved && (
											<button
												onClick={() => handleApprove(appointment.id)}
												className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
											>
												Approve
											</button>
										)}
										{appointment.is_approved && (
											<button
												onClick={() => handleEdit(appointment)}
												className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
											>
												Update Details
											</button>
										)}
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Modal */}
					{editingAppointment && (
						<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
							<div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-fadeIn">
								<div className="p-6">
									<h3 className="text-xl font-semibold mb-4">Update Appointment Details</h3>

									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Diagnosis
											</label>
											<textarea
												className="w-full border rounded-lg p-2 min-h-[100px] focus:ring-2 
                          focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
												value={diagnosis}
												onChange={(e) => setDiagnosis(e.target.value)}
												placeholder="Enter diagnosis..."
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Prescription
											</label>
											<textarea
												className="w-full border rounded-lg p-2 min-h-[100px] focus:ring-2 
                          focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
												value={prescription}
												onChange={(e) => setPrescription(e.target.value)}
												placeholder="Enter prescription details..."
											/>
										</div>
										<div className="flex justify-end space-x-2">
											<button
												onClick={() => setEditingAppointment(null)}
												className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition duration-200"
											>
												Cancel
											</button>
											<button
												onClick={handleUpdateAppointment}
												className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg 
                          transition-all duration-200 transform hover:scale-105"
											>
												Save Changes
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default DoctorDashboard;
