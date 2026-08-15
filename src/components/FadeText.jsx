import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

// Fades in just this piece of text when the language changes — the
// surrounding layout, images and chrome stay perfectly still. The key
// remounts the span on language change, replaying the 180ms fade-in.
export default function FadeText({ children, className }) {
  const { language } = useLanguage();
  return (
    <motion.span
      key={language}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.span>
  );
}
