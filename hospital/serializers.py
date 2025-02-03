from rest_framework import serializers
from .models import Doctor, Patient, Appointment
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username']  # You can add more fields here if you want to serialize more user-related data

class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer()  # Nested UserSerializer

    class Meta:
        model = Doctor
        fields = ['id', 'user', 'specialty']

class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer()  # Nested UserSerializer

    class Meta:
        model = Patient
        fields = ['user', 'birth_date', 'phone_number']

class AppointmentSerializer(serializers.ModelSerializer):
    doctor = serializers.PrimaryKeyRelatedField(queryset=Doctor.objects.all())
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all())

    class Meta:
        model = Appointment
        fields = ['id', 'doctor', 'patient', 'date', 'reason']
