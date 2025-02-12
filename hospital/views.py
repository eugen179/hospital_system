from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from django.contrib.auth import authenticate
from django.utils import timezone
from django.utils.timezone import localtime
from django.db import transaction
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from .models import Doctor, Patient, Appointment, Notification
from .serializers import DoctorSerializer, PatientSerializer, AppointmentSerializer, PatientAppointmentSerializer, NotificationSerializer

class PatientSignup(APIView):
    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        birth_date = request.data.get("birth_date")
        phone_number = request.data.get("phone_number")

        if not username or not email or not password or not birth_date or not phone_number:
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if email already exists
        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if username already exists
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create_user(username=username, email=email, password=password)
            patient_data = {
                "user": user.id,
                "birth_date": birth_date,
                "phone_number": phone_number
            }
            serializer = PatientSerializer(data=patient_data)

            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Patient signed up successfully"}, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PatientLogin(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        if user is not None:
            patient = Patient.objects.filter(user=user).first()
            if patient:
                return Response({
                    "message": "Patient login successful",
                    "patient_id": patient.id,
                    "patient_name": user.first_name or user.username  # Use first_name if available
                })
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

                local_appointment_time = localtime(appointment.date)
                formatted_time = local_appointment_time.strftime('%B %d, %Y at %I:%M %p')

                notification = Notification.objects.create(
                    patient=appointment.patient,
                    message=f"Your appointment with Dr. {appointment.doctor.user.username} scheduled for {formatted_time} has been approved."
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
        
class NotificationDeleteView(APIView):
    def delete(self, request, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id)
            notification.delete()
            return Response({"message": "Notification deleted successfully"}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)
        
class UpdateAppointmentDetailsView(APIView):
    def put(self, request, appointment_id):
        try:
            appointment = Appointment.objects.get(id=appointment_id)
            
            if not appointment.is_approved:
                return Response({"error": "Appointment is not approved yet"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Fix the field names to match the model
            appointment.prescription = request.data.get('prescription', appointment.prescription)
            appointment.diagnosis = request.data.get('diagnosis', appointment.diagnosis)
            appointment.save()
            
            # Create a notification for the patient
            Notification.objects.create(
                patient=appointment.patient,
                message=f"Dr. {appointment.doctor.user.username} has updated your appointment details."
            )
            
            return Response({
                "message": "Appointment details updated successfully",
                "prescription": appointment.prescription,
                "diagnosis": appointment.diagnosis
            }, status=status.HTTP_200_OK)
        
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not found"}, status=status.HTTP_404_NOT_FOUND)
