import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './css/style.css'
import { store } from './store/store'

createApp(App).use(router).use(store).mount('#app')