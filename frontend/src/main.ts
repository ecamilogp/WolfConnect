import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import '@/styles/base/global.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Dark } from 'quasar'

import App from './App.vue'
import router from './router/index.js'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Quasar, {
  plugins: { Dark },
})

app.mount('#app')
