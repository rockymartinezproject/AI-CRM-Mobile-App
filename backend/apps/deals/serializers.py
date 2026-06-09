from rest_framework import serializers
from .models import Deal


class DealSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    contact_names = serializers.SerializerMethodField()
    lead_names = serializers.SerializerMethodField()

    class Meta:
        model = Deal
        fields = [
            'id', 'name', 'stage', 'value', 'currency', 'probability',
            'contacts', 'contact_names', 'leads', 'lead_names',
            'expected_close_date', 'actual_close_date',
            'ai_win_probability', 'ai_next_best_action', 'ai_risk_factors',
            'notes', 'owner', 'owner_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'ai_win_probability', 'ai_next_best_action',
            'ai_risk_factors', 'created_at', 'updated_at'
        ]

    def get_contact_names(self, obj):
        return [c.full_name for c in obj.contacts.all()]

    def get_lead_names(self, obj):
        return [l.full_name for l in obj.leads.all()]
