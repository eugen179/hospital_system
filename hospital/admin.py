# admin.py

from django.contrib import admin
from .models import Doctor, Patient, Appointment

# Register Doctor model
@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('user', 'specialty')  # Display username and specialty
    search_fields = ('user__username', 'specialty')  # Search by username and specialty

# Register Patient model
@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('user', 'birth_date')  # Display username, birth date, and phone number
    search_fields = ('user__username', 'phone_number')  # Search by username or phone number

# Register Appointment model with custom admin features
@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'date', 'reason')  # Display patient, doctor, date, and reason
    list_filter = ('doctor', 'patient', 'date')  # Filter appointments by doctor, patient, and date
    search_fields = ('doctor__user__username', 'patient__user__username', 'reason')  # Search by doctor, patient, or reason
    ordering = ('-date',)  # Order appointments by date (latest first)
