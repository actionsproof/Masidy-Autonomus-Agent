import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import db from '../services/database.js';

export class LocalSandbox {
  private workspaceDir: string;
  private projectId: string;

  constructor(projectId: string) {
    this.projectId = projectId;
    this.workspaceDir = path.join(process.cwd(), 'workspaces', projectId);
    this.ensureWorkspace();
  }

  private ensureWorkspace() {
    if (!fs.existsSync(this.workspaceDir)) {
      fs.mkdirSync(this.workspaceDir, { recursive: true });
    }
  }

  getWorkspacePath(subPath: string) {
    return path.join(this.workspaceDir, subPath);
  }

  // --- Filesystem Actions ---
  
  async listFiles(): Promise<string[]> {
    this.ensureWorkspace();
    const results: string[] = [];

    const walker = (dir: string, relativePrefix = '') => {
      const list = fs.readdirSync(dir);
      for (const file of list) {
        if (file === 'node_modules' || file === '.git' || file === 'db.json' || file === '.DS_Store') {
          continue;
        }
        const fullPath = path.join(dir, file);
        const relPath = relativePrefix ? `${relativePrefix}/${file}` : file;
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walker(fullPath, relPath);
        } else {
          results.push(relPath);
        }
      }
    };

    try {
      walker(this.workspaceDir);
    } catch (e) {
      console.error('Error listing files:', e);
    }
    return results;
  }

  async readCodeFile(filePath: string): Promise<string> {
    const fullPath = this.getWorkspacePath(filePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    return fs.readFileSync(fullPath, 'utf8');
  }

  async writeCodeFile(filePath: string, content: string): Promise<void> {
    const fullPath = this.getWorkspacePath(filePath);
    const parentDir = path.dirname(fullPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(fullPath, content, 'utf8');
    
    // Save to virtual DB files table for state sharing with UI
    db.saveFile(this.projectId, filePath, content);
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = this.getWorkspacePath(filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    db.deleteFile(this.projectId, filePath);
  }

  // --- Shell Execution with 30s timeout ---

  async runCommand(command: string, onOutput?: (chunk: string) => void): Promise<{ stdout: string; stderr: string; code: number }> {
    this.ensureWorkspace();

    return new Promise((resolve) => {
      // 30 Seconds Timeout from constraints
      const timeout = 30000;
      
      const child = exec(command, {
        cwd: this.workspaceDir,
        timeout: timeout,
        killSignal: 'SIGTERM',
      }, (error, stdout, stderr) => {
        const exitCode = error ? (error.code || 1) : 0;
        resolve({
          stdout: stdout || '',
          stderr: stderr || (error ? error.message : ''),
          code: exitCode
        });
      });

      if (onOutput) {
        child.stdout?.on('data', (data) => onOutput(data.toString()));
        child.stderr?.on('data', (data) => onOutput(data.toString()));
      }
    });
  }

  // --- Browser simulation ---

  async takeBrowserScreenshot(url: string, contentDesc?: string): Promise<{ screenshot: string; html: string }> {
    // Generate an elegant, responsive HTML web page preview that the browser preview can render in an iframe
    // In our workspace loop, we will look into the files created (like index.html, App.tsx, etc.) and map it into 
    // a gorgeous mockup screenshot or complete visual simulation.
    const customHtml = `
      <div style="font-family: system-ui, sans-serif; padding: 20px; background: #0f172a; color: #f1f5f9; min-height: 100vh;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 1.25rem; color: #38bdf8;">App Sandbox Preview</h2>
          <span style="background: #1e293b; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; color: #94a3b8; font-family: monospace;">${url}</span>
        </div>
        <div style="background: #1e293b; padding: 24px; border-radius: 8px; border: 1px solid #334155; text-align: center;">
          <div style="font-size: 4rem; margin-bottom: 16px;">🚀</div>
          <h3 style="margin: 0 0 8px 0; font-size: 1.5rem; color: #fff;">Application Rendered Successfully</h3>
          <p style="margin: 0; color: #94a3b8;">${contentDesc || 'Autonomous AI code generation pipeline running in active background.'}</p>
        </div>
      </div>
    `;
    
    // Simply convert dummy view to base64 mock image or supply custom HTML
    return {
      screenshot: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="#0f172a"/><text x="400" y="300" font-family="sans-serif" font-size="24" fill="#38bdf8" text-anchor="middle">Browser Renderer: ' + url + '</text></svg>',
      html: customHtml
    };
  }
}
