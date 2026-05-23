import fs from 'fs';
import path from 'path';
import { User, Project, Task, Step, Message, WorkspaceFile, Deployment, UserFeedback, ProjectTemplate } from '../../../shared/types.js';

const DB_FILE = path.join(process.cwd(), 'workspaces', 'db.json');

interface Schema {
  users: User[];
  projects: Project[];
  tasks: Task[];
  steps: Step[];
  messages: Message[];
  files: WorkspaceFile[];
  deployments: Deployment[];
  feedbacks?: UserFeedback[];
}

class Database {
  private schema: Schema = {
    users: [],
    projects: [],
    tasks: [],
    steps: [],
    messages: [],
    files: [],
    deployments: [],
    feedbacks: [],
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        this.schema = JSON.parse(data);
        if (!this.schema.feedbacks) {
          this.schema.feedbacks = [];
        }
      } else {
        // Initial mock users and defaults
        this.schema.users.push({
          id: 'default-user',
          name: 'Masidy Engineer',
          email: 'ragabsadek8@gmail.com',
          plan: 'pro',
          tokensUsedToday: 42000,
        });
        this.save();
      }
    } catch (e) {
      console.error('Error loading database:', e);
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.schema, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving database:', e);
    }
  }

  // --- Users ---
  getUsers() { return this.schema.users; }
  getUser(id: string) { return this.schema.users.find(u => u.id === id); }
  updateUserTokens(id: string, tokens: number) {
    const user = this.getUser(id);
    if (user) {
      user.tokensUsedToday += tokens;
      this.save();
    }
    return user;
  }

  // --- Projects ---
  getProjects() { return this.schema.projects; }
  getProject(id: string) { return this.schema.projects.find(p => p.id === id); }
  createProject(name: string, description: string) {
    const project: Project = {
      id: 'proj_' + Math.random().toString(36).substring(2, 9),
      name,
      description,
      createdAt: new Date().toISOString(),
      status: 'idle',
    };
    this.schema.projects.push(project);
    this.save();
    return project;
  }
  updateProjectStatus(id: string, status: Project['status']) {
    const project = this.getProject(id);
    if (project) {
      project.status = status;
      this.save();
    }
    return project;
  }
  deleteProject(id: string) {
    this.schema.projects = this.schema.projects.filter(p => p.id !== id);
    this.schema.tasks = this.schema.tasks.filter(t => t.projectId !== id);
    this.schema.messages = this.schema.messages.filter(m => m.projectId !== id);
    this.schema.files = this.schema.files.filter(f => f.projectId !== id);
    this.schema.deployments = this.schema.deployments.filter(d => d.projectId !== id);
    if (this.schema.feedbacks) {
      this.schema.feedbacks = this.schema.feedbacks.filter(f => f.projectId !== id);
    }
    this.save();
    return true;
  }

  // --- Tasks ---
  getTasks(projectId: string) { return this.schema.tasks.filter(t => t.projectId === projectId); }
  getTask(id: string) { return this.schema.tasks.find(t => t.id === id); }
  createTask(projectId: string, title: string, prompt: string) {
    const task: Task = {
      id: 'task_' + Math.random().toString(36).substring(2, 9),
      projectId,
      title,
      prompt,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.schema.tasks.push(task);
    this.save();
    return task;
  }
  updateTaskStatus(id: string, status: Task['status'], completed?: boolean) {
    const task = this.getTask(id);
    if (task) {
      task.status = status;
      if (completed) {
        task.completedAt = new Date().toISOString();
      }
      this.save();
    }
    return task;
  }

  // --- Steps ---
  getSteps(taskId: string) { return this.schema.steps.filter(s => s.taskId === taskId); }
  getStep(id: string) { return this.schema.steps.find(s => s.id === id); }
  createStep(taskId: string, type: Step['type'], title: string) {
    const step: Step = {
      id: 'step_' + Math.random().toString(36).substring(2, 9),
      taskId,
      type,
      title,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.schema.steps.push(step);
    this.save();
    return step;
  }
  updateStep(id: string, updates: Partial<Omit<Step, 'id' | 'taskId' | 'createdAt'>>) {
    const step = this.getStep(id);
    if (step) {
      Object.assign(step, updates);
      step.updatedAt = new Date().toISOString();
      this.save();
    }
    return step;
  }

  // --- Messages ---
  getMessages(projectId: string) { return this.schema.messages.filter(m => m.projectId === projectId); }
  createMessage(projectId: string, role: Message['role'], content: string) {
    const msg: Message = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      projectId,
      role,
      content,
      createdAt: new Date().toISOString(),
    };
    this.schema.messages.push(msg);
    this.save();
    return msg;
  }

  // --- WorkspaceFiles ---
  getFiles(projectId: string) { return this.schema.files.filter(f => f.projectId === projectId); }
  getFile(projectId: string, filePath: string) { 
    return this.schema.files.find(f => f.projectId === projectId && f.path === filePath); 
  }
  saveFile(projectId: string, filePath: string, content: string) {
    let file = this.getFile(projectId, filePath);
    if (file) {
      file.content = content;
      file.size = Buffer.byteLength(content);
      file.updatedAt = new Date().toISOString();
    } else {
      file = {
        id: 'file_' + Math.random().toString(36).substring(2, 9),
        projectId,
        path: filePath,
        content,
        size: Buffer.byteLength(content),
        updatedAt: new Date().toISOString(),
      };
      this.schema.files.push(file);
    }
    this.save();
    return file;
  }
  deleteFile(projectId: string, filePath: string) {
    this.schema.files = this.schema.files.filter(f => !(f.projectId === projectId && f.path === filePath));
    this.save();
    return true;
  }

  // --- Deployments ---
  getDeployments(projectId: string) { return this.schema.deployments.filter(d => d.projectId === projectId); }
  createDeployment(projectId: string, url: string, env: Deployment['env'], status: Deployment['status']) {
    const dep: Deployment = {
      id: 'dep_' + Math.random().toString(36).substring(2, 9),
      projectId,
      url,
      env,
      status,
      createdAt: new Date().toISOString(),
    };
    this.schema.deployments.push(dep);
    this.save();
    return dep;
  }
  updateDeploymentStatus(id: string, status: Deployment['status']) {
    const dep = this.schema.deployments.find(d => d.id === id);
    if (dep) {
      dep.status = status;
      this.save();
    }
    return dep;
  }

  // --- Templates ---
  getTemplates() {
    return PREDEFINED_TEMPLATES;
  }
  getTemplate(id: string) {
    return PREDEFINED_TEMPLATES.find(t => t.id === id);
  }

  // --- Feedback ---
  getFeedbacks(projectId?: string) {
    const list = this.schema.feedbacks || [];
    if (projectId) {
      return list.filter(f => f.projectId === projectId);
    }
    return list;
  }
  createFeedback(projectId: string, rating: number, feedbackText: string, alternativeApproach?: string, taskId?: string, stepId?: string) {
    if (!this.schema.feedbacks) {
      this.schema.feedbacks = [];
    }
    const feedback: UserFeedback = {
      id: 'fb_' + Math.random().toString(36).substring(2, 9),
      projectId,
      rating,
      feedbackText,
      alternativeApproach,
      taskId,
      stepId,
      createdAt: new Date().toISOString()
    };
    this.schema.feedbacks.push(feedback);
    this.save();
    return feedback;
  }
}

