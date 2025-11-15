<script setup lang="ts">
import { storeToRefs } from 'pinia'

import BookmarkAddDialog from '~/components/bookmark/bookmark-add-dialog.vue'
import BookmarkCard from '~/components/bookmark/bookmark-card.vue'
import { useBookmarkStore } from '~/stores/bookmark'

const bookmarkStore = useBookmarkStore()
const { bookmarks, isLoading, error } = storeToRefs(bookmarkStore)

// Dialog state
const showAddDialog = ref(false)

// Load bookmarks on mount
onMounted(async () => {
	try {
		await bookmarkStore.fetchAll()
		await bookmarkStore.subscribe()
	}
	catch (error) {
		console.error('Error loading bookmarks:', error)
	}
})

// Cleanup on unmount
onUnmounted(() => {
	bookmarkStore.unsubscribe()
})

// Handle bookmark created
function handleBookmarkCreated(id: string) {
	console.log('Bookmark created:', id)
	showAddDialog.value = false
}

// Handle delete bookmark
async function handleDeleteBookmark(id: string) {
	try {
		await bookmarkStore.remove(id)
	}
	catch (error) {
		console.error('Error deleting bookmark:', error)
		alert('Failed to delete bookmark')
	}
}

// Handle edit bookmark (TODO: implement edit functionality)
function handleEditBookmark(id: string) {
	console.log('Edit bookmark:', id)
	// TODO: Implement edit dialog
	alert('Edit functionality coming soon!')
}
</script>

<template>
	<div class="body-primary p-6 min-h-screen">
		<div class="mx-auto max-w-7xl">
			<!-- Header -->
			<div class="mb-8 flex items-center justify-between">
				<div>
					<h1 class="text-3xl text-gray-900 font-bold dark:text-white">
						Bookmarks
					</h1>
					<p class="text-gray-600 mt-1 dark:text-gray-400">
						{{ bookmarks.length }} bookmark{{ bookmarks.length !== 1 ? 's' : '' }}
					</p>
				</div>

				<!-- Add Button -->
				<button
					class="text-white px-6 py-3 rounded-lg bg-blue-600 flex gap-2 shadow-md transition-shadow items-center hover:bg-blue-700 hover:shadow-lg"
					@click="showAddDialog = true"
				>
					<span class="text-2xl font-bold">+</span>
					<span>Add Bookmark</span>
				</button>
			</div>

			<!-- Loading State -->
			<div v-if="isLoading && bookmarks.length === 0" class="py-12 text-center">
				<div class="border-b-2 border-blue-600 rounded-full h-12 w-12 inline-block animate-spin" />
				<p class="text-gray-600 mt-4 dark:text-gray-400">
					Loading bookmarks...
				</p>
			</div>

			<!-- Error State -->
			<div v-else-if="error" class="py-12 text-center">
				<p class="text-red-600 dark:text-red-400">
					{{ error.message }}
				</p>
			</div>

			<!-- Empty State -->
			<div v-else-if="bookmarks.length === 0" class="py-12 text-center">
				<div class="text-6xl mb-4">
					📚
				</div>
				<h2 class="text-2xl text-gray-900 font-semibold mb-2 dark:text-white">
					No bookmarks yet
				</h2>
				<p class="text-gray-600 mb-6 dark:text-gray-400">
					Start adding your favorite links!
				</p>
				<button
					class="text-white px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700"
					@click="showAddDialog = true"
				>
					Add Your First Bookmark
				</button>
			</div>

			<!-- Bookmarks Grid -->
			<div v-else class="gap-6 grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2">
				<BookmarkCard
					v-for="bookmark in bookmarks"
					:key="bookmark.id"
					:bookmark="bookmark"
					@delete="handleDeleteBookmark"
					@edit="handleEditBookmark"
				/>
			</div>
		</div>

		<!-- Add Bookmark Dialog -->
		<BookmarkAddDialog
			:open="showAddDialog"
			@close="showAddDialog = false"
			@created="handleBookmarkCreated"
		/>
	</div>
</template>
