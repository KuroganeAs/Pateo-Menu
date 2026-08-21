// All localized UI copy in one place. Menu content lives in menu.js;
// this file is only interface strings. Add a language here and in menu.js
// and the whole app picks it up.
export const ui = {
  greetings: {
    morning: { en: 'Good Morning,', pt: 'Bom Dia,', tet: 'Bondia,' },
    afternoon: { en: 'Good Afternoon,', pt: 'Boa Tarde,', tet: 'Botarde,' },
    evening: { en: 'Good Evening,', pt: 'Boa Noite,', tet: 'Bonoite,' }
  },
  searchPlaceholder: { en: 'Search menu...', pt: 'Pesquisar menu...', tet: 'Buka menu...' },
  emptyState: {
    en: 'No dishes match your search.',
    pt: 'Nenhum prato corresponde à sua pesquisa.',
    tet: 'La iha hahán ne\'ebé hanesan ho buka.'
  },
  selectOption: { en: 'Select Option', pt: 'Escolha a Opção', tet: 'Hili Opsaun' },
  optionsLabel: { en: 'options', pt: 'opções', tet: 'opsaun' },
  landing: {
    welcome: { en: 'Welcome to Páteo', pt: 'Bem-vindo ao Páteo', tet: 'Bem-vindo ao Páteo' },
    promoHeading: { en: "This Week's Specials", pt: 'Especiais da Semana', tet: "Espesiál Semana Ne'e" },
    promoSubheading: {
      en: 'Fresh picks from our team, updated every week.',
      pt: 'Escolhas frescas da nossa equipa, atualizadas todas as semanas.',
      tet: "Eskolla foun husi ami-nia ekipa, atualiza kada semana."
    },
    viewMenu: { en: 'View Menu', pt: 'Ver Menu', tet: 'Haree Menu' },
    followFacebook: { en: 'Follow us on Facebook', pt: 'Siga-nos no Facebook', tet: 'Tuir ami iha Facebook' }
  }
};
