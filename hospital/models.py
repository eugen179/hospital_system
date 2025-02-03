from django.db import models
from django.contrib.auth.models import User

class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    specialty = models.CharField(max_length=100)

    def __str__(self):
        return self.user.username

class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    birth_date = models.DateField()
    phone_number = models.CharField(max_length=15)

    def __str__(self):
        return self.user.username

class Appointment(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    date = models.DateTimeField()
    reason = models.TextField()

    def __str__(self):
        return f"Appointment for {self.patient.user.username} with Dr. {self.doctor.user.username} on {self.date}"
