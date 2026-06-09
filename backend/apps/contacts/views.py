from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Contact
from .serializers import ContactSerializer


class ContactListCreateView(generics.ListCreateAPIView):
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['company', 'owner']
    search_fields = ['first_name', 'last_name', 'email', 'company', 'job_title']
    ordering_fields = ['created_at', 'updated_at', 'last_name']
    ordering = ['-created_at']

    def get_queryset(self):
        return Contact.objects.filter(
            organization=self.request.user.organization
        ).select_related('owner')

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)


class ContactDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Contact.objects.filter(
            organization=self.request.user.organization
        ).select_related('owner')
