import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import '@/styles/base/global.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Dark } from 'quasar'

import App from './App.vue'
import router from './router/index.js'
import { i18n } from './plugins/i18n'
import { useAuthStore } from '@/stores/auth.store'
import { getStoredDarkMode } from '@/composables/useTheme'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(i18n)
app.use(Quasar, {
  plugins: { Dark },
  config: { dark: getStoredDarkMode() },
})

const authStore = useAuthStore(pinia)

authStore.restoreSession().finally(() => {
  app.use(router)
  app.mount('#app')
})
