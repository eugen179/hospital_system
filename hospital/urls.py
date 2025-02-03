from django.urls import path
from .views import PatientSignup, PatientLogin, DoctorLogin, DoctorListView, AppointmentCreateView, PatientAppointmentsView, DoctorAppointmentsView

urlpatterns = [
    # Patient URLs
    path('patient/signup/', PatientSignup.as_view(), name='patient_signup'),
    path('patient/login/', PatientLogin.as_view(), name='patient_login'),
    

    # Doctor URLs
    path('doctor/login/', DoctorLogin.as_view(), name='doctor_login'),
    path('doctors/', DoctorListView.as_view(), name='doctor_list'),  # List of doctors for patients
     path('doctor-appointments/', DoctorAppointmentsView.as_view(), name='doctor-appointments'),

    # Appointment URLs
    path('appointments/create/', AppointmentCreateView.as_view(), name='appointment_create'),
    path('patient-appointments/', PatientAppointmentsView.as_view(), name='patient_appointments'),
]
