const locales = [
  {
    locale: 'en',
    messages: import('./en'),
    loadData: import(`@formatjs/intl-relativetimeformat/dist/locale-data/en`),
  },
  {
    locale: 'pt-BR',
    messages: import('./pt-BR'),
    loadData: import(`@formatjs/intl-relativetimeformat/dist/locale-data/br`),
  },
]

export default locales
