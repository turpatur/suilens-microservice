/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Types
import type { App } from 'vue'

// Plugins
import vuetify from './vuetify'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'

export function registerPlugins (app: App) {
  app.use(vuetify)
  // install query plugin so hooks work
  app.use(VueQueryPlugin)
  // pinia store system
  app.use(createPinia())
}
