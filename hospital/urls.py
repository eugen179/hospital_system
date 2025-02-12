from django.urls import path
from .views import PatientSignup, PatientLogin, DoctorLogin, DoctorListView, AppointmentCreateView, PatientAppointmentsView, DoctorAppointmentsView,ApproveAppointmentView,AppointmentDeleteView,NotificationView,NotificationDeleteView,UpdateAppointmentDetailsView

urlpatterns = [
    path('patient/signup/', PatientSignup.as_view(), name='patient_signup'),
    path('patient/login/', PatientLogin.as_view(), name='patient_login'),
    path('doctor/login/', DoctorLogin.as_view(), name='doctor_login'),
    path('doctors/', DoctorListView.as_view(), name='doctor_list'),
    path('doctor-appointments/<int:doctor_id>/', DoctorAppointmentsView.as_view(), name='doctor_appointments'),
    path('appointments/create/', AppointmentCreateView.as_view(), name='appointment_create'),
    path('patient-appointments/<int:patient_id>/', PatientAppointmentsView.as_view(), name='patient_appointments'),
    path('notifications/<int:patient_id>/', NotificationView.as_view(), name='notifications'),
    path('appointments/update/<int:appointment_id>/', UpdateAppointmentDetailsView.as_view(), name='update_appointment_details'),
    path('notifications/delete/<int:notification_id>/', NotificationDeleteView.as_view(), name='delete-notification'),
    path('appointments/delete/<int:appointment_id>/', AppointmentDeleteView.as_view(), name='appointment_delete'), 
    path('appointments/approve/<int:appointment_id>/', ApproveAppointmentView.as_view(), name='approve_appointment'),
]