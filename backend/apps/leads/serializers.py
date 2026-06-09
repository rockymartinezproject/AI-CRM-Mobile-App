from rest_framework import serializers
from .models import Lead, LeadActivity


class LeadActivitySerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)

    class Meta:
        model = LeadActivity
        fields = [
            'id', 'lead', 'activity_type', 'subject',
            'description', 'metadata', 'created_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class LeadListSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    activity_count = serializers.IntegerField(source='activities.count', read_only=True)

    class Meta:
        model = Lead
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email',
            'phone', 'company', 'job_title', 'status', 'source',
            'priority', 'ai_score', 'ai_churn_risk', 'estimated_value',
            'owner', 'owner_name', 'last_contact_at', 'next_follow_up_at',
            'activity_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'ai_score', 'ai_churn_risk', 'created_at', 'updated_at']


class LeadDetailSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    activities = LeadActivitySerializer(many=True, read_only=True)

    class Meta:
        model = Lead
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email',
            'phone', 'company', 'job_title', 'status', 'source',
            'priority', 'ai_score', 'ai_score_reasoning',
            'ai_churn_risk', 'ai_churn_reasons',
            'estimated_value', 'owner', 'owner_name',
            'last_contact_at', 'next_follow_up_at',
            'notes', 'activities', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'ai_score', 'ai_churn_risk', 'created_at', 'updated_at']


class LeadCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = [
            'id', 'first_name', 'last_name', 'email',
            'phone', 'company', 'job_title', 'status', 'source',
            'estimated_value', 'owner', 'notes',
            'last_contact_at', 'next_follow_up_at'
        ]
        read_only_fields = ['id']
