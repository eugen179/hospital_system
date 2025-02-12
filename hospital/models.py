from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from datetime import timedelta

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
    is_approved = models.BooleanField(default=False)
    prescription = models.TextField(blank=True, null=True)  
    diagnosis = models.TextField(blank=True, null=True)  

    def __str__(self):
        return f"Appointment for {self.patient.user.username} with Dr. {self.doctor.user.username} on {self.date}"

    def clean(self):
        if not self.date:
            return

        # Check for overlapping appointments
        time_threshold = timedelta(minutes=30)
        start_time = self.date - time_threshold
        end_time = self.date + time_threshold

        overlapping_appointments = Appointment.objects.filter(
            doctor=self.doctor,
            date__range=(start_time, end_time)
        ).exclude(id=self.id)

        if overlapping_appointments.exists():
            raise ValidationError(
                'There is already an appointment scheduled within 30 minutes of this time slot. '
                'Please choose a time slot that is at least 30 minutes apart from existing appointments.'
            )

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

class Notification(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):  # Fixed method name
        return f"Notification for {self.patient.user.username}"
