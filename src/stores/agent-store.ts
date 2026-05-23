import { create } from 'zustand';
import { User, Project, Task, Step, Message, WorkspaceFile, ProjectTemplate, UserFeedback } from '../../shared/types.js';

interface AgentState {
  user: User | null;
  projects: Project[];
  currentProject: Project | null;
  tasks: Task[];
  activeTask: Task | null;
  steps: Step[];
  messages: Message[];
  fields: WorkspaceFile[];
  selectedFile: string | null;
  selectedFileContent: string;
  terminalOutput: string;
  browserHtml: string;
  browserUrl: string;
  activeTab: 'code' | 'browser' | 'terminal';
  isAgentRunning: boolean;
  sseConnected: boolean;
  agentThinkingState: string | null;
  templates: ProjectTemplate[];
  feedbacks: UserFeedback[];
  allFeedbacks: UserFeedback[];

  // Actions
  fetchUser: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  selectProject: (id: string) => Promise<void>;
  createProject: (name: string, description: string, templateId?: string) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  fetchTemplates: () => Promise<void>;
  fetchFeedbacks: (projectId: string) => Promise<void>;
  fetchAllFeedbacks: () => Promise<void>;
  submitFeedback: (payload: {
    projectId: string;
    rating: number;
    feedbackText: string;
    alternativeApproach?: string;
    taskId?: string;
    stepId?: string;
  }) => Promise<void>;
  startAutomationTask: (projectId: string, prompt: string) => Promise<void>;
  cancelActiveTask: (taskId: string) => Promise<void>;
  resumeActiveTask: (taskId: string, answer: string) => Promise<void>;
  saveFileContent: (projectId: string, filePath: string, content: string) => Promise<void>;
  selectFile: (projectId: string, filePath: string) => Promise<void>;
  addTerminalOutput: (chunk: string) => void;
  clearTerminal: () => void;
  setActiveTab: (tab: 'code' | 'browser' | 'terminal') => void;
  connectToProjectStream: (projectId: string) => void;
  disconnectFromProjectStream: () => void;
  testTemplate: (id: string) => Promise<any>;
  createCustomStep: (taskId: string, payload: { type: string; title: string; logs?: string; status?: string }) => Promise<void>;
  updateStepDetails: (stepId: string, updates: Partial<Omit<Step, 'id' | 'taskId' | 'createdAt'>>) => Promise<void>;
}

let eventSource: EventSource | null = null;

