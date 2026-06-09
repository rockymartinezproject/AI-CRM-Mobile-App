from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.accounts.models import Organization
from .models import Lead, LeadActivity

User = get_user_model()


class LeadModelTests(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(name="Test Org", slug="test-org")
        self.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User",
            organization=self.org,
        )

    def test_create_lead(self):
        lead = Lead.objects.create(
            organization=self.org,
            first_name="John",
            last_name="Doe",
            email="john@example.com",
            company="Acme Inc",
            status="new",
            created_by=self.user,
        )
        self.assertEqual(str(lead), "John Doe (Acme Inc)")
        self.assertEqual(lead.full_name, "John Doe")
        self.assertEqual(lead.status, "new")

    def test_lead_activity(self):
        lead = Lead.objects.create(
            organization=self.org,
            first_name="Jane",
            last_name="Smith",
            email="jane@example.com",
            created_by=self.user,
        )
        activity = LeadActivity.objects.create(
            lead=lead,
            activity_type="call",
            subject="Initial call",
            description="Discussed requirements",
        )
        self.assertEqual(lead.activities.count(), 1)
        self.assertEqual(str(activity), "call: Initial call")
