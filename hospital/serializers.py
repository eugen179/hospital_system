# serializers.py
from rest_framework import serializers
from .models import Doctor, Patient, Appointment, Notification
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Doctor
        fields = ['id', 'user', 'specialty']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(**user_data)
        doctor = Doctor.objects.create(user=user, **validated_data)
        return doctor


class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Patient
        fields = ['id', 'user']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(**user_data)
        patient = Patient.objects.create(user=user, **validated_data)
        return patient


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'patient', 'message', 'date_created', 'is_read']  # Add 'is_read' field

    def create(self, validated_data):
        notification = Notification.objects.create(**validated_data)
        return notification


class AppointmentSerializer(serializers.ModelSerializer):
    doctor_id = serializers.IntegerField(write_only=True)
    patient_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Appointment
        fields = ['doctor_id', 'patient_id', 'date', 'reason', 'is_approved']

    def create(self, validated_data):
        doctor_id = validated_data.pop('doctor_id')
        patient_id = validated_data.pop('patient_id')

        # Fetch the doctor and patient instances using the IDs
        doctor = Doctor.objects.get(id=doctor_id)
        patient = Patient.objects.get(id=patient_id)

        # Create and return the appointment
        appointment = Appointment.objects.create(doctor=doctor, patient=patient, **validated_data)
        return appointment


class PatientAppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.ReadOnlyField(source="doctor.user.username")
    patient_name = serializers.ReadOnlyField(source="patient.user.username")

    class Meta:
        model = Appointment
        fields = ['id', 'doctor_name', 'patient_name', 'date', 'reason', 'is_approved']  # Added is_approved field