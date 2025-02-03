from django.contrib import admin
from .models import Doctor, Patient, Appointment

# Register the Doctor model
admin.site.register(Doctor)

# Register the Patient model
admin.site.register(Patient)

# Register the Appointment model
admin.site.register(Appointment)
