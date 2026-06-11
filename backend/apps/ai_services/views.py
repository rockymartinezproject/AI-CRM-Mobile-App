import os
import tempfile
from django.db.models import Q
from django.conf import settings
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from apps.leads.models import Lead
from apps.tasks.models import Task
from .services import (
    generate_lead_score,
    compose_message,
    transcribe_audio,
    predict_churn,
    intelligent_search,
    suggest_reply,
    generate_embedding,
)
from .tasks import score_lead_task, compose_follow_up_task

User = get_user_model()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def score_lead(request, lead_id):
    """Trigger async lead scoring."""
    try:
        lead = Lead.objects.get(id=lead_id, organization=request.user.organization)
    except Lead.DoesNotExist:
        return Response({'error': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)

    task = score_lead_task.delay(str(lead_id))
    return Response({'task_id': task.id, 'status': 'processing'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def compose_follow_up(request, lead_id):
    """Generate AI-composed follow-up message."""
    try:
        lead = Lead.objects.get(id=lead_id, organization=request.user.organization)
    except Lead.DoesNotExist:
        return Response({'error': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)

    channel = request.data.get('channel', 'email')
    tone = request.data.get('tone', 'professional')
    purpose = request.data.get('purpose', 'follow_up')

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

    result = compose_message(lead_data, activities, channel=channel, tone=tone, purpose=purpose)
    return Response(result)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def transcribe_meeting(request):
    """Transcribe uploaded audio file."""
    audio_file = request.FILES.get('audio')
    if not audio_file:
        return Response({'error': 'No audio file provided'}, status=status.HTTP_400_BAD_REQUEST)

    # Save to temp file
    suffix = os.path.splitext(audio_file.name)[1] or '.mp3'
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        for chunk in audio_file.chunks():
            tmp.write(chunk)
        tmp_path = tmp.name

    try:
        result = transcribe_audio(tmp_path)
    finally:
        os.unlink(tmp_path)

    # Optionally link to a lead
    lead_id = request.data.get('lead_id')
    if lead_id:
        try:
            lead = Lead.objects.get(id=lead_id, organization=request.user.organization)
            from apps.leads.models import LeadActivity
            LeadActivity.objects.create(
                lead=lead,
                activity_type='note',
                subject='Voice-to-Text Meeting Notes',
                description=result.get('summary', ''),
                metadata={
                    'raw_transcript': result.get('raw_transcript', ''),
                    'action_items': result.get('action_items', []),
                    'sentiment': result.get('sentiment', ''),
                }
            )
        except Lead.DoesNotExist:
            pass

    return Response(result)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def churn_prediction(request, lead_id):
    """Get churn prediction for a lead."""
    try:
        lead = Lead.objects.get(id=lead_id, organization=request.user.organization)
    except Lead.DoesNotExist:
        return Response({'error': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)

    activities = list(lead.activities.values(
        'activity_type', 'subject', 'description', 'created_at'
    ))

    lead_data = {
        "first_name": lead.first_name,
        "last_name": lead.last_name,
        "company": lead.company,
        "status": lead.status,
        "last_contact_at": str(lead.last_contact_at) if lead.last_contact_at else None,
        "notes": lead.notes,
    }

    result = predict_churn(lead_data, activities)
    return Response(result)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def search_natural_language(request):
    """Process natural language search query."""
    query = request.data.get('query', '')
    if not query:
        return Response({'error': 'Query is required'}, status=status.HTTP_400_BAD_REQUEST)

    context = {
        "user_email": request.user.email,
        "organization_id": str(request.user.organization.id) if request.user.organization else None,
    }

    result = intelligent_search(query, context)

    # Execute the search based on parsed parameters
    entity = result.get('entity', 'leads')
    filters = result.get('filters', {})
    search_text = result.get('search_text', '')

    data = []
    if entity == 'leads':
        qs = Lead.objects.filter(organization=request.user.organization)
        if search_text:
            qs = qs.filter(
                Q(first_name__icontains=search_text) |
                Q(last_name__icontains=search_text) |
                Q(email__icontains=search_text) |
                Q(company__icontains=search_text)
            )
        if 'status' in filters:
            qs = qs.filter(status=filters['status'])
        data = list(qs.values()[:20])
    elif entity == 'contacts':
        from apps.contacts.models import Contact
        qs = Contact.objects.filter(organization=request.user.organization)
        if search_text:
            qs = qs.filter(
                Q(first_name__icontains=search_text) |
                Q(last_name__icontains=search_text) |
                Q(email__icontains=search_text) |
                Q(company__icontains=search_text)
            )
        data = list(qs.values()[:20])
    elif entity == 'deals':
        from apps.deals.models import Deal
        qs = Deal.objects.filter(organization=request.user.organization)
        if 'stage' in filters:
            qs = qs.filter(stage=filters['stage'])
        data = list(qs.values()[:20])
    elif entity == 'tasks':
        qs = Task.objects.filter(organization=request.user.organization)
        if 'status' in filters:
            qs = qs.filter(status=filters['status'])
        data = list(qs.values()[:20])

    return Response({
        'parsed_query': result,
        'results': data,
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def realtime_suggestion(request):
    """Get real-time AI reply suggestion."""
    conversation_context = request.data.get('conversation_context', '')
    if not conversation_context:
        return Response({'error': 'conversation_context is required'}, status=status.HTTP_400_BAD_REQUEST)

    result = suggest_reply(conversation_context)
    return Response(result)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_lead_embedding(request, lead_id):
    """Generate embedding for a lead."""
    try:
        lead = Lead.objects.get(id=lead_id, organization=request.user.organization)
    except Lead.DoesNotExist:
        return Response({'error': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)

    text = f"{lead.first_name} {lead.last_name} {lead.company} {lead.job_title} {lead.notes}"
    embedding = generate_embedding(text)
    lead.embedding = embedding
    lead.save(update_fields=['embedding'])
    return Response({'lead_id': str(lead_id), 'embedding_length': len(embedding)})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def about(request):
    """Return application version and metadata."""
    return Response({
        'name': 'AI CRM',
        'description': 'Intelligent Customer Relationship Management Platform',
        'version': '1.0.0',
        'build': '2024.06.10',
        'backend': 'Django 4.2 + DRF',
        'frontend': 'React Native (Expo)',
        'ai_provider': 'OpenAI',
        'ai_models': ['gpt-4', 'whisper-1', 'text-embedding-3-small'],
    })
