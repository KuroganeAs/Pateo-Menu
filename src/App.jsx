import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { LanguageProvider } from './context/LanguageContext';
import { MenuDataProvider } from './context/MenuDataContext';
import { ThemeProvider } from './context/ThemeContext';
import { DURATION, EASE_IN, EASE_OUT } from './lib/motion';
import LandingPage from './components/LandingPage';
import MenuPanel from './components/MenuPanel';
import SplashScreen from './components/SplashScreen';

// Landing and menu are separate views. The menu rises over the landing like
// a sheet while the landing shrinks back and dims; going back reverses it,
// faster. The menu always stays on top so both directions layer correctly.
const landingVariants = {
  enter: { scale: 0.94, opacity: 0.35 },
  center: { scale: 1, opacity: 1, transition: { duration: DURATION.page, ease: EASE_OUT } },
  exit: { scale: 0.94, opacity: 0.35, transition: { duration: DURATION.page, ease: EASE_OUT } }
};
const menuVariants = {
  enter: { y: '100%' },
  center: { y: 0, transition: { duration: DURATION.page, ease: EASE_OUT } },
  exit: { y: '100%', transition: { duration: DURATION.sheetOut, ease: EASE_IN } }
};

export default function App() {
  const [view, setView] = useState('landing');
  const [introDone, setIntroDone] = useState(false);
  const onSplashDone = useCallback(() => setIntroDone(true), []);

  return (
    <MotionConfig reducedMotion="user">
    <ThemeProvider>
    <LanguageProvider>
      <MenuDataProvider>
      <SplashScreen onDone={onSplashDone} />
      <AnimatePresence initial={false}>
        {view === 'landing' ? (
          <motion.div
            key="landing"
            className="fixed inset-0 z-0 origin-top"
            variants={landingVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <LandingPage onEnterMenu={() => setView('menu')} ready={introDone} />
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            className="fixed inset-0 z-10 shadow-[0_-12px_40px_-16px_rgba(0,0,0,0.35)]"
            variants={menuVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <MenuPanel onBack={() => setView('landing')} />
          </motion.div>
        )}
      </AnimatePresence>
      </MenuDataProvider>
    </LanguageProvider>
    </ThemeProvider>
    </MotionConfig>
  );
}
