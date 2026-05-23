import { BookOpen, Sparkles } from 'lucide-react';

export function GuidePanel() {
  const faqs = [
    {
      q: 'How do Autonomous Lab Workspaces function?',
      a: 'Every workspace corresponds to an internal sandboxed directory where a dedicated developer loop agent operates. The agent reads your target goals, plans contiguous lines of adjustments, updates file structures, runs automated linter tests, and launches hot reload sessions on the dev server.'
    },
    {
      q: 'What are Lab Credits (LAB tokens)?',
      a: 'Credits represent simulated resource utilization quotas inside the container, mapping CPU and RAM limits safely. Provisioning a brand-new space costs 10 LAB, and verifying starter templates with tests costs 5 LAB. Refill your balance instantly at zero charge inside the Billing & Faucet section!'
    },
    {
      q: 'Vite Server & Port 3000 Ingress Rules',
      a: 'The preview is mapped to port 3000 via a secure nginx reverse proxy. Any custom server setup must bind to host 0.0.0.0 and port 3000 to resolve client browser preview connections successfully.'
    },
    {
      q: 'How does evaluation feedback affect the system?',
      a: 'Your submitted review stars and alternative strategies train future automated agents, and are visualisable inside the Live Metrics screen. You can export complete feedback sets as structured CSVs or JSON arrays.'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn text-left leading-relaxed font-sans">
      <div>
        <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-1 select-none">
          <BookOpen className="w-4 h-4" />
          <span className="text-xs uppercase font-mono tracking-widest font-bold">Standard Manual</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Onboarding, Core Workflow & Developer Guidelines</h2>
        <p className="text-xs text-gray-550 dark:text-[#a1a1aa] mt-0.5 max-w-xl">
          Read our concise guide outlining structural boundaries, the developer loops, and visual design parameters.
        </p>
      </div>

      <div className="bg-white dark:bg-[#0e0e11] border border-gray-200 dark:border-[#1f1f23] rounded-xl p-6.5 space-y-6 shadow-sm dark:shadow-none">
        {faqs.map((faq, idx) => (
          <div key={idx} className="space-y-2 font-sans">
            <h4 className="text-sm font-extrabold text-gray-800 dark:text-[#e4e4e7] flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 dark:bg-[#4f46e5] mr-2 shrink-0" />
              {faq.q}
            </h4>
            <p className="text-xs text-gray-600 dark:text-[#71717a] pl-4 leading-relaxed font-sans">
              {faq.a}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-indigo-50/50 dark:bg-[#151221] border border-indigo-150 dark:border-[#4f46e5]/20 p-5 rounded-xl flex items-center space-x-4 select-none">
        <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <div>
          <h5 className="text-xs font-bold font-mono text-indigo-900 dark:text-white uppercase tracking-wider">Need Custom Assistance?</h5>
          <p className="text-[11px] text-indigo-750 dark:text-[#71717a] mt-0.5">
            Select a template with predefined settings or initialize a fresh blank workspace to verify code structures.
          </p>
        </div>
      </div>
    </div>
  );
}
