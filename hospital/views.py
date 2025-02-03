from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.db import transaction
from .serializers import PatientSerializer, DoctorSerializer, AppointmentSerializer
from .models import Patient, Doctor, Appointment

class PatientSignup(APIView):
    def post(self, request):
        user_data = request.data.get('user')
        patient_data = request.data.get('patient')

        if not user_data or not patient_data:
            return Response(
                {"error": "Both 'user' and 'patient' data must be provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                user = User.objects.create_user(**user_data)
                patient = Patient.objects.create(user=user, **patient_data)
                return Response(
                    {"message": "Patient profile created successfully."},
                    status=status.HTTP_201_CREATED,
                )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PatientLogin(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if user is not None:
            try:
                if hasattr(user, "patient"):
                    login(request, user)
                    patient_name = f"{user.first_name} {user.last_name}" if user.first_name and user.last_name else user.username
                    patient_id = user.patient.id  # Get the patient ID from the associated patient profile
                    return Response({
                        "message": "Login successful.",
                        "patient_name": patient_name,
                        "patient_id": patient_id  # Include patient_id in the response
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "This user is not a patient."}, status=status.HTTP_400_BAD_REQUEST)
            except AttributeError:
                return Response({"error": "No associated patient profile."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)



class DoctorLogin(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)
        if user is not None and hasattr(user, "doctor"):
            login(request, user)
            return Response({"message": "Doctor login successful!"}, status=status.HTTP_200_OK)

        return Response({"error": "Invalid credentials or user is not a doctor."}, status=status.HTTP_400_BAD_REQUEST)

class DoctorListView(APIView):
    def get(self, request):
        doctors = Doctor.objects.all()
        serializer = DoctorSerializer(doctors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class DoctorAppointmentsView(APIView):
    def get(self, request, *args, **kwargs):
        # Check if the logged-in user is a doctor
        user = request.user
        
        try:
            # If the user is a doctor, retrieve the doctor's profile
            doctor = user.doctor  # Access the doctor related to the user
        except Doctor.DoesNotExist:
            return Response(
                {"error": "User has no doctor profile. Ensure the profile is created correctly."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Fetch appointments for the doctor
        appointments = Appointment.objects.filter(doctor=doctor)
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)


class AppointmentCreateView(APIView):
    def post(self, request):
        doctor_id = request.data.get('doctor_id')
        patient_id = request.data.get('patient_id')
        date = request.data.get('date')
        reason = request.data.get('reason')

        if not doctor_id or not patient_id or not date or not reason:
            return Response(
                {"error": "Doctor, patient, date, and reason must be provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            doctor = Doctor.objects.get(id=doctor_id)
            patient = Patient.objects.get(id=patient_id)
            appointment = Appointment.objects.create(doctor=doctor, patient=patient, date=date, reason=reason)
            return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)
        except (Doctor.DoesNotExist, Patient.DoesNotExist):
            return Response({"error": "Doctor or patient not found."}, status=status.HTTP_404_NOT_FOUND)


class PatientAppointmentsView(APIView): 
    def get(self, request):
        try:
            patient = request.user.patient  # Ensure the user has a patient profile
        except Patient.DoesNotExist:
            return Response({"error": "Patient profile not found."}, status=status.HTTP_400_BAD_REQUEST)

        appointments = Appointment.objects.filter(patient=patient)
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
