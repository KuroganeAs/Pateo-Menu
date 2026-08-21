import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ui } from '../data/strings';
import LanguageSwitch from './LanguageSwitch';
import PromoCarousel from './PromoCarousel';
import SocialFooter from './SocialFooter';
import FadeText from './FadeText';
import logo from '../assets/logo.png';

export default function LandingPage({ onEnterMenu }) {
  const { t } = useLanguage();

  return (
    <div className="w-full h-full overflow-y-auto bg-background paper">
      {/* Slim brand bar — promos are the star, so no tall hero */}
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-white shadow-card overflow-hidden shrink-0 flex items-center justify-center">
            <img src={logo} alt="" className="w-full h-full object-contain p-0.5" />
          </div>
          <span className="font-display text-base font-bold text-ink">
            <FadeText>{t(ui.landing.welcome)}</FadeText>
          </span>
        </div>
        <LanguageSwitch />
      </header>

      <section className="px-5 pt-4 pb-10">
        <h2 className="font-display text-2xl font-bold text-ink text-center">
          <FadeText>{t(ui.landing.promoHeading)}</FadeText>
        </h2>
        <p className="text-sm text-muted text-center mt-2 mb-6 max-w-sm mx-auto">
          <FadeText>{t(ui.landing.promoSubheading)}</FadeText>
        </p>

        <PromoCarousel />

        <div className="flex justify-center mt-8">
          <button
            onClick={onEnterMenu}
            className="inline-flex items-center gap-2 bg-primary text-white font-display font-semibold px-8 py-4 rounded-full shadow-glow transition-transform duration-300 active:scale-95 hover:-translate-y-0.5"
          >
            <FadeText>{t(ui.landing.viewMenu)}</FadeText>
            <ChevronDown size={18} />
          </button>
        </div>
      </section>

      <SocialFooter />
    </div>
  );
}
