import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Deal(models.Model):
    STAGE_CHOICES = [
        ('prospecting', 'Prospecting'),
        ('qualification', 'Qualification'),
        ('needs_analysis', 'Needs Analysis'),
        ('value_proposition', 'Value Proposition'),
        ('id_decision_makers', 'Id. Decision Makers'),
        ('proposal', 'Proposal/Price Quote'),
        ('negotiation', 'Negotiation/Review'),
        ('closed_won', 'Closed Won'),
        ('closed_lost', 'Closed Lost'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        'accounts.Organization',
        on_delete=models.CASCADE,
        related_name='deals'
    )
    owner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='owned_deals'
    )

    name = models.CharField(max_length=255)
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='prospecting')
    value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='USD')
    probability = models.IntegerField(default=0)  # 0-100

    # Relationships
    contacts = models.ManyToManyField('contacts.Contact', blank=True, related_name='deals')
    leads = models.ManyToManyField('leads.Lead', blank=True, related_name='deals')

    # Dates
    expected_close_date = models.DateField(null=True, blank=True)
    actual_close_date = models.DateField(null=True, blank=True)

    # AI
    ai_win_probability = models.FloatField(null=True, blank=True)
    ai_next_best_action = models.TextField(blank=True)
    ai_risk_factors = models.JSONField(default=list, blank=True)

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'deals_deal'
        ordering = ['-created_at']

    def __str__(self):
        return self.name
