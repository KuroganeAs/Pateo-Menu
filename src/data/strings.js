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
  optionsLabel: { en: 'options', pt: 'opções', tet: 'opsaun' }
};
