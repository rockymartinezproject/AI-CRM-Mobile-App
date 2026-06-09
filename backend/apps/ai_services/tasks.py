from celery import shared_task
from django.contrib.auth import get_user_model
from apps.leads.models import Lead, LeadActivity
from apps.tasks.models import Task
from .services import (
    generate_lead_score,
    predict_churn,
    generate_embedding,
    compose_message,
)

User = get_user_model()


@shared_task
def score_lead_task(lead_id: str):
    """Async task to score a lead using OpenAI."""
    try:
        lead = Lead.objects.get(id=lead_id)
    except Lead.DoesNotExist:
        return {"error": "Lead not found"}

    activities = list(lead.activities.values(
        'activity_type', 'subject', 'description', 'created_at'
    ))

    lead_data = {
        "first_name": lead.first_name,
        "last_name": lead.last_name,
        "email": lead.email,
        "phone": lead.phone,
        "company": lead.company,
        "job_title": lead.job_title,
        "status": lead.status,
        "source": lead.source,
        "estimated_value": str(lead.estimated_value) if lead.estimated_value else None,
        "notes": lead.notes,
    }

    result = generate_lead_score(lead_data, activities)

    lead.ai_score = result.get("score")
    lead.ai_score_reasoning = result.get("reasoning", "")
    lead.ai_churn_risk = result.get("churn_risk")
    lead.ai_churn_reasons = result.get("churn_reasons", [])
    lead.priority = result.get("score", 0)
    lead.save()

    # Create AI insight activity
    LeadActivity.objects.create(
        lead=lead,
        activity_type='ai_insight',
        subject='AI Lead Scoring Completed',
        description=result.get("reasoning", ""),
        metadata={
            "score": result.get("score"),
            "churn_risk": result.get("churn_risk"),
            "recommended_next_action": result.get("recommended_next_action"),
        }
    )

    # If churn risk is high, create a follow-up task
    if result.get("churn_risk", 0) > 70:
        Task.objects.create(
            organization=lead.organization,
            title=f"Re-engage at-risk lead: {lead.full_name}",
            description=f"Churn risk is {result.get('churn_risk')}. Recommended action: {result.get('recommended_next_action')}",
            priority='high',
            lead=lead,
            assignee=lead.owner,
            ai_suggested=True,
            ai_reasoning=result.get("reasoning", ""),
        )

    return {"lead_id": str(lead_id), "score": lead.ai_score}


@shared_task
def generate_lead_embedding_task(lead_id: str):
    """Generate embedding for semantic search."""
    try:
        lead = Lead.objects.get(id=lead_id)
    except Lead.DoesNotExist:
        return {"error": "Lead not found"}

    text = f"{lead.first_name} {lead.last_name} {lead.company} {lead.job_title} {lead.notes}"
    embedding = generate_embedding(text)
    lead.embedding = embedding
    lead.save(update_fields=['embedding'])
    return {"lead_id": str(lead_id), "embedding_length": len(embedding)}


@shared_task
def compose_follow_up_task(lead_id: str, channel: str = "email", tone: str = "professional"):
    """Async task to compose AI follow-up message."""
    try:
        lead = Lead.objects.get(id=lead_id)
    except Lead.DoesNotExist:
        return {"error": "Lead not found"}

    activities = list(lead.activities.values(
        'activity_type', 'subject', 'description', 'created_at'
    ))

    lead_data = {
        "first_name": lead.first_name,
        "last_name": lead.last_name,
        "company": lead.company,
        "job_title": lead.job_title,
        "status": lead.status,
    }

    result = compose_message(lead_data, activities, channel=channel, tone=tone)
    return {
        "lead_id": str(lead_id),
        "channel": channel,
        "subject": result.get("subject"),
        "body": result.get("body"),
        "personalization_notes": result.get("personalization_notes"),
    }
