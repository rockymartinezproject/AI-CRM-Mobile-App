from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Deal
from .serializers import DealSerializer


class DealListCreateView(generics.ListCreateAPIView):
    serializer_class = DealSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['stage', 'owner']
    search_fields = ['name', 'notes']
    ordering_fields = ['created_at', 'updated_at', 'value', 'expected_close_date']
    ordering = ['-created_at']

    def get_queryset(self):
        return Deal.objects.filter(
            organization=self.request.user.organization
        ).select_related('owner').prefetch_related('contacts', 'leads')

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)


class DealDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DealSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Deal.objects.filter(
            organization=self.request.user.organization
        ).select_related('owner').prefetch_related('contacts', 'leads')
