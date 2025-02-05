from django.urls import path
from .views import PatientSignup, PatientLogin, DoctorLogin, DoctorListView, AppointmentCreateView, PatientAppointmentsView, DoctorAppointmentsView

urlpatterns = [
    path('patient/signup/', PatientSignup.as_view(), name='patient_signup'),
    path('patient/login/', PatientLogin.as_view(), name='patient_login'),
    path('doctor/login/', DoctorLogin.as_view(), name='doctor_login'),
    path('doctors/', DoctorListView.as_view(), name='doctor_list'),
    path('doctor-appointments/<int:doctor_id>/', DoctorAppointmentsView.as_view(), name='doctor_appointments'),
    path('appointments/create/', AppointmentCreateView.as_view(), name='appointment_create'),
    path('patient-appointments/<int:patient_id>/', PatientAppointmentsView.as_view(), name='patient_appointments'),
]