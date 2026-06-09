from django.urls import path
from . import views

urlpatterns = [
    path('', views.DealListCreateView.as_view(), name='deal-list'),
    path('<uuid:pk>/', views.DealDetailView.as_view(), name='deal-detail'),
]
