import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import { LanguageProvider } from './context/LanguageContext';
import LandingPage from './components/LandingPage';
import MenuPanel from './components/MenuPanel';
import SplashScreen from './components/SplashScreen';

// Landing and menu are separate views — the menu is only reachable through
// the View Menu button (no scroll path), and the swap animates like one
// continuous page scroll: landing slides up and away as the menu rises in.
const swapTransition = { duration: 0.65, ease: [0.65, 0, 0.35, 1] };

export default function App() {
  const [view, setView] = useState('landing');

  return (
    <LanguageProvider>
      <SplashScreen />
      <AnimatePresence initial={false}>
        {view === 'landing' ? (
          <motion.div
            key="landing"
            className="fixed inset-0"
            exit={{ y: '-100%' }}
            transition={swapTransition}
          >
            <LandingPage onEnterMenu={() => setView('menu')} />
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            className="fixed inset-0"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={swapTransition}
          >
            <MenuPanel />
          </motion.div>
        )}
      </AnimatePresence>
      <Analytics />
    </LanguageProvider>
  );
}
