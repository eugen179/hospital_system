from django.urls import path
from . import views

urlpatterns = [
    path('api/stk/', views.stk_push, name='stk_push'),  # Only POST method will be allowed
]
