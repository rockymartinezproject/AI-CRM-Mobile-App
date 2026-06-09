from django.contrib import admin
from .models import Deal


@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = ['name', 'stage', 'value', 'probability', 'owner', 'created_at']
    list_filter = ['stage', 'created_at']
    search_fields = ['name', 'notes']
