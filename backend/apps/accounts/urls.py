from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('users/', views.UserListCreateView.as_view(), name='user-list'),
    path('organization/', views.OrganizationDetailView.as_view(), name='organization-detail'),
    path('teams/', views.TeamListCreateView.as_view(), name='team-list'),
    path('teams/<uuid:pk>/', views.TeamDetailView.as_view(), name='team-detail'),
    path('active/', views.update_last_active, name='update-last-active'),
]
