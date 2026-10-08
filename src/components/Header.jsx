import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ui } from '../data/strings';
import FadeText from './FadeText';
import LanguageSwitch from './LanguageSwitch';
import ThemeToggle from './ThemeToggle';
import logo from '../assets/logo.png';

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
};

const formatTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function useClock() {
  const [timeStr, setTimeStr] = useState(formatTime);
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay);
  useEffect(() => {
    const tick = () => {
      setTimeStr(formatTime());
      setTimeOfDay(getTimeOfDay());
    };
    const interval = setInterval(tick, 10000);
    return () => clearInterval(interval);
  }, []);
  return { timeStr, timeOfDay };
}

// The logo tile doubles as the way back to this week's specials.
function LogoButton({ onBack, size = 'w-10 h-10 md:w-12 md:h-12' }) {
  const { t } = useLanguage();
  return (
    <button
      onClick={onBack}
      aria-label={t(ui.landing.promoHeading)}
      title={t(ui.landing.promoHeading)}
      className={`${size} shrink-0 rounded-xl bg-white border border-line flex items-center justify-center overflow-hidden transition-transform duration-150 ease-out active:scale-95`}
    >
      <img src={logo} alt="" className="w-[85%] h-[85%] object-contain" />
    </button>
  );
}

// Top bar for phone and tablet portrait. `search` is placed inline between
// the brand and the controls on tablet.
export function MenuHeader({ onBack, search }) {
  const { t } = useLanguage();
  const { timeOfDay } = useClock();

  return (
    <header className="flex items-center gap-3 max-[379px]:gap-2 md:gap-4 px-5 pt-3.5 pb-2.5 md:px-10 md:pt-5 md:pb-0">
      <div className="flex items-center gap-2.5 md:gap-3 min-w-0 md:shrink-0">
        <LogoButton onBack={onBack} />
        <div className="flex flex-col min-w-0">
          <span className="text-xs md:text-[13px] font-medium text-muted truncate">
            <FadeText>{t(ui.greetings[timeOfDay])}</FadeText>
          </span>
          <span className="font-display text-lg max-[379px]:text-[17px] md:text-[22px] font-semibold leading-tight tracking-[-0.01em] truncate">
            <FadeText>{t(ui.menuTitle)}</FadeText>
          </span>
        </div>
      </div>
      {search && <div className="flex-1 min-w-0">{search}</div>}
      <div className="ml-auto shrink-0 flex items-center gap-2 max-[379px]:gap-1.5 md:gap-2.5">
        <ThemeToggle />
        <LanguageSwitch />
      </div>
    </header>
  );
}

// Brand block at the top of the sidebar (tablet landscape and desktop).
export function SidebarHeader({ onBack }) {
  const { t } = useLanguage();
  const { timeStr, timeOfDay } = useClock();
  const greeting = t(ui.greetings[timeOfDay]).replace(/,\s*$/, '');

  return (
    <div className="flex items-center gap-3">
      <LogoButton onBack={onBack} size="w-11 h-11" />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-display text-[19px] font-semibold leading-tight tracking-[-0.01em] truncate">
          <FadeText>{greeting}</FadeText>
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted tabular-nums">
          <Clock size={12} strokeWidth={2.2} />
          <FadeText>{timeStr}</FadeText>
        </span>
      </div>
    </div>
  );
}

// Theme + language, pinned to the bottom of the sidebar.
export function SidebarControls() {
  return (
    <div className="flex items-center justify-between gap-2 pt-4 border-t border-line">
      <ThemeToggle />
      <LanguageSwitch />
    </div>
  );
}
