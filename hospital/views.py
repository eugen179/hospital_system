# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import status
from django.contrib.auth import authenticate
from .models import Doctor, Patient, Appointment, Notification
from .serializers import DoctorSerializer, PatientSerializer, AppointmentSerializer, PatientAppointmentSerializer, NotificationSerializer

class PatientSignup(APIView):
    def post(self, request):
        serializer = PatientSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Patient signed up successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PatientLogin(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        if user is not None:
            patient = Patient.objects.filter(user=user).first()
            if patient:
                return Response({"message": "Patient login successful", "patient_id": patient.id})
            return Response({"error": "No associated patient found"}, status=status.HTTP_404_NOT_FOUND)
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class DoctorLogin(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        if user is not None:
            doctor = Doctor.objects.filter(user=user).first()
            if doctor:
                return Response({"message": "Doctor login successful", "doctor_id": doctor.id})
            return Response({"error": "No associated doctor found"}, status=status.HTTP_404_NOT_FOUND)
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class DoctorListView(generics.ListCreateAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer


class DoctorDetailView(generics.RetrieveAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer


class ApproveAppointmentView(APIView):
    def post(self, request, appointment_id):
        try:
            appointment = Appointment.objects.get(id=appointment_id)
            appointment.is_approved = True
            appointment.save()

            # Send notification to the patient
            notification = Notification.objects.create(
                patient=appointment.patient,
                message=f"Your appointment with Dr. {appointment.doctor.user.username} has been approved."
            )

            # Serialize and return the notification
            notification_serializer = NotificationSerializer(notification)
            return Response({"message": "Appointment approved successfully", "notification": notification_serializer.data}, status=status.HTTP_200_OK)
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not found"}, status=status.HTTP_404_NOT_FOUND)


class NotificationView(APIView):
    def get(self, request, patient_id):
        notifications = Notification.objects.filter(patient_id=patient_id, is_read=False)
        notifications_data = NotificationSerializer(notifications, many=True).data  # Serialize notifications
        return Response(notifications_data, status=status.HTTP_200_OK)


class PatientAppointmentsView(APIView):
    def get(self, request, patient_id):
        appointments = Appointment.objects.filter(patient_id=patient_id)
        serializer = PatientAppointmentSerializer(appointments, many=True)
        return Response(serializer.data)


class DoctorAppointmentsView(APIView):
    def get(self, request, doctor_id):
        appointments = Appointment.objects.filter(doctor_id=doctor_id)
        serializer = PatientAppointmentSerializer(appointments, many=True)
        return Response(serializer.data)


class AppointmentCreateView(APIView):
    def post(self, request):
        # Initialize the serializer with incoming data
        serializer = AppointmentSerializer(data=request.data)

        if serializer.is_valid():  # Validate the data
            appointment = serializer.save()  # Create the appointment
            return Response(serializer.data, status=status.HTTP_201_CREATED)  # Return success response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  # Return error if validation fails