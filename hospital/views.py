from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from django.contrib.auth import authenticate
from django.db import transaction
from django.core.exceptions import ValidationError
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

class AppointmentCreateView(APIView):
    def post(self, request):
        serializer = AppointmentSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                appointment = serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except ValidationError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ApproveAppointmentView(APIView):
    def post(self, request, appointment_id):
        try:
            with transaction.atomic():
                appointment = Appointment.objects.select_related('doctor', 'patient').get(id=appointment_id)
                if appointment.is_approved:
                    return Response(
                        {"message": "Appointment is already approved"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                appointment.is_approved = True
                appointment.save()

                notification = Notification.objects.create(
                    patient=appointment.patient,
                    message=f"Your appointment with Dr. {appointment.doctor.user.username} on {appointment.date.strftime('%B %d, %Y at %I:%M %p')} has been approved."
                )

                return Response({
                    "message": "Appointment approved successfully",
                    "appointment": {
                        "id": appointment.id,
                        "doctor_name": appointment.doctor.user.username,
                        "patient_name": appointment.patient.user.username,
                        "date": appointment.date,
                        "reason": appointment.reason,
                        "is_approved": appointment.is_approved
                    },
                    "notification": {
                        "id": notification.id,
                        "message": notification.message,
                        "created_at": notification.created_at
                    }
                }, status=status.HTTP_200_OK)

        except Appointment.DoesNotExist:
            return Response(
                {"error": "Appointment not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class NotificationView(APIView):
    def get(self, request, patient_id):
        notifications = Notification.objects.filter(patient_id=patient_id, is_read=False)
        notifications_data = NotificationSerializer(notifications, many=True).data  
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

class AppointmentDeleteView(APIView):
    def delete(self, request, appointment_id):
        try:
            appointment = Appointment.objects.get(id=appointment_id)
            appointment.delete()
            return Response({"message": "Appointment deleted successfully"}, status=status.HTTP_200_OK)
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not found"}, status=status.HTTP_404_NOT_FOUND)