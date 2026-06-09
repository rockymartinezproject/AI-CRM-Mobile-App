from django.urls import path
from . import views

urlpatterns = [
    path('', views.LeadListCreateView.as_view(), name='lead-list'),
    path('<uuid:pk>/', views.LeadDetailView.as_view(), name='lead-detail'),
    path('<uuid:lead_id>/activities/', views.LeadActivityListCreateView.as_view(), name='lead-activities'),
    path('bulk-update-status/', views.bulk_update_lead_status, name='lead-bulk-update'),
]
