from django.contrib import admin
from .models import Lead, LeadActivity


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = [
        'full_name', 'company', 'status', 'priority',
        'ai_score', 'ai_churn_risk', 'owner', 'created_at'
    ]
    list_filter = ['status', 'source', 'created_at']
    search_fields = ['first_name', 'last_name', 'email', 'company']
    readonly_fields = ['ai_score', 'ai_churn_risk', 'created_at', 'updated_at']


@admin.register(LeadActivity)
class LeadActivityAdmin(admin.ModelAdmin):
    list_display = ['lead', 'activity_type', 'subject', 'created_at']
    list_filter = ['activity_type', 'created_at']
    search_fields = ['subject', 'description']
