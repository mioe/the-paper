import { createRouter, createWebHistory } from 'vue-router'
import { handleHotUpdate, routes } from 'vue-router/auto-routes'

import ErrorPage from '~/error-page.vue'
import { authGuard } from '~/guards/auth.guard'

const router = createRouter({
	history: createWebHistory(),
	routes: [
		...routes,
		{ path: '/:pathMatch(.*)*', name: 'error-page', component: ErrorPage },
	],
	scrollBehavior(_to, _from, savedPosition) {
		if (savedPosition) {
			return savedPosition
		}
		else {
			return { top: 0 }
		}
	},
})

// Add authentication guard
router.beforeEach(authGuard)

export {
	router,
}

// This will update routes at runtime without reloading the page
if (import.meta.hot)
	handleHotUpdate(router)
