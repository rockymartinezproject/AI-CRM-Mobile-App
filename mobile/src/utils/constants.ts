export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

export const LEAD_STATUSES = [
  { value: 'new', label: 'New', color: '#3B82F6' },
  { value: 'contacted', label: 'Contacted', color: '#8B5CF6' },
  { value: 'qualified', label: 'Qualified', color: '#10B981' },
  { value: 'proposal', label: 'Proposal', color: '#F59E0B' },
  { value: 'negotiation', label: 'Negotiation', color: '#F97316' },
  { value: 'won', label: 'Won', color: '#059669' },
  { value: 'lost', label: 'Lost', color: '#EF4444' },
  { value: 'archived', label: 'Archived', color: '#94A3B8' },
];

export const DEAL_STAGES = [
  { value: 'prospecting', label: 'Prospecting' },
  { value: 'qualification', label: 'Qualification' },
  { value: 'needs_analysis', label: 'Needs Analysis' },
  { value: 'value_proposition', label: 'Value Proposition' },
  { value: 'id_decision_makers', label: 'Id. Decision Makers' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' },
];

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', color: '#94A3B8' },
  { value: 'medium', label: 'Medium', color: '#3B82F6' },
  { value: 'high', label: 'High', color: '#F59E0B' },
  { value: 'urgent', label: 'Urgent', color: '#EF4444' },
];
