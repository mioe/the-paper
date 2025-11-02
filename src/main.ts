import { createApp } from 'vue'

import App from './app-endpoint.vue'

import 'uno.css'

import './styles/fonts.css'
import './styles/main.css'
import { pinia } from './modules/pinia'
import { i18n } from './modules/vue-i18n'
import { router } from './modules/vue-router'

/**
 * init app
 */
createApp(App)
	.use(i18n)
	.use(pinia)
	.use(router)
	.mount('#app')
