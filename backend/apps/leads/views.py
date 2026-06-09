from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Lead, LeadActivity
from .serializers import (
    LeadListSerializer, LeadDetailSerializer,
    LeadCreateUpdateSerializer, LeadActivitySerializer
)


class LeadListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'source', 'owner']
    search_fields = ['first_name', 'last_name', 'email', 'company', 'job_title']
    ordering_fields = ['created_at', 'updated_at', 'priority', 'ai_score', 'last_contact_at']
    ordering = ['-priority', '-created_at']

    def get_queryset(self):
        return Lead.objects.filter(
            organization=self.request.user.organization
        ).select_related('owner')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return LeadCreateUpdateSerializer
        return LeadListSerializer

    def perform_create(self, serializer):
        serializer.save(
            organization=self.request.user.organization,
            created_by=self.request.user
        )


class LeadDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Lead.objects.filter(
            organization=self.request.user.organization
        ).select_related('owner').prefetch_related('activities')

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return LeadCreateUpdateSerializer
        return LeadDetailSerializer


class LeadActivityListCreateView(generics.ListCreateAPIView):
    serializer_class = LeadActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LeadActivity.objects.filter(
            lead__organization=self.request.user.organization,
            lead_id=self.kwargs['lead_id']
        )

    def perform_create(self, serializer):
        lead = Lead.objects.get(
            id=self.kwargs['lead_id'],
            organization=self.request.user.organization
        )
        serializer.save(lead=lead, created_by=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def bulk_update_lead_status(request):
    lead_ids = request.data.get('lead_ids', [])
    new_status = request.data.get('status')

    if not lead_ids or not new_status:
        return Response(
            {'error': 'lead_ids and status are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    updated = Lead.objects.filter(
        id__in=lead_ids,
        organization=request.user.organization
    ).update(status=new_status)

    return Response({'updated': updated})
