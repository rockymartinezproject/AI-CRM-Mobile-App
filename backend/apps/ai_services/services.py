import json
import time
import threading
from typing import List, Dict, Optional
from django.conf import settings
import openai

# Simple token bucket for rate limiting
class TokenBucket:
    def __init__(self, capacity: float, refill_rate: float):
        self.capacity = capacity
        self.tokens = capacity
        self.refill_rate = refill_rate
        self.last_refill = time.time()
        self.lock = threading.Lock()

    def consume(self, tokens: float = 1.0) -> bool:
        with self.lock:
            now = time.time()
            elapsed = now - self.last_refill
            self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
            self.last_refill = now

            if self.tokens >= tokens:
                self.tokens -= tokens
                return True
            return False


# Rate limiters
_openai_rpm = TokenBucket(
    capacity=settings.OPENAI_RATE_LIMIT_RPM,
    refill_rate=settings.OPENAI_RATE_LIMIT_RPM / 60.0
)
_openai_tpm = TokenBucket(
    capacity=settings.OPENAI_RATE_LIMIT_TPM,
    refill_rate=settings.OPENAI_RATE_LIMIT_TPM / 60.0
)

openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)


def _wait_for_rate_limit(estimated_tokens: int = 1000):
    """Block until rate limits allow the request."""
    while not _openai_rpm.consume(1.0):
        time.sleep(0.1)
    while not _openai_tpm.consume(estimated_tokens):
        time.sleep(0.1)


def generate_lead_score(lead_data: Dict, activities: List[Dict]) -> Dict:
    """Use GPT-4 to analyze lead data and return a priority score with reasoning."""
    _wait_for_rate_limit(2000)

    prompt = f"""Analyze the following CRM lead and engagement history, then return a JSON object with:
- "score": integer 0-100 (lead quality/priority)
- "reasoning": brief explanation
- "recommended_next_action": one sentence
- "churn_risk": integer 0-100 (likelihood to go cold)
- "churn_reasons": list of risk factors

Lead Data:
{json.dumps(lead_data, indent=2, default=str)}

Activities:
{json.dumps(activities, indent=2, default=str)}

Respond ONLY with valid JSON."""

    response = openai_client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "You are an expert sales analyst. Respond only with JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=800,
    )

    content = response.choices[0].message.content.strip()
    # Clean up markdown code blocks if present
    if content.startswith("```"):
        content = content.strip("`").replace("json", "").strip()

    return json.loads(content)


def compose_message(
    lead_data: Dict,
    conversation_history: List[Dict],
    channel: str = "email",
    tone: str = "professional",
    purpose: str = "follow_up"
) -> Dict:
    """Generate context-aware email/SMS follow-up using GPT-4."""
    _wait_for_rate_limit(2500)

    prompt = f"""Compose a {channel} message for a sales rep to send to a lead.
Tone: {tone}
Purpose: {purpose}

Lead Info:
{json.dumps(lead_data, indent=2, default=str)}

Conversation History:
{json.dumps(conversation_history, indent=2, default=str)}

Return JSON with:
- "subject": subject line (if email)
- "body": message body
- "personalization_notes": why this message fits the lead
"""

    response = openai_client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "You are an expert sales copywriter. Respond only with JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=1200,
    )

    content = response.choices[0].message.content.strip()
    if content.startswith("```"):
        content = content.strip("`").replace("json", "").strip()

    return json.loads(content)


def transcribe_audio(audio_file_path: str) -> Dict:
    """Transcribe meeting recording with Whisper API."""
    _wait_for_rate_limit(1000)

    with open(audio_file_path, "rb") as audio_file:
        transcript = openai_client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            response_format="verbose_json",
            timestamp_granularities=["segment"]
        )

    # Summarize and extract action items
    _wait_for_rate_limit(2000)
    summary_response = openai_client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "You extract structured CRM notes from transcripts. Respond only with JSON."},
            {"role": "user", "content": f"""From this meeting transcript, extract:
- "summary": concise summary
- "key_points": list of important points discussed
- "action_items": list of tasks with assignees if mentioned
- "sentiment": positive/neutral/negative
- "next_steps": recommended follow-up

Transcript:
{transcript.text}

Return JSON only."""}
        ],
        temperature=0.3,
        max_tokens=1000,
    )

    content = summary_response.choices[0].message.content.strip()
    if content.startswith("```"):
        content = content.strip("`").replace("json", "").strip()

    structured = json.loads(content)
    structured["raw_transcript"] = transcript.text
    return structured


def predict_churn(lead_data: Dict, activities: List[Dict]) -> Dict:
    """Predict churn risk for a lead based on interaction patterns."""
    _wait_for_rate_limit(2000)

    prompt = f"""Analyze this lead's interaction patterns and predict churn risk.
Return JSON with:
- "churn_risk": integer 0-100
- "risk_factors": list of specific concerns
- "recommended_actions": list of actions to re-engage
- "expected_outcome": brief prediction

Lead:
{json.dumps(lead_data, indent=2, default=str)}

Activities (most recent first):
{json.dumps(activities[:20], indent=2, default=str)}

Respond ONLY with valid JSON."""

    response = openai_client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "You are a customer success analyst. Respond only with JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=800,
    )

    content = response.choices[0].message.content.strip()
    if content.startswith("```"):
        content = content.strip("`").replace("json", "").strip()

    return json.loads(content)


def intelligent_search(query: str, context: Dict) -> Dict:
    """Process natural language search query across CRM data."""
    _wait_for_rate_limit(2000)

    prompt = f"""You are a CRM search assistant. Convert the user's natural language query into structured search parameters.

Available entities: leads, contacts, deals, tasks
Available filters: status, priority, date ranges, owner, tags, company, stage

User Query: "{query}"

Current Context:
{json.dumps(context, indent=2, default=str)}

Return JSON with:
- "entity": primary entity to search (leads/contacts/deals/tasks)
- "filters": dict of filter key-value pairs
- "search_text": free text to search within records
- "sort_by": field to sort by
- "explanation": human-readable interpretation of the query

Respond ONLY with valid JSON."""

    response = openai_client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "You translate natural language to CRM search filters. Respond only with JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2,
        max_tokens=600,
    )

    content = response.choices[0].message.content.strip()
    if content.startswith("```"):
        content = content.strip("`").replace("json", "").strip()

    return json.loads(content)


def generate_embedding(text: str) -> List[float]:
    """Generate embedding vector for semantic search."""
    _wait_for_rate_limit(500)

    response = openai_client.embeddings.create(
        model=settings.OPENAI_EMBEDDING_MODEL,
        input=text[:8000],
    )
    return response.data[0].embedding


def suggest_reply(conversation_context: str) -> Dict:
    """Generate real-time AI-suggested reply during client calls/chat."""
    _wait_for_rate_limit(1500)

    response = openai_client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "You are a real-time sales assistant. Suggest concise, helpful replies. Respond only with JSON."},
            {"role": "user", "content": f"""Based on this conversation context, suggest a reply:

{conversation_context}

Return JSON with:
- "suggested_reply": the reply text
- "confidence": high/medium/low
- "alternative_replies": list of 2 alternative shorter replies
- "talking_points": list of points to emphasize
"""}
        ],
        temperature=0.5,
        max_tokens=800,
    )

    content = response.choices[0].message.content.strip()
    if content.startswith("```"):
        content = content.strip("`").replace("json", "").strip()

    return json.loads(content)
