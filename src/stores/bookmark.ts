import type { RecordModel, RecordSubscription } from 'pocketbase'

import { acceptHMRUpdate, defineStore } from 'pinia'

import type { Bookmark, BookmarkSubscriptionOptions } from '~/services/bookmark.service'

import {
	createBookmark,
	deleteBookmark,
	getAllBookmarks,
	getBookmark,
	subscribeToAllBookmarks,
	subscribeToBookmark,

	unsubscribeFromAllBookmarks,
	updateBookmark,
} from '~/services/bookmark.service'

export const useBookmarkStore = defineStore('bookmark', () => {
	const pb = usePb()

	// State
	const bookmarks = ref<RecordModel[]>([])
	const currentBookmark = ref<RecordModel | null>(null)
	const isLoading = ref(false)
	const error = ref<Error | null>(null)
	const isSubscribed = ref(false)

	let unsubscribeFn: (() => void) | null = null

	// Getters
	const bookmarksCount = computed(() => bookmarks.value.length)
	const bookmarkById = computed(() => (id: string) => bookmarks.value.find(b => b.id === id))
	const sortedBookmarks = computed(() => [...bookmarks.value].sort((a, b) => {
		// Sort by created date (newest first)
		return new Date(b.created).getTime() - new Date(a.created).getTime()
	}))

	// Filter bookmarks by tag
	const bookmarksByTag = computed(() => (tagId: string) => {
		return bookmarks.value.filter(b => b.tag?.includes(tagId))
	})

	// Get current user ID
	const currentUserId = computed(() => pb.authStore.record?.id || '')

	/**
	 * Fetch all bookmarks
	 */
	async function fetchAll(filter?: string, sort = '-created', expand = 'tag') {
		isLoading.value = true
		error.value = null
		try {
			bookmarks.value = await getAllBookmarks(filter, sort, expand)
		}
		catch (e) {
			error.value = e as Error
			console.error('Error fetching bookmarks:', e)
			throw e
		}
		finally {
			isLoading.value = false
		}
	}

	/**
	 * Fetch a single bookmark by ID
	 */
	async function fetchOne(id: string, expand = 'tag') {
		isLoading.value = true
		error.value = null
		try {
			currentBookmark.value = await getBookmark(id, expand)
			return currentBookmark.value
		}
		catch (e) {
			error.value = e as Error
			console.error('Error fetching bookmark:', e)
			throw e
		}
		finally {
			isLoading.value = false
		}
	}

	/**
	 * Create a new bookmark
	 */
	async function create(data: Omit<Bookmark, 'id' | 'created' | 'updated'>) {
		isLoading.value = true
		error.value = null
		try {
			const newBookmark = await createBookmark(data)
			// Only add if not subscribed (subscription will handle it)
			if (!isSubscribed.value) {
				bookmarks.value.unshift(newBookmark) // Add to beginning (newest first)
			}
			return newBookmark
		}
		catch (e) {
			error.value = e as Error
			console.error('Error creating bookmark:', e)
			throw e
		}
		finally {
			isLoading.value = false
		}
	}

	/**
	 * Update an existing bookmark
	 */
	async function update(id: string, data: Partial<Omit<Bookmark, 'id' | 'created' | 'updated'>>) {
		isLoading.value = true
		error.value = null
		try {
			const updatedBookmark = await updateBookmark(id, data)

			// Only update if not subscribed (subscription will handle it)
			if (!isSubscribed.value) {
				const index = bookmarks.value.findIndex(b => b.id === id)
				if (index !== -1) {
					bookmarks.value[index] = updatedBookmark
				}
				if (currentBookmark.value?.id === id) {
					currentBookmark.value = updatedBookmark
				}
			}

			return updatedBookmark
		}
		catch (e) {
			error.value = e as Error
			console.error('Error updating bookmark:', e)
			throw e
		}
		finally {
			isLoading.value = false
		}
	}

	/**
	 * Delete a bookmark
	 */
	async function remove(id: string) {
		isLoading.value = true
		error.value = null
		try {
			await deleteBookmark(id)

			// Only remove if not subscribed (subscription will handle it)
			if (!isSubscribed.value) {
				bookmarks.value = bookmarks.value.filter(b => b.id !== id)
				if (currentBookmark.value?.id === id) {
					currentBookmark.value = null
				}
			}
		}
		catch (e) {
			error.value = e as Error
			console.error('Error deleting bookmark:', e)
			throw e
		}
		finally {
			isLoading.value = false
		}
	}

	/**
	 * Handle subscription events
	 */
	function handleSubscription(data: RecordSubscription<RecordModel>) {
		console.log('Bookmark subscription event:', data.action, data.record)

		switch (data.action) {
			case 'create': {
				// Check if bookmark already exists
				const exists = bookmarks.value.some(b => b.id === data.record.id)
				if (!exists) {
					bookmarks.value.unshift(data.record) // Add to beginning
				}
				break
			}
			case 'update': {
				const index = bookmarks.value.findIndex(b => b.id === data.record.id)
				if (index !== -1) {
					bookmarks.value[index] = data.record
				}
				if (currentBookmark.value?.id === data.record.id) {
					currentBookmark.value = data.record
				}
				break
			}
			case 'delete': {
				bookmarks.value = bookmarks.value.filter(b => b.id !== data.record.id)
				if (currentBookmark.value?.id === data.record.id) {
					currentBookmark.value = null
				}
				break
			}
		}
	}

	/**
	 * Subscribe to all bookmarks changes
	 */
	async function subscribe(options?: BookmarkSubscriptionOptions) {
		if (isSubscribed.value) {
			console.warn('Already subscribed to bookmarks')
			return
		}

		try {
			unsubscribeFn = await subscribeToAllBookmarks(handleSubscription, {
				...options,
				expand: options?.expand || 'tag', // Always expand tags by default
			})
			isSubscribed.value = true
			console.log('Subscribed to all bookmarks')
		}
		catch (e) {
			console.error('Error subscribing to bookmarks:', e)
			error.value = e as Error
			throw e
		}
	}

	/**
	 * Subscribe to a specific bookmark
	 */
	async function subscribeOne(id: string, options?: BookmarkSubscriptionOptions) {
		try {
			unsubscribeFn = await subscribeToBookmark(id, handleSubscription, {
				...options,
				expand: options?.expand || 'tag',
			})
			isSubscribed.value = true
			console.log('Subscribed to bookmark:', id)
		}
		catch (e) {
			console.error('Error subscribing to bookmark:', e)
			error.value = e as Error
			throw e
		}
	}

	/**
	 * Unsubscribe from all bookmark updates
	 */
	function unsubscribe() {
		if (unsubscribeFn) {
			unsubscribeFn()
			unsubscribeFn = null
			isSubscribed.value = false
			console.log('Unsubscribed from bookmarks')
		}
	}

	/**
	 * Clear all bookmarks from store
	 */
	function clear() {
		bookmarks.value = []
		currentBookmark.value = null
		error.value = null
	}

	/**
	 * Reset store to initial state
	 */
	function $reset() {
		unsubscribe()
		clear()
		isLoading.value = false
	}

	return {
		// State
		bookmarks: readonly(bookmarks),
		currentBookmark: readonly(currentBookmark),
		isLoading: readonly(isLoading),
		error: readonly(error),
		isSubscribed: readonly(isSubscribed),

		// Getters
		bookmarksCount,
		bookmarkById,
		sortedBookmarks,
		bookmarksByTag,
		currentUserId,

		// Actions
		fetchAll,
		fetchOne,
		create,
		update,
		remove,
		subscribe,
		subscribeOne,
		unsubscribe,
		clear,
		$reset,
	}
})

/**
 * HMR (Hot Module Replacement)
 * https://pinia.vuejs.org/cookbook/hot-module-replacement.html
 */
if (import.meta.hot)
	import.meta.hot.accept(acceptHMRUpdate(useBookmarkStore, import.meta.hot))
