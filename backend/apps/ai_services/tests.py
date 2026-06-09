from django.test import TestCase
from unittest.mock import patch, MagicMock
from .services import intelligent_search


class AIServicesTests(TestCase):
    @patch('apps.ai_services.services.openai_client.chat.completions.create')
    def test_intelligent_search(self, mock_create):
        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(message=MagicMock(content='{"entity": "leads", "filters": {"status": "new"}, "search_text": "", "sort_by": "created_at", "explanation": "Find new leads"}'))
        ]
        mock_create.return_value = mock_response

        result = intelligent_search("show me new leads", {"user_email": "test@example.com"})
        self.assertEqual(result['entity'], 'leads')
        self.assertEqual(result['filters']['status'], 'new')
