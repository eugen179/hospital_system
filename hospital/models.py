from django.db import models
from django.contrib.auth.models import User

class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    specialty = models.CharField(max_length=100)

    def _str_(self):
        return self.user.username

class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    birth_date = models.DateField()
    phone_number = models.CharField(max_length=15)

    def _str_(self):
        return self.user.username
    
class Notification(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    message = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)  # Add the 'is_read' field

    def _str_(self):
        return f"Notification for {self.patient.username}"

class Appointment(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    date = models.DateTimeField()
    reason = models.TextField()
    is_approved = models.BooleanField(default=False)  # New field for appointment approval

    def _str_(self):
        return f"Appointment for {self.patient.user.username} with Dr. {self.doctor.user.username} on {self.date}"