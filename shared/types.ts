export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  samplePrompt: string;
  files: {
    path: string;
    content: string;
  }[];
}

export interface UserFeedback {
  id: string;
  projectId: string;
  taskId?: string;
  stepId?: string;
  rating: number; // 1-5 rating
  feedbackText: string;
  alternativeApproach?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  tokensUsedToday: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  prompt: string;
  status: 'pending' | 'planning' | 'running' | 'paused' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export type ToolName = 
  | 'plan' 
  | 'write_file' 
  | 'read_file' 
  | 'list_files' 
  | 'run_command' 
  | 'search_web' 
  | 'browse' 
  | 'deploy' 
  | 'ask_user' 
  | 'think';

export interface Step {
  id: string;
  taskId: string;
  type: ToolName;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  logs?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  projectId: string;
  role: 'user' | 'assistant' | 'system' | 'agent';
  content: string;
  createdAt: string;
}

export interface WorkspaceFile {
  id: string;
  projectId: string;
  path: string;
  content: string;
  size: number;
  updatedAt: string;
}

export interface Deployment {
  id: string;
  projectId: string;
  url: string;
  env: 'staging' | 'production';
  status: 'building' | 'live' | 'failed';
  createdAt: string;
}

export type SSEEvent = 
  | 'task:started'
  | 'task:planning'
  | 'step:started'
  | 'step:completed'
  | 'step:failed'
  | 'task:completed'
  | 'task:failed'
  | 'task:paused'
  | 'file:changed'
  | 'terminal:output'
  | 'browser:screenshot'
  | 'agent:thinking'
  | 'agent:message';

export interface SSEMessage {
  event: SSEEvent;
  projectId: string;
  data: any;
}
