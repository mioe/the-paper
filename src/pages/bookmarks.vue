<script setup lang="ts">
import { storeToRefs } from 'pinia'

import BookmarkForm from '~/components/bookmark/bookmark-form.vue'
import BookmarkList from '~/components/bookmark/bookmark-list.vue'
import { useBookmarkStore } from '~/stores/bookmark'
import { useTagStore } from '~/stores/tag'

const bookmarkStore = useBookmarkStore()
const tagStore = useTagStore()
const { bookmarksCount } = storeToRefs(bookmarkStore)

const showForm = ref(false)

// Initialize: fetch bookmarks and tags, then subscribe
onMounted(async () => {
	try {
		// Fetch tags first (needed for form)
		await tagStore.fetchAll()
		// Fetch and subscribe to bookmarks
		await bookmarkStore.fetchAll()
		await bookmarkStore.subscribe()
	}
	catch (e) {
		console.error('Failed to initialize:', e)
	}
})

// Cleanup on unmount
onUnmounted(() => {
	bookmarkStore.unsubscribe()
})

/**
 * Handle bookmark created
 */
function handleBookmarkCreated() {
	showForm.value = false
}

/**
 * Refresh data
 */
async function handleRefresh() {
	await bookmarkStore.fetchAll()
}
</script>

<template>
	<div class="bookmarks-page">
		<div class="page-header">
			<div>
				<h1>My Bookmarks</h1>
				<p class="subtitle">
					Save and organize your favorite links
				</p>
			</div>
			<div class="header-actions">
				<button class="btn-refresh" @click="handleRefresh">
					Refresh
				</button>
				<button class="btn-add" @click="showForm = !showForm">
					{{ showForm ? 'Cancel' : '+ Add Bookmark' }}
				</button>
			</div>
		</div>

		<!-- Bookmark form (collapsible) -->
		<transition name="slide-down">
			<BookmarkForm
				v-if="showForm"
				@created="handleBookmarkCreated"
				@cancelled="showForm = false"
			/>
		</transition>

		<!-- Stats -->
		<div class="stats">
			<div class="stat-card">
				<div class="stat-value">{{ bookmarksCount }}</div>
				<div class="stat-label">Total Bookmarks</div>
			</div>
		</div>

		<!-- Bookmarks list -->
		<BookmarkList />

		<!-- Real-time info -->
		<div class="info">
			<p>
				<strong>Real-time updates enabled!</strong>
				Changes will sync automatically across all your devices.
			</p>
		</div>
	</div>
</template>

<style scoped>
.bookmarks-page {
	max-width: 1200px;
	margin: 0 auto;
	padding: 32px 24px;
}

.page-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 32px;
	gap: 20px;
}

h1 {
	margin: 0 0 8px 0;
	font-size: 2em;
	color: #333;
}

.subtitle {
	margin: 0;
	color: #666;
	font-size: 1.1em;
}

.header-actions {
	display: flex;
	gap: 12px;
}

.btn-add,
.btn-refresh {
	padding: 10px 20px;
	border: none;
	border-radius: 6px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s;
}

.btn-add {
	background-color: #007bff;
	color: white;
}

.btn-add:hover {
	background-color: #0056b3;
}

.btn-refresh {
	background-color: #6c757d;
	color: white;
}

.btn-refresh:hover {
	background-color: #5a6268;
}

/* Slide down animation */
.slide-down-enter-active,
.slide-down-leave-active {
	transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
	transform: translateY(-20px);
	opacity: 0;
}

.stats {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 20px;
	margin-bottom: 32px;
}

.stat-card {
	background-color: #fff;
	border-radius: 8px;
	padding: 24px;
	text-align: center;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-value {
	font-size: 2.5em;
	font-weight: 700;
	color: #007bff;
	margin-bottom: 8px;
}

.stat-label {
	font-size: 0.9em;
	color: #666;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.info {
	background-color: #e7f3ff;
	padding: 16px 20px;
	border-radius: 8px;
	border-left: 4px solid #007bff;
	margin-top: 32px;
}

.info p {
	margin: 0;
	color: #004085;
}

.info strong {
	color: #007bff;
}

/* Mobile responsive */
@media (max-width: 768px) {
	.bookmarks-page {
		padding: 20px 16px;
	}

	.page-header {
		flex-direction: column;
	}

	h1 {
		font-size: 1.5em;
	}

	.header-actions {
		width: 100%;
	}

	.btn-add,
	.btn-refresh {
		flex: 1;
	}
}

/* Dark mode support */
:root.dark .bookmarks-page {
	color: #e0e0e0;
}

:root.dark h1 {
	color: #e0e0e0;
}

:root.dark .subtitle {
	color: #b0b0b0;
}

:root.dark .stat-card {
	background-color: #2d2d2d;
}

:root.dark .stat-label {
	color: #999;
}

:root.dark .info {
	background-color: #1a3a52;
	border-left-color: #5ba3ff;
}

:root.dark .info p {
	color: #b3d9ff;
}

:root.dark .info strong {
	color: #5ba3ff;
}
</style>
