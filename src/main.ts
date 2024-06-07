import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

let app = createApp(App)

// Create a pinia instance and install as a plugin to the app
let pinia = createPinia()
app.use(pinia)

app.mount('#app')