// Style imports — order matters:
// 1. Declare CSS layer order before anything else
import '@/styles/layers.css';

// 2. Vuetify base styles (uses settings.scss internally via vuetify plugin)
import 'vuetify/styles';

// 3. Tailwind (theme + utilities, scoped to `tailwind` layer)
import '@/styles/tailwind.css';

// 4. Project overrides (vuetify-overrides layer, e.g. mono font fix)
import '@/styles/main.scss';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';

import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin);
app.use(vuetify);

app.mount('#app');