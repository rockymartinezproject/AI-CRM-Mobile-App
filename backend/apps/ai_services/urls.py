from django.urls import path
from . import views

urlpatterns = [
    path('leads/<uuid:lead_id>/score/', views.score_lead, name='ai-score-lead'),
    path('leads/<uuid:lead_id>/compose/', views.compose_follow_up, name='ai-compose'),
    path('leads/<uuid:lead_id>/churn/', views.churn_prediction, name='ai-churn'),
    path('leads/<uuid:lead_id>/embedding/', views.generate_lead_embedding, name='ai-embedding'),
    path('transcribe/', views.transcribe_meeting, name='ai-transcribe'),
    path('search/', views.search_natural_language, name='ai-search'),
    path('suggest/', views.realtime_suggestion, name='ai-suggest'),
    path('about/', views.about, name='ai-about'),
]
