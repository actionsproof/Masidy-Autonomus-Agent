import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAgentStore } from './stores/agent-store.js';
import { TopBar } from './components/TopBar.js';
import Dashboard from './pages/Dashboard.js';
import Workspace from './pages/Workspace.js';

export default function App() {
  const { currentProject, selectProject, fetchUser, fetchProjects } = useAgentStore();

  useEffect(() => {
    fetchUser();
    fetchProjects();
  }, [fetchUser, fetchProjects]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans selection:bg-sky-950">
      {/* Universal Top Bar Header navigator */}
      <TopBar 
        onBack={() => {
          // De-select project to navigate back to dashboard view
          useAgentStore.setState({ currentProject: null });
        }} 
      />

      <main className="flex-1 flex flex-col min-h-0 relative">
        <AnimatePresence mode="wait">
          {!currentProject ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              <Dashboard 
                onSelectProject={(id) => {
                  selectProject(id);
                }} 
              />
            </motion.div>
          ) : (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex-1 flex flex-col"
            >
              <Workspace />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
