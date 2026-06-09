from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(source='assignee.full_name', read_only=True)
    related_name = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'priority', 'status',
            'lead', 'contact', 'deal', 'related_name',
            'due_date', 'completed_at',
            'ai_suggested', 'ai_reasoning',
            'assignee', 'assignee_name', 'created_by',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'ai_suggested', 'ai_reasoning', 'created_at', 'updated_at']

    def get_related_name(self, obj):
        if obj.lead:
            return obj.lead.full_name
        if obj.contact:
            return obj.contact.full_name
        if obj.deal:
            return obj.deal.name
        return None
