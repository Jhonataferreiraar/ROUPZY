export default function manifest() {
  return {
    name: 'Roupzy',
    short_name: 'Roupzy',
    description: 'Descubra o que vestir usando as roupas que você já tem.',
    start_url: '/',
    display: 'browser',
    background_color: '#f4f6fb',
    theme_color: '#3155ed',
    lang: 'pt-BR',
    icons: [{
      src: '/brand/favicon.svg',
      sizes: 'any',
      type: 'image/svg+xml'
    }]
  }
}
