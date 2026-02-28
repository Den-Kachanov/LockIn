import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoadingScreen } from './components/LoadingScreen';
import { CircuitBackground } from './components/CircuitBackground';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { Progress } from './pages/Progress';
import { Casino } from './pages/Casino';
import { Rewards } from './pages/Rewards';
import { Community } from './pages/Community';
import { Profile } from './pages/Profile';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'progress':
        return <Progress />;
      case 'casino':
        return <Casino />;
      case 'rewards':
        return <Rewards />;
      case 'community':
        return <Community />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <ThemeProvider>
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {!isLoading && (
        <div className="min-h-screen text-white relative overflow-hidden">
          {/* Background */}
          <CircuitBackground />

          {/* Navigation */}
          <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

          {/* Main Content */}
          <main className="relative z-10 px-3 md:px-6 py-4 md:py-8">
            <div className="max-w-7xl mx-auto">
              {renderPage()}
            </div>
          </main>

          {/* Footer */}
          <footer className="relative z-10 px-3 md:px-6 py-3 md:py-4 border-t border-white/10 backdrop-blur-xl bg-black/20 mt-8 md:mt-12">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-xs md:text-sm text-white/50">
                © 2026 UCU Lock In - Study Arena | Keep grinding, future masters! 🎓
              </p>
            </div>
          </footer>
        </div>
      )}
    </ThemeProvider>
  );
}
