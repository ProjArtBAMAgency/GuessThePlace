import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './css/style.css'
import { store } from './store/store'

const app = createApp(App)

app.use(router).use(store).mount('#app')

if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/serviceWorker.js').catch((err) => {
			console.error('Service worker registration failed:', err)
		})
	})
}