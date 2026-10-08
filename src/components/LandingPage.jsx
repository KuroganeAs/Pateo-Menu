import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useViewport } from '../hooks/useViewport';
import { ui } from '../data/strings';
import { SOCIALS } from '../data/socials';
import { DURATION, EASE_OUT } from '../lib/motion';
import { cn } from '../lib/cn';
import LanguageSwitch from './LanguageSwitch';
import ThemeToggle from './ThemeToggle';
import PromoCarousel from './PromoCarousel';
import SocialFooter from './SocialFooter';
import FadeText from './FadeText';
import logo from '../assets/logo.png';

const FacebookIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.5-3.91 3.79-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.57v1.88h2.78l-.45 2.9h-2.33V22c4.78-.75 8.44-4.9 8.44-9.94Z" />
  </svg>
);

// Blocks rise in one after another once the splash has handed over.
const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const block = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.card, ease: EASE_OUT } }
};

function Brand() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-2.5 md:gap-3 min-w-0">
      <div
        data-brand-logo
        className="w-10 h-10 md:w-12 md:h-12 lg:w-11 lg:h-11 rounded-xl bg-white border border-line flex items-center justify-center overflow-hidden shrink-0"
      >
        <img src={logo} alt="Páteo" className="w-[85%] h-[85%] object-contain" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs md:text-[13px] font-medium text-muted truncate">
          <FadeText>{t(ui.landing.welcomeTo)}</FadeText>
        </span>
        <span className="font-display text-lg md:text-[22px] lg:text-xl font-semibold leading-tight tracking-[-0.01em]"><FadeText>Páteo</FadeText></span>
      </div>
    </div>
  );
}

function Controls() {
  return (
    <div className="flex items-center gap-2 max-[379px]:gap-1.5 md:gap-2.5 shrink-0">
      <ThemeToggle />
      <LanguageSwitch />
    </div>
  );
}

function FacebookLink({ className }) {
  const { t } = useLanguage();
  if (!SOCIALS.facebook) return null;
  return (
    <a
      href={SOCIALS.facebook}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('inline-flex items-center gap-1.5 text-sm md:text-[15px] font-medium text-primary hover:text-primary-dark transition-colors', className)}
    >
      {FacebookIcon}
      <FadeText>{t(ui.landing.followFacebook)}</FadeText>
    </a>
  );
}

function ViewMenuButton({ onClick, className }) {
  const { t } = useLanguage();
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-[54px] md:h-14 inline-flex items-center justify-center gap-2 rounded-[14px] bg-primary text-on-primary text-base font-semibold transition-[transform,background-color] duration-150 ease-out hover:bg-primary-dark active:scale-[0.97]',
        className
      )}
    >
      <FadeText>{t(ui.landing.viewMenu)}</FadeText>
      <ArrowDown size={18} strokeWidth={2.2} className="md:hidden" />
      <ArrowRight size={18} strokeWidth={2.2} className="hidden md:block" />
    </button>
  );
}

function Heading({ className, titleClass }) {
  const { t } = useLanguage();
  return (
    <div className={cn('flex flex-col gap-1.5 md:gap-2', className)}>
      <h1 className={cn('font-display font-semibold tracking-[-0.02em] leading-[1.1]', titleClass)}>
        <FadeText>{t(ui.landing.promoHeading)}</FadeText>
      </h1>
      <p className="text-sm md:text-base lg:text-lg leading-relaxed text-ink-2">
        <FadeText>{t(ui.landing.promoSubheading)}</FadeText>
      </p>
    </div>
  );
}

// Desktop: text and the call to action on the left, the poster deck fanned
// out on the right, socials in a thin strip along the bottom.
function DesktopLanding({ onEnterMenu, ready }) {
  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-background">
      <div className="min-h-full flex flex-col min-h-[640px]">
        <header className="h-[84px] shrink-0 flex items-center justify-between px-16">
          <Brand />
          <Controls />
        </header>

        <motion.main
          variants={container}
          initial="hidden"
          animate={ready ? 'show' : 'hidden'}
          className="flex-1 grid grid-cols-[minmax(0,500px)_minmax(0,1fr)] gap-16 items-center px-16 py-6"
        >
          <motion.div variants={block} className="flex flex-col gap-7">
            <div className="flex flex-col gap-3.5">
              <span className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-[0.06em] uppercase text-primary">
                <span className="w-[18px] h-0.5 rounded-full bg-primary" aria-hidden="true" />
                <FadeText>Páteo Supermercado</FadeText>
              </span>
              <Heading titleClass="text-[clamp(48px,4.8vw,68px)] leading-[1.02] tracking-[-0.03em]" />
            </div>
            <ViewMenuButton onClick={onEnterMenu} className="self-start px-7" />
          </motion.div>
          <motion.div variants={block}>
            <PromoCarousel variant="stack" />
          </motion.div>
        </motion.main>

        <footer className="h-[84px] shrink-0 flex items-center justify-between gap-6 px-16 border-t border-line">
          <SocialFooter showName={false} />
          <FacebookLink />
        </footer>
      </div>
    </div>
  );
}

// Phone and tablet: one column with the deck in the middle and the call to
// action pinned to the bottom of the screen.
function StackedLanding({ onEnterMenu, ready }) {
  return (
    <div className="w-full h-full flex flex-col bg-background">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <header className="flex items-center justify-between gap-3 px-5 pt-3.5 md:px-10 md:pt-6">
          <Brand />
          <Controls />
        </header>

        <motion.div variants={container} initial="hidden" animate={ready ? 'show' : 'hidden'} className="pb-8 md:pb-10">
          <motion.div variants={block}>
            <Heading className="px-5 pt-[22px] md:px-10 md:pt-11" titleClass="text-[30px] md:text-[46px] md:leading-[1.05]" />
          </motion.div>

          <motion.div variants={block} className="mt-5 md:mt-8">
            <PromoCarousel variant="center" />
          </motion.div>

          <motion.div variants={block} className="flex flex-col items-center gap-5 pt-5 md:pt-10 px-5">
            <FacebookLink className="text-center" />
            <div className="flex flex-col items-center gap-2">
              <SocialFooter showName={false} />
              {/* Tablet shows the store name in the bottom bar instead */}
              <p className="md:hidden text-xs text-muted"><FadeText>Páteo Supermercado</FadeText></p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="shrink-0 border-t border-line bg-background px-5 pt-3.5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:flex md:items-center md:justify-between md:gap-6 md:px-10 md:pt-5 md:pb-[max(2rem,env(safe-area-inset-bottom))]">
        <span className="hidden md:block text-sm font-semibold"><FadeText>Páteo Supermercado</FadeText></span>
        <ViewMenuButton onClick={onEnterMenu} className="w-full md:w-80" />
      </div>
    </div>
  );
}

export default function LandingPage({ onEnterMenu, ready = true }) {
  const { isDesktop } = useViewport();
  return isDesktop
    ? <DesktopLanding onEnterMenu={onEnterMenu} ready={ready} />
    : <StackedLanding onEnterMenu={onEnterMenu} ready={ready} />;
}
