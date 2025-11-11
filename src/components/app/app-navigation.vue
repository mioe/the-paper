<script setup lang="ts">
const pb = usePb()
const router = useRouter()

const isAuthenticated = computed(() => pb.authStore.isValid)

async function handleSignOut() {
	pb.authStore.clear()
	await router.push('/sign-in')
}
</script>

<template>
	<nav v-if="isAuthenticated" class="app-navigation">
		<div class="nav-container">
			<div class="nav-brand">
				<h2>📚 the-paper</h2>
			</div>

			<div class="nav-links">
				<RouterLink to="/" class="nav-link">
					Bookmarks
				</RouterLink>
				<RouterLink to="/tags" class="nav-link">
					Tags
				</RouterLink>
			</div>

			<button class="btn-signout" @click="handleSignOut">
				Sign Out
			</button>
		</div>
	</nav>
</template>

<style scoped>
.app-navigation {
	background-color: #fff;
	border-bottom: 1px solid #e0e0e0;
	position: sticky;
	top: 0;
	z-index: 100;
}

.nav-container {
	max-width: 1200px;
	margin: 0 auto;
	padding: 16px 24px;
	display: flex;
	align-items: center;
	gap: 32px;
}

.nav-brand h2 {
	margin: 0;
	font-size: 1.25em;
	color: #333;
}

.nav-links {
	display: flex;
	gap: 24px;
	flex: 1;
}

.nav-link {
	color: #666;
	text-decoration: none;
	font-weight: 500;
	padding: 8px 12px;
	border-radius: 4px;
	transition: all 0.2s;
}

.nav-link:hover {
	color: #007bff;
	background-color: #f0f0f0;
}

.nav-link.router-link-active {
	color: #007bff;
	background-color: #e7f3ff;
}

.btn-signout {
	padding: 8px 16px;
	background-color: #dc3545;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	font-weight: 500;
	transition: background-color 0.2s;
}

.btn-signout:hover {
	background-color: #c82333;
}

/* Mobile responsive */
@media (max-width: 768px) {
	.nav-container {
		flex-wrap: wrap;
		gap: 16px;
	}

	.nav-brand {
		width: 100%;
	}

	.nav-links {
		flex: auto;
	}

	.btn-signout {
		width: 100%;
	}
}

/* Dark mode support */
:root.dark .app-navigation {
	background-color: #1a1a1a;
	border-bottom-color: #444;
}

:root.dark .nav-brand h2 {
	color: #e0e0e0;
}

:root.dark .nav-link {
	color: #b0b0b0;
}

:root.dark .nav-link:hover {
	color: #5ba3ff;
	background-color: #2d2d2d;
}

:root.dark .nav-link.router-link-active {
	color: #5ba3ff;
	background-color: #1a3a52;
}
</style>
