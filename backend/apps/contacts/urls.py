from django.urls import path
from . import views

urlpatterns = [
    path('', views.ContactListCreateView.as_view(), name='contact-list'),
    path('<uuid:pk>/', views.ContactDetailView.as_view(), name='contact-detail'),
]