const PREDEFINED_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'simple-blog',
    name: 'Simple Personal Blog',
    description: 'A stylish personal blog layout featuring category filtering, live searching, and post creation with beautiful card designs.',
    samplePrompt: 'Add a comment section to each blog post. Comments should display the reader\'s name, current timestamp, and support typing short replies with automatic list updates.',
    files: [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Minimalist Dev Blog</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    h1, h2, h3, .font-display { font-family: 'Space Grotesk', sans-serif; }
  </style>
</head>
<body class="bg-[#0b0c10] text-[#c5c6c7] min-h-screen">
  <!-- Navbar -->
  <header class="border-b border-gray-800 bg-[#1f2833]/30 backdrop-blur-md sticky top-0 z-50">
    <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <div class="w-8 h-8 rounded bg-gradient-to-tr from-[#66fcf1] to-[#45b29d] flex items-center justify-center font-bold text-gray-950 font-display text-lg">B</div>
        <span class="text-white font-bold font-display text-xl tracking-wide">Minimalist Blog</span>
      </div>
      <button onclick="openModal()" class="bg-[#66fcf1] hover:bg-[#45b29d] text-gray-950 font-medium px-4 py-2 rounded text-xs transition-all font-display font-semibold tracking-wider uppercase">
        Write Article
      </button>
    </div>
  </header>

  <main class="max-w-5xl mx-auto px-4 py-12">
    <!-- Hero Block -->
    <div class="mb-12 text-center max-w-2xl mx-auto">
      <span class="text-[#66fcf1] uppercase font-mono tracking-widest text-xs font-bold font-display font-semibold">Aesthetic Sandbox</span>
      <h1 class="text-4xl font-bold text-white tracking-tight mt-1 mb-3">Logs of Computational Design</h1>
      <p class="text-gray-400 text-sm">Where ideas on UI craftsmanship, layout grids, and visual integrity come together.</p>
    </div>

    <!-- Filters & Search -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-8 mb-10 select-none">
      <div class="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0" id="categoryGroup">
        <button onclick="setCategory('All')" class="category-btn active px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all border-[#66fcf1] text-[#66fcf1] bg-[#66fcf1]/10">All</button>
        <button onclick="setCategory('Design')" class="category-btn px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all border-gray-800 text-gray-400 hover:text-white">Design</button>
        <button onclick="setCategory('Code')" class="category-btn px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all border-gray-800 text-gray-400 hover:text-white">Code</button>
        <button onclick="setCategory('Idea')" class="category-btn px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all border-gray-800 text-gray-400 hover:text-white">Idea</button>
      </div>
      <div>
        <input 
          type="text" 
          id="searchInput" 
          oninput="handleSearch()" 
          placeholder="Search articles..." 
          class="bg-[#1f2833]/40 border border-gray-800 rounded px-3.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#66fcf1] min-w-[240px] transition-colors"
        >
      </div>
    </div>

    <!-- Articles Grid -->
    <div id="articlesGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Generated dynamically -->
    </div>
  </main>

  <!-- Create Modal -->
  <div id="modalBackdrop" class="fixed inset-0 bg-black/60 hidden items-center justify-center p-4 z-50">
    <div class="bg-[#1f2833] max-w-md w-full rounded-lg border border-gray-800 p-6 shadow-2xl relative">
      <h3 class="text-lg font-bold text-white font-display mb-4">Compose New Article</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-[10px] font-bold font-mono text-[#66fcf1] uppercase tracking-wider mb-1.5">Title</label>
          <input type="text" id="postTitle" class="w-full bg-[#0b0c10] border border-gray-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-[#66fcf1]">
        </div>
        <div>
          <label class="block text-[10px] font-bold font-mono text-[#66fcf1] uppercase tracking-wider mb-1.5">Category</label>
          <select id="postCategory" class="w-full bg-[#0b0c10] border border-gray-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-[#66fcf1]">
            <option value="Design">Design</option>
            <option value="Code">Code</option>
            <option value="Idea">Idea</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold font-mono text-[#66fcf1] uppercase tracking-wider mb-1.5">Content Summary</label>
          <textarea id="postContent" rows="4" class="w-full bg-[#0b0c10] border border-gray-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-[#66fcf1] resize-none"></textarea>
        </div>
      </div>
      <div class="flex items-center justify-end space-x-3 mt-6">
        <button onclick="closeModal()" class="text-xs text-gray-400 hover:text-white px-3 py-1.5 font-semibold">Cancel</button>
        <button onclick="publishArticle()" class="bg-[#66fcf1] hover:bg-[#45b29d] text-gray-950 px-4 py-1.5 rounded text-xs font-semibold font-display tracking-wider uppercase">Publish</button>
      </div>
    </div>
  </div>

  <script>
    let activeCategory = 'All';
    let searchQuery = '';
    
    let posts = [
      {
        id: '1',
        title: 'Crafting High Contrast Interfaces',
        category: 'Design',
        summary: 'Explore the balance of deep slate tones paired with fluorescent highlights to trigger high visibility, elegance and flow.',
        date: 'May 22, 2026'
      },
      {
        id: '2',
        title: 'Optimizing SSE Sub-connections',
        category: 'Code',
        summary: 'A deep dive into Server-Sent Events for real-time dashboard telemetry, state streaming, and packet lightweight transfers.',
        date: 'May 18, 2026'
      },
      {
        id: '3',
        title: 'Minimalism: A Strategy for Code Quality',
        category: 'Idea',
        summary: 'Why deleting code is more valuable than writing code. Exploring simple structures that avoid low-value over-engineering.',
        date: 'May 14, 2026'
      }
    ];

    function savePosts() {
      localStorage.setItem('blog_posts', JSON.stringify(posts));
    }

    function loadPosts() {
      const stored = localStorage.getItem('blog_posts');
      if (stored) {
        posts = JSON.parse(stored);
      }
    }

    function setCategory(cat) {
      activeCategory = cat;
      const buttons = document.querySelectorAll('.category-btn');
      buttons.forEach(btn => {
        if (btn.textContent === cat) {
          btn.className = 'category-btn active px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all border-[#66fcf1] text-[#66fcf1] bg-[#66fcf1]/10';
        } else {
          btn.className = 'category-btn px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all border-gray-800 text-gray-400 hover:text-white';
        }
      });
      render();
    }

    function handleSearch() {
      searchQuery = document.getElementById('searchInput').value.toLowerCase();
      render();
    }

    function openModal() {
      document.getElementById('modalBackdrop').style.display = 'flex';
    }

    function closeModal() {
      document.getElementById('modalBackdrop').style.display = 'none';
    }

    function publishArticle() {
      const title = document.getElementById('postTitle').value.trim();
      const category = document.getElementById('postCategory').value;
      const summary = document.getElementById('postContent').value.trim();

      if (!title || !summary) {
        alert('All fields are required');
        return;
      }

      posts.unshift({
        id: 'p_' + Math.random().toString(36).substring(2, 9),
        title,
        category,
        summary,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });

      savePosts();
      closeModal();
      render();

      // Reset fields
      document.getElementById('postTitle').value = '';
      document.getElementById('postContent').value = '';
    }

    function render() {
      const grid = document.getElementById('articlesGrid');
      grid.innerHTML = '';

      const filtered = posts.filter(p => {
        const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
        const matchesSearch = p.title.toLowerCase().includes(searchQuery) || p.summary.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
      });

      if (filtered.length === 0) {
        grid.innerHTML = \`
          <div class="col-span-full py-12 text-center text-gray-500">
            <span class="text-xs uppercase font-mono tracking-widest font-bold">No articles match your search.</span>
          </div>
        \`;
        return;
      }

      filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'bg-[#1f2833]/15 border border-gray-800 hover:border-gray-700 hover:bg-[#1f2833]/30 transition-all rounded p-5 flex flex-col justify-between';
        
        let labelColor = 'text-indigo-400 border-indigo-900/40 bg-indigo-950/20';
        if (p.category === 'Code') labelColor = 'text-[#66fcf1] border-[#66fcf1]/20 bg-[#66fcf1]/5';
        else if (p.category === 'Idea') labelColor = 'text-amber-400 border-amber-900/40 bg-amber-950/20';

        card.innerHTML = \`
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-[9px] font-bold font-mono tracking-wider uppercase border rounded px-2 py-0.5 \${labelColor}">\${p.category}</span>
              <span class="text-[9px] text-gray-500 font-mono">\${p.date}</span>
            </div>
            <h3 class="text-sm font-bold text-white leading-tight mb-2 tracking-tight group-hover:text-[#66fcf1] transition-colors">\${p.title}</h3>
            <p class="text-[12px] text-gray-400 leading-relaxed font-sans">\${p.summary}</p>
          </div>
          <div class="pt-4 border-t border-gray-800 mt-4 flex justify-between items-center">
            <span class="text-[10px] uppercase font-mono tracking-wider text-[#66fcf1] font-semibold cursor-pointer hover:underline">Read Article</span>
            <span class="text-[9px] text-gray-650 font-mono">5 min read</span>
          </div>
        \`;
        grid.appendChild(card);
      });
    }

    loadPosts();
    render();
  </script>
</body>
</html>`
      }
    ]
  },
  {
    id: 'todo-list',
    name: 'Advanced Task Board',
    description: 'A robust to-do Kanban board with status columns, progress, and card deletions with beautiful Indigo accents.',
    samplePrompt: 'Add a priority rating selector (High, Medium, Low) to each to-do task. Render priority tags on cards and allow filtering the task board by priority.',
    files: [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Minimal Task Board</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Outfit', sans-serif; }
    .mono { font-family: 'Fira Code', monospace; }
  </style>
</head>
<body class="bg-[#0b0f19] text-[#b4c6ef] min-h-screen">
  <header class="border-b border-[#1b254b] bg-[#111827]/40 backdrop-blur-md sticky top-0 z-50">
    <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center space-x-2.5">
        <div class="w-7 h-7 bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] rounded flex items-center justify-center font-bold text-white text-sm">✓</div>
        <span class="text-white font-bold text-md tracking-wider">MASIDY TASKS</span>
      </div>
      <div class="flex items-center space-x-4">
        <div class="text-xs text-[#718096]"><span class="mono text-[#4f46e5]" id="completionPct">0%</span> Complete</div>
        <button onclick="openForm()" class="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-semibold px-4 py-1.5 rounded shadow-[0_0_12px_rgba(79,70,229,0.35)] transition-all">
          New Task
        </button>
      </div>
    </div>
  </header>

  <main class="max-w-5xl mx-auto px-4 py-10">
    <!-- Board Stats -->
    <div class="grid grid-cols-3 gap-4 mb-8">
      <div class="bg-[#111c44]/30 border border-[#1b254b] p-4 rounded text-center">
        <div class="text-[10px] uppercase tracking-wider text-[#718096] font-semibold mono">To Do</div>
        <div class="text-2xl font-bold text-white mt-1" id="statTodo">0</div>
      </div>
      <div class="bg-[#111c44]/30 border border-[#1b254b] p-4 rounded text-center">
        <div class="text-[10px] uppercase tracking-wider text-[#718096] font-semibold mono">Doing</div>
        <div class="text-2xl font-bold text-indigo-400 mt-1" id="statProgress">0</div>
      </div>
      <div class="bg-[#111c44]/30 border border-[#1b254b] p-4 rounded text-center">
        <div class="text-[10px] uppercase tracking-wider text-[#718096] font-semibold mono">Done</div>
        <div class="text-2xl font-bold text-teal-400 mt-1" id="statCompleted">0</div>
      </div>
    </div>

    <!-- Active Kanban Columns -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- To Do -->
      <div>
        <div class="flex items-center justify-between border-b border-[#1b254b] pb-2 mb-4">
          <span class="text-xs font-bold uppercase tracking-wider text-white">To Do</span>
          <span class="text-[10px] px-2 py-0.5 rounded bg-[#1e293b] mono text-gray-400" id="countTodo">0</span>
        </div>
        <div class="space-y-3" id="colTodo"></div>
      </div>

      <!-- Doing -->
      <div>
        <div class="flex items-center justify-between border-b border-[#1b254b] pb-2 mb-4">
          <span class="text-xs font-bold uppercase tracking-wider text-indigo-400">In Progress</span>
          <span class="text-[10px] px-2 py-0.5 rounded bg-[#1e293b] mono text-indigo-400" id="countProgress">0</span>
        </div>
        <div class="space-y-3" id="colProgress"></div>
      </div>

      <!-- Done -->
      <div>
        <div class="flex items-center justify-between border-b border-[#1b254b] pb-2 mb-4">
          <span class="text-xs font-bold uppercase tracking-wider text-teal-400">Completed</span>
          <span class="text-[10px] px-2 py-0.5 rounded bg-[#1e293b] mono text-teal-400" id="countCompleted">0</span>
        </div>
        <div class="space-y-3" id="colCompleted"></div>
      </div>
    </div>
  </main>

  <!-- Compose Form Modal -->
  <div id="formBackdrop" class="fixed inset-0 bg-black/70 hidden items-center justify-center p-4 z-50">
    <div class="bg-[#111c44] border border-[#1b254b] max-w-sm w-full rounded p-5 shadow-2xl relative">
      <h3 class="text-sm font-bold text-white uppercase tracking-wider mb-4">Create Board Task</h3>
      <div class="space-y-3.5">
        <div>
          <label class="block text-[10px] font-bold uppercase text-[#718096] tracking-wider mb-1.5 mono">Title</label>
          <input type="text" id="taskTitle" class="w-full bg-[#0b0f19] border border-[#1b254b] rounded p-2 text-xs text-white focus:outline-none focus:border-[#4f46e5]">
        </div>
        <div>
          <label class="block text-[10px] font-bold uppercase text-[#718096] tracking-wider mb-1.5 mono">Description</label>
          <textarea id="taskDesc" rows="3" class="w-full bg-[#0b0f19] border border-[#1b254b] rounded p-2 text-xs text-white focus:outline-none focus:border-[#4f46e5] resize-none"></textarea>
        </div>
      </div>
      <div class="flex items-center justify-end space-x-2.5 mt-5">
        <button onclick="closeForm()" class="text-xs text-[#718096] hover:text-white px-3 py-1.5">Cancel</button>
        <button onclick="publishTask()" class="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-4 py-1.5 rounded text-xs font-semibold uppercase">Add Task</button>
      </div>
    </div>
  </div>

  <script>
    let tasks = [
      { id: '1', title: 'Complete system wiring', desc: 'Initialize node connection pipeline, review sandbox server files, configure logs.', status: 'progress' },
      { id: '2', title: 'Establish color templates', desc: 'Structure primary off-whites and slate tones for the layout components.', status: 'todo' },
      { id: '3', title: 'Compile web application', desc: 'Verify TS lint errors, bundle resources with esbuild compiler.', status: 'completed' }
    ];

    function saveTasks() {
      localStorage.setItem('task_board_tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
      const stored = localStorage.getItem('task_board_tasks');
      if (stored) {
        tasks = JSON.parse(stored);
      }
    }

    function openForm() {
      document.getElementById('formBackdrop').style.display = 'flex';
    }

    function closeForm() {
      document.getElementById('formBackdrop').style.display = 'none';
    }

    function publishTask() {
      const title = document.getElementById('taskTitle').value.trim();
      const desc = document.getElementById('taskDesc').value.trim();

      if (!title || !desc) {
        alert('All fields are required');
        return;
      }

      tasks.push({
        id: 't_' + Math.random().toString(36).substring(2, 9),
        title,
        desc,
        status: 'todo'
      });

      saveTasks();
      closeForm();
      render();

      // Reset
      document.getElementById('taskTitle').value = '';
      document.getElementById('taskDesc').value = '';
    }

    function moveTask(taskId, newStatus) {
      tasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
      saveTasks();
      render();
    }

    function deleteTask(taskId) {
      tasks = tasks.filter(t => t.id !== taskId);
      saveTasks();
      render();
    }

    function render() {
      const colTodo = document.getElementById('colTodo');
      const colProgress = document.getElementById('colProgress');
      const colCompleted = document.getElementById('colCompleted');

      colTodo.innerHTML = '';
      colProgress.innerHTML = '';
      colCompleted.innerHTML = '';

      let countTodo = 0, countProgress = 0, countCompleted = 0;

      tasks.forEach(t => {
        const card = document.createElement('div');
        card.className = 'bg-[#111c44]/35 border border-[#1b254b] hover:border-[#27272a] rounded p-4 flex flex-col justify-between relative';
        
        let actionButtons = '';
        if (t.status === 'todo') {
          actionButtons = \`
            <button onclick="moveTask('\${t.id}', 'progress')" class="text-[9px] text-[#4f46e5] font-semibold uppercase hover:underline">Start</button>
          \`;
        } else if (t.status === 'progress') {
          actionButtons = \`
            <button onclick="moveTask('\${t.id}', 'completed')" class="text-[9px] text-teal-400 font-semibold uppercase hover:underline">Complete</button>
          \`;
        } else {
          actionButtons = \`
            <button onclick="moveTask('\${t.id}', 'todo')" class="text-[9px] text-gray-500 font-semibold uppercase hover:underline">Reopen</button>
          \`;
        }

        card.innerHTML = \`
          <div>
            <div class="flex items-start justify-between">
              <h4 class="text-xs font-bold text-white tracking-wide mb-1 leading-snug">\${t.title}</h4>
              <button onclick="deleteTask('\${t.id}')" class="text-rose-500 hover:text-rose-400 text-[10px] font-semibold p-1">✕</button>
            </div>
            <p class="text-[11px] text-[#718096] leading-relaxed mb-3">\${t.desc}</p>
          </div>
          <div class="pt-2 border-t border-[#1b254b] mt-2 flex justify-between items-center bg-[#111c44]/10">
            \${actionButtons}
            <span class="text-[9px] select-none uppercase font-mono tracking-wider text-[#718096] bg-[#0c1122]/45 px-1.5 py-0.5 rounded border border-[#1b254b]">\${t.status}</span>
          </div>
        \`;

        if (t.status === 'todo') {
          colTodo.appendChild(card);
          countTodo++;
        } else if (t.status === 'progress') {
          colProgress.appendChild(card);
          countProgress++;
        } else if (t.status === 'completed') {
          colCompleted.appendChild(card);
          countCompleted++;
        }
      });

      // Update counters
      document.getElementById('countTodo').textContent = countTodo;
      document.getElementById('countProgress').textContent = countProgress;
      document.getElementById('countCompleted').textContent = countCompleted;

      // Update Top stats
      document.getElementById('statTodo').textContent = countTodo;
      document.getElementById('statProgress').textContent = countProgress;
      document.getElementById('statCompleted').textContent = countCompleted;

      // Update Pct
      const total = tasks.length;
      const pct = total === 0 ? 0 : Math.round((countCompleted / total) * 100);
      document.getElementById('completionPct').textContent = pct + '%';
    }

    loadTasks();
    render();
  </script>
</body>
</html>`
      }
    ]
  },
  {
    id: 'basic-api',
    name: 'Basic API Backend Portal',
    description: 'An Express.js-based API layout server with predefined REST mock routes, paired with a web UI and requests logger.',
    samplePrompt: 'Introduce query parameter filtering based on item category. Add a "category" field to the creation payload and filter results returned by GET /api/items?category=xxx.',
    files: [
      {
        path: 'server.ts',
        content: `// Express micro-server demonstrating REST standard structures
import express from 'express';
const app = express();
app.use(express.json());

const PORT = 3000;

interface MockItem {
  id: string;
  name: string;
  category: string;
  price: number;
}

let items: MockItem[] = [
  { id: '1', name: 'Ultra Grid Screen', category: 'Hardware', price: 549 },
  { id: '2', name: 'Ambient Soundbar', category: 'Hardware', price: 119 },
  { id: '3', name: 'Interactive Cursor Studio', category: 'Software', price: 29 }
];

// Logger middleware
app.use((req, res, next) => {
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url}\`);
  next();
});

// GET /api/items
app.get('/api/items', (req, res) => {
  res.json(items);
});

// POST /api/items
app.post('/api/items', (req, res) => {
  const { name, category, price } = req.body;
  if (!name || !category || !price) {
    return res.status(400).json({ error: 'Missing item attributes' });
  }
  const item: MockItem = {
    id: 'api_' + Math.random().toString(36).substring(2, 7),
    name, category, price: Number(price)
  };
  items.push(item);
  res.status(201).json(item);
});

// DELETE /api/items/:id
app.delete('/api/items/:id', (req, res) => {
  items = items.filter(item => item.id !== req.params.id);
  res.json({ success: true, message: 'Deleted successfully' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Micro API running on http://0.0.0.0:\${PORT}\`);
});\`
      },
      {
        path: 'index.html',
        content: \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Sandbox Portal</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@450;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Space Grotesk', sans-serif; }
    .mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-[#050507] text-[#9093a0] min-h-screen">
  <header class="border-b border-[#1f2029] bg-[#0c0d12]/90 sticky top-0 z-50">
    <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <span class="mono text-[#10b981] font-bold text-sm select-none">>_</span>
        <span class="text-white font-bold tracking-wider text-xs uppercase mono">API Sandbox Portal</span>
      </div>
      <div class="flex items-center space-x-2 bg-[#12131a] px-2.5 py-1 border border-[#1f2029] rounded">
        <span class="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-ping"></span>
        <span class="text-[9px] text-[#10b981] uppercase mono font-semibold tracking-widest">SERVER ONLINE</span>
      </div>
    </div>
  </header>

  <main class="max-w-4xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
    
    <!-- Requests Console -->
    <div>
      <h3 class="text-xs uppercase font-bold text-white tracking-widest mb-4 mono select-none">Send REST payload</h3>
      <div class="bg-[#0c0d12] border border-[#1f2029] p-5 rounded space-y-4">
        <div>
          <label class="block text-[10px] uppercase font-bold mb-1.5 mono text-[#10b981]">Item Name</label>
          <input type="text" id="itemName" placeholder="e.g. Mechanical Keyboard" class="w-full bg-[#050507] border border-[#1f2029] p-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#10b981] mono">
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-[10px] uppercase font-bold mb-1.5 mono text-[#10b981]">Category</label>
            <input type="text" id="itemCategory" placeholder="e.g. Hardware" class="w-full bg-[#050507] border border-[#1f2029] p-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#10b981] mono">
          </div>
          <div>
            <label class="block text-[10px] uppercase font-bold mb-1.5 mono text-[#10b981]">Price ($)</label>
            <input type="number" id="itemPrice" placeholder="e.g. 120" class="w-full bg-[#050507] border border-[#1f2029] p-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#10b981] mono">
          </div>
        </div>
        <button onclick="postItem()" class="w-full bg-[#10b981] hover:bg-[#059669] text-gray-950 text-xs font-bold py-2.5 rounded mono uppercase tracking-wider">
          POST /api/items
        </button>
      </div>
    </div>

    <!-- Live Telemetry Viewport -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xs uppercase font-bold text-white tracking-widest mono select-none">GET /api/items output</h3>
        <button onclick="fetchItems()" class="text-xs text-[#10b981] hover:underline mono">Reload</button>
      </div>
      <div class="bg-[#0c0d12] border border-[#1f2029] p-4 rounded h-[310px] overflow-y-auto font-mono text-xs select-text">
        <pre id="jsonResult" class="text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed">Loading datasets...</pre>
      </div>
    </div>

  </main>

  <script>
    // Since mock routes execute inside the workspace, we simulate database response
    let items = [
      { id: '1', name: 'Ultra Grid Screen', category: 'Hardware', price: 549 },
      { id: '2', name: 'Ambient Soundbar', category: 'Hardware', price: 119 },
      { id: '3', name: 'Interactive Cursor Studio', category: 'Software', price: 29 }
    ];

    function loadItems() {
      const stored = localStorage.getItem('api_portal_items');
      if (stored) {
        items = JSON.parse(stored);
      }
    }

    function saveItems() {
      localStorage.setItem('api_portal_items', JSON.stringify(items));
    }

    function fetchItems() {
      const pre = document.getElementById('jsonResult');
      pre.textContent = JSON.stringify(items, null, 2);
    }

    function postItem() {
      const name = document.getElementById('itemName').value.trim();
      const category = document.getElementById('itemCategory').value.trim();
      const price = document.getElementById('itemPrice').value.trim();

      if (!name || !category || !price) {
        alert('Missing required properties');
        return;
      }

      items.push({
        id: 'api_' + Math.random().toString(36).substring(2, 6),
        name,
        category,
        price: Number(price)
      });

      saveItems();
      fetchItems();

      // Reset
      document.getElementById('itemName').value = '';
      document.getElementById('itemCategory').value = '';
      document.getElementById('itemPrice').value = '';
    }

    loadItems();
    fetchItems();
  </script>
</body>
</html>`
      }
    ]
  }
];

export const db = new Database();
export default db;
