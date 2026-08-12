import React, { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useViewport } from '../hooks/useViewport';
import { useFeedScroll } from '../hooks/useFeedScroll';
import { ui } from '../data/strings';
import { Image as ImageIcon, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitch from './LanguageSwitch';

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
};

export default function Header({ shrinkOnScroll = false }) {
  const { language, t } = useLanguage();
  const { isDesktop } = useViewport();
  const [timeStr, setTimeStr] = useState('');
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      setTimeStr(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setTimeOfDay(getTimeOfDay());
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Shrink header as the user scrolls the feed (mobile/tablet)
  const handleScroll = useCallback((container) => {
    if (shrinkOnScroll) setIsCompact(container.scrollTop > 40);
  }, [shrinkOnScroll]);

  useFeedScroll(handleScroll);

  return (
    <header className={`flex justify-between items-center px-4 transition-all duration-300 ${isCompact ? 'py-2' : 'py-4'}`}>
      <div className="flex flex-col">
        <AnimatePresence mode="wait">
          <motion.p
            key={`${language}-${timeOfDay}`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
            className="font-display text-base font-semibold text-ink"
          >
            {t(ui.greetings[timeOfDay])}
          </motion.p>
        </AnimatePresence>

        {isDesktop && (
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted font-medium">
            <Clock size={12} />
            <span className="tabular-nums">{timeStr}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <LanguageSwitch />

        {/* Logo Placeholder */}
        <div className={`rounded-full bg-stone-200 flex items-center justify-center text-stone-400 shrink-0 transition-all duration-300 ${isCompact ? 'w-8 h-8' : 'w-10 h-10'}`}>
          <ImageIcon size={isCompact ? 16 : 20} />
        </div>
      </div>
    </header>
  );
}
