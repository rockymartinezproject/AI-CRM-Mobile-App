from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<uuid:notification_id>/read/', views.mark_notification_read, name='notification-read'),
    path('mark-all-read/', views.mark_all_read, name='notification-read-all'),
]
