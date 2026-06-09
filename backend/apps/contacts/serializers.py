from rest_framework import serializers
from .models import Contact


class ContactSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)

    class Meta:
        model = Contact
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email',
            'phone', 'company', 'job_title', 'linkedin_url',
            'twitter_handle', 'website', 'address', 'tags',
            'ai_summary', 'notes', 'owner', 'owner_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'ai_summary', 'created_at', 'updated_at']
