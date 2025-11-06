import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

/**
 * Authentication guard - redirects unauthenticated users to sign-in page
 */
export function authGuard(
	to: RouteLocationNormalized,
	_from: RouteLocationNormalized,
	next: NavigationGuardNext,
) {
	const pb = usePb()

	// List of public routes that don't require authentication
	const publicRoutes = ['/sign-in']

	// Check if the route is public
	const isPublicRoute = publicRoutes.some(route => to.path.startsWith(route))

	// Check if user is authenticated
	const isAuthenticated = pb.authStore.isValid

	if (!isAuthenticated && !isPublicRoute) {
		// User is not authenticated and trying to access a protected route
		// Redirect to sign-in with the original destination
		next({
			path: '/sign-in',
			query: { redirect: to.fullPath },
		})
	}
	else if (isAuthenticated && to.path === '/sign-in') {
		// User is authenticated and trying to access sign-in page
		// Redirect to home or the redirect parameter
		const redirect = to.query.redirect as string
		next(redirect || '/')
	}
	else {
		// Allow navigation
		next()
	}
}
