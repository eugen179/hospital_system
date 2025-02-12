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
    class Meta:
        model = Patient
        fields = ['user', 'birth_date', 'phone_number',]  # Include phone_number

class NotificationSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(read_only=True)
    appointment_id = serializers.IntegerField(source='appointment.id', read_only=True, allow_null=True)

    class Meta:
        model = Notification
        fields = ['id', 'patient', 'message', 'created_at', 'is_read', 'appointment_id']

    def create(self, validated_data):
        notification = Notification.objects.create(**validated_data)
        return notification

class AppointmentSerializer(serializers.ModelSerializer):
    doctor_id = serializers.IntegerField(write_only=True)
    patient_id = serializers.IntegerField(write_only=True)
    approved_at = serializers.DateTimeField(read_only=True)
    doctor_name = serializers.ReadOnlyField(source='doctor.user.username')
    patient_name = serializers.ReadOnlyField(source='patient.user.username')
    prescription = serializers.CharField(required=False, allow_null=True)
    diagnosis = serializers.CharField(required=False, allow_null=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'doctor_id', 'patient_id', 'doctor_name', 'patient_name',
            'date', 'reason', 'is_approved', 'approved_at', 'prescription', 'diagnosis'
        ]
        read_only_fields = ['is_approved', 'approved_at']

    def create(self, validated_data):
        doctor_id = validated_data.pop('doctor_id')
        patient_id = validated_data.pop('patient_id')

        doctor = Doctor.objects.get(id=doctor_id)
        patient = Patient.objects.get(id=patient_id)

        appointment = Appointment.objects.create(
            doctor=doctor,
            patient=patient,
            **validated_data
        )
        return appointment


class PatientAppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.ReadOnlyField(source="doctor.user.username")
    patient_name = serializers.ReadOnlyField(source="patient.user.username")
    approved_at = serializers.DateTimeField(read_only=True)
    prescription = serializers.CharField(read_only=True)
    diagnosis = serializers.CharField(read_only=True)

    class Meta:
        model = Appointment
        fields = ['id', 'doctor_name', 'patient_name', 'date', 'reason', 
                 'is_approved', 'approved_at', 'prescription', 'diagnosis']
        read_only_fields = ['is_approved', 'approved_at', 'prescription', 'diagnosis']