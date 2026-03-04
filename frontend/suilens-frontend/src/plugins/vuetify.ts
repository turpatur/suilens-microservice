import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

// settings.scss is loaded via vite.config.ts as a global SASS preprocessor
// option so Vuetify's own SASS can @use it. See vite.config.ts:
//   css.preprocessorOptions.scss.additionalData = "@use '@/styles/settings.scss';"

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1565C0',
          secondary: '#009fbd',
        },
      },
      dark: {
        colors: {
          primary: '#a7e0ff',
          secondary: '#10e3fb',
        },
      },
    },
  },
});