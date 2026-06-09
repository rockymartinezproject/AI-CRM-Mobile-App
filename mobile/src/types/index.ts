export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  organization: {
    id: string;
    name: string;
  } | null;
}

export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  status: string;
  source: string;
  priority: number;
  ai_score: number | null;
  ai_churn_risk: number | null;
  estimated_value: string | null;
  owner_name: string;
  last_contact_at: string | null;
  next_follow_up_at: string | null;
  notes: string;
  created_at: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  ai_summary: string;
  notes: string;
  created_at: string;
}

export interface Deal {
  id: string;
  name: string;
  stage: string;
  value: string;
  probability: number;
  ai_win_probability: number | null;
  ai_next_best_action: string;
  expected_close_date: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  due_date: string | null;
  ai_suggested: boolean;
  related_name: string | null;
  created_at: string;
}

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  LeadDetail: { leadId: string };
  Compose: { leadId: string };
  AISearch: undefined;
};