export const useAgentStore = create<AgentState>((set, get) => ({
  user: null,
  projects: [],
  currentProject: null,
  tasks: [],
  activeTask: null,
  steps: [],
  messages: [],
  fields: [],
  selectedFile: null,
  selectedFileContent: '',
  terminalOutput: '',
  browserHtml: `
    <div style="font-family: sans-serif; padding: 40px; text-align: center; color: #94a3b8; background: #0f172a; min-height: 100vh;">
      <p style="font-size: 1.1rem; margin-bottom: 8px;">Browser Workspace Viewport</p>
      <p style="font-size: 0.85rem; color: #64748b;">The browse tool hasn't been triggered yet. Write a prompt to start generation.</p>
    </div>
  `,
  browserUrl: 'http://localhost:3000',
  activeTab: 'code',
  isAgentRunning: false,
  sseConnected: false,
  agentThinkingState: null,
  templates: [],
  feedbacks: [],
  allFeedbacks: [],

  fetchUser: async () => {
    try {
      const res = await fetch('/api/users/me');
      if (res.ok) {
        const data = await res.json();
        set({ user: data });
      }
    } catch (e) {
      console.error('Error fetching user', e);
    }
  },

  fetchProjects: async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        set({ projects: data });
      }
    } catch (e) {
      console.error('Error fetching projects', e);
    }
  },

  selectProject: async (id: string) => {
    try {
      const pRes = await fetch(`/api/projects/${id}`);
      if (!pRes.ok) return;
      const project = await pRes.json();

      const fRes = await fetch(`/api/projects/${id}/files`);
      const files = fRes.ok ? await fRes.json() : [];

      const mRes = await fetch(`/api/projects/${id}/messages`);
      const messages = mRes.ok ? await mRes.json() : [];

      const tRes = await fetch(`/api/projects/${id}/tasks`);
      const tasks: Task[] = tRes.ok ? await tRes.json() : [];
      const runningTask = tasks.find(t => t.status === 'running' || t.status === 'paused' || t.status === 'planning') || null;

      let steps: Step[] = [];
      if (runningTask) {
        const sRes = await fetch(`/api/tasks/${runningTask.id}/steps`);
        steps = sRes.ok ? await sRes.json() : [];
      }

      await get().fetchFeedbacks(id);

      set({
        currentProject: project,
        fields: files,
        messages,
        tasks,
        activeTask: runningTask,
        steps,
        isAgentRunning: runningTask ? (runningTask.status === 'running') : false,
      });

      // Default selected file to index.html if it exists
      if (files.length > 0) {
        const idx = files.find((f: any) => f.path === 'index.html');
        const defaultFile = idx ? 'index.html' : files[0].path;
        get().selectFile(id, defaultFile);
      } else {
        set({ selectedFile: null, selectedFileContent: '' });
      }

      // Re-trigger live SSE listeners
      get().connectToProjectStream(id);
    } catch (e) {
      console.error('Error selecting project', e);
    }
  },

  createProject: async (name, description, templateId) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, templateId }),
    });
    if (!res.ok) {
      throw new Error('Could not create project');
    }
    const data = await res.json();
    await get().fetchProjects();
    return data;
  },

  fetchTemplates: async () => {
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const data = await res.json();
        set({ templates: data });
      }
    } catch (e) {
      console.error('Error fetching templates', e);
    }
  },

  fetchFeedbacks: async (projectId) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/feedback`);
      if (res.ok) {
        const data = await res.json();
        set({ feedbacks: data });
      }
    } catch (e) {
      console.error('Error fetching feedbacks', e);
    }
  },

  fetchAllFeedbacks: async () => {
    try {
      const res = await fetch('/api/feedback');
      if (res.ok) {
        const data = await res.json();
        set({ allFeedbacks: data });
      }
    } catch (e) {
      console.error('Error fetching all feedbacks', e);
    }
  },

  submitFeedback: async (payload) => {
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await get().fetchFeedbacks(payload.projectId);
      }
    } catch (e) {
      console.error('Error submitting feedback', e);
    }
  },

  deleteProject: async (id) => {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.ok) {
      if (get().currentProject?.id === id) {
        get().disconnectFromProjectStream();
        set({ currentProject: null, fields: [], messages: [], tasks: [], activeTask: null, steps: [] });
      }
      await get().fetchProjects();
    }
  },

  startAutomationTask: async (projectId, prompt) => {
    set({ terminalOutput: '', steps: [], isAgentRunning: true, agentThinkingState: 'Planning...' });
    
    // Add prompt as an optimistic message
    set(state => ({
      messages: [...state.messages, {
        id: 'user_msg_opt_' + Math.random(),
        projectId,
        role: 'user',
        content: prompt,
        createdAt: new Date().toISOString()
      }]
    }));

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, prompt }),
    });

    if (res.ok) {
      const task = await res.json();
      set({ activeTask: task, isAgentRunning: true });
    } else {
      set({ isAgentRunning: false, agentThinkingState: null });
    }
  },

  cancelActiveTask: async (taskId) => {
    const res = await fetch(`/api/tasks/${taskId}/cancel`, { method: 'POST' });
    if (res.ok) {
      set({ isAgentRunning: false, agentThinkingState: null });
      if (get().currentProject) {
        await get().selectProject(get().currentProject!.id);
      }
    }
  },

  resumeActiveTask: async (taskId, answer) => {
    set({ isAgentRunning: true, agentThinkingState: 'Resuming task...' });
    const res = await fetch(`/api/tasks/${taskId}/resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer }),
    });
    if (res.ok) {
      if (get().currentProject) {
        // Refresher
        await get().selectProject(get().currentProject!.id);
      }
    }
  },

  selectFile: async (projectId, filePath) => {
    set({ selectedFile: filePath });
    try {
      const res = await fetch(`/api/projects/${projectId}/files/content?path=${encodeURIComponent(filePath)}`);
      if (res.ok) {
        const fileRecord = await res.json();
        set({ selectedFileContent: fileRecord.content });
      }
    } catch (e) {
      console.error('Error fetching file content', e);
    }
  },

  saveFileContent: async (projectId, filePath, content) => {
    const res = await fetch(`/api/projects/${projectId}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath, content }),
    });
    if (res.ok) {
      set(state => ({
        selectedFileContent: content,
        fields: state.fields.map(f => f.path === filePath ? { ...f, content, size: content.length, updatedAt: new Date().toISOString() } : f)
      }));
    }
  },

  addTerminalOutput: (chunk) => {
    set(state => ({ terminalOutput: state.terminalOutput + chunk }));
  },

  clearTerminal: () => {
    set({ terminalOutput: '' });
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  connectToProjectStream: (projectId) => {
    get().disconnectFromProjectStream();

    eventSource = new EventSource(`/api/projects/${projectId}/stream`);
    set({ sseConnected: true });

    eventSource.onopen = () => {
      set({ sseConnected: true });
    };

    eventSource.onerror = (e) => {
      console.error('SSE Error:', e);
      set({ sseConnected: false });
    };

    // Generic payload emitter
    const listEvents: string[] = [
      'task:started', 'task:planning', 'step:started', 'step:completed', 'step:failed',
      'task:completed', 'task:failed', 'task:paused', 'file:changed', 'terminal:output',
      'browser:screenshot', 'agent:thinking', 'agent:message'
    ];

    listEvents.forEach((ev: any) => {
      eventSource!.addEventListener(ev, (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          
          switch (ev) {
            case 'task:started':
              set({ isAgentRunning: true, steps: [], terminalOutput: '', agentThinkingState: 'Deploying agent model...' });
              break;
            case 'task:planning':
              set({ agentThinkingState: 'Formulating architectural roadmap...' });
              break;
            case 'step:started':
              const newStep: Step = {
                id: payload.stepId,
                taskId: get().activeTask?.id || 't_' + Math.random(),
                type: payload.type,
                title: payload.title,
                status: 'running',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              set(state => ({
                steps: [...state.steps.filter(s => s.id !== payload.stepId), newStep],
                agentThinkingState: `Executing ${payload.type}...`
              }));
              break;
            case 'step:completed':
              set(state => ({
                steps: state.steps.map(s => s.id === payload.stepId ? { ...s, status: 'completed' } : s)
              }));
              break;
            case 'step:failed':
              set(state => ({
                steps: state.steps.map(s => s.id === payload.stepId ? { ...s, status: 'failed' } : s)
              }));
              break;
            case 'task:completed':
            case 'task:failed':
              set({ isAgentRunning: false, agentThinkingState: null });
              // Refresh workspace index files list
              fetch(`/api/projects/${projectId}/files`).then(r => r.json()).then(files => {
                set({ fields: files });
                if (files.length > 0 && !get().selectedFile) {
                  get().selectFile(projectId, files[0].path);
                }
              });
              break;
            case 'task:paused':
              set({ isAgentRunning: false, agentThinkingState: null });
              if (get().activeTask) {
                set(state => ({
                  activeTask: { ...state.activeTask!, status: 'paused' }
                }));
              }
              break;
            case 'file:changed':
              fetch(`/api/projects/${projectId}/files`).then(r => r.json()).then(files => {
                set({ fields: files });
                if (get().selectedFile === payload.path) {
                  get().selectFile(projectId, payload.path);
                }
              });
              break;
            case 'terminal:output':
              get().addTerminalOutput(payload);
              break;
            case 'browser:screenshot':
              set({ browserHtml: payload.html, browserUrl: payload.url, activeTab: 'browser' });
              break;
            case 'agent:thinking':
              set({ agentThinkingState: `Monologue processing... (${payload.iteration}/${payload.max})` });
              break;
            case 'agent:message':
              set(state => ({
                messages: [...state.messages.filter(m => m.id !== payload.id), {
                  id: payload.id || 'ai_msg_' + Math.random(),
                  projectId,
                  role: payload.role || 'agent',
                  content: payload.content,
                  createdAt: new Date().toISOString()
                }]
              }));
              break;
          }
        } catch (err) {
          console.error('SSE JSON error:', err);
        }
      });
    });
  },

  disconnectFromProjectStream: () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    set({ sseConnected: false });
  },
  testTemplate: async (id: string) => {
    try {
      const res = await fetch(`/api/templates/${id}/test`, { method: 'POST' });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (e) {
      console.error('Error testing template', e);
      return null;
    }
  },
  createCustomStep: async (taskId: string, payload: { type: string; title: string; logs?: string; status?: string }) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        // Fetch running task steps to reload UI
        const sRes = await fetch(`/api/tasks/${taskId}/steps`);
        if (sRes.ok) {
          const stepsData = await sRes.json();
          set({ steps: stepsData });
        }
      }
    } catch (e) {
      console.error('Error creating custom step', e);
    }
  },
  updateStepDetails: async (stepId: string, updates: any) => {
    try {
      const res = await fetch(`/api/steps/${stepId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated = await res.json();
        set((state) => ({
          steps: state.steps.map((s) => (s.id === stepId ? { ...s, ...updated } : s))
        }));
      }
    } catch (e) {
      console.error('Error updating step details', e);
    }
  }
}));
