import type { RecordModel, RecordSubscription } from 'pocketbase'

import { acceptHMRUpdate, defineStore } from 'pinia'

import type { Tag, TagSubscriptionOptions } from '~/services/tag.service'

import {
	createTag,
	deleteTag,
	getAllTags,
	getTag,
	subscribeToAllTags,
	subscribeToTag,

	unsubscribeFromAllTags,
	updateTag,
} from '~/services/tag.service'

export const useTagStore = defineStore('tag', () => {
	const pb = usePb()

	// State
	const tags = ref<RecordModel[]>([])
	const currentTag = ref<RecordModel | null>(null)
	const isLoading = ref(false)
	const error = ref<Error | null>(null)
	const isSubscribed = ref(false)

	let unsubscribeFn: (() => void) | null = null

	// Getters
	const tagsCount = computed(() => tags.value.length)
	const tagById = computed(() => (id: string) => tags.value.find(t => t.id === id))
	const sortedTags = computed(() => [...tags.value].sort((a, b) => a.name.localeCompare(b.name)))

	// Get current user ID
	const currentUserId = computed(() => pb.authStore.record?.id || '')

	/**
	 * Fetch all tags
	 */
	async function fetchAll(filter?: string, sort?: string) {
		isLoading.value = true
		error.value = null
		try {
			tags.value = await getAllTags(filter, sort)
		}
		catch (e) {
			error.value = e as Error
			console.error('Error fetching tags:', e)
			throw e
		}
		finally {
			isLoading.value = false
		}
	}

	/**
	 * Fetch a single tag by ID
	 */
	async function fetchOne(id: string) {
		isLoading.value = true
		error.value = null
		try {
			currentTag.value = await getTag(id)
			return currentTag.value
		}
		catch (e) {
			error.value = e as Error
			console.error('Error fetching tag:', e)
			throw e
		}
		finally {
			isLoading.value = false
		}
	}

	/**
	 * Create a new tag
	 */
	async function create(data: Omit<Tag, 'id' | 'created' | 'updated'>) {
		isLoading.value = true
		error.value = null
		try {
			const newTag = await createTag(data)
			// Only add if not subscribed (subscription will handle it)
			if (!isSubscribed.value) {
				tags.value.push(newTag)
			}
			return newTag
		}
		catch (e) {
			error.value = e as Error
			console.error('Error creating tag:', e)
			throw e
		}
		finally {
			isLoading.value = false
		}
	}

	/**
	 * Update an existing tag
	 */
	async function update(id: string, data: Partial<Omit<Tag, 'id' | 'created' | 'updated'>>) {
		isLoading.value = true
		error.value = null
		try {
			const updatedTag = await updateTag(id, data)

			// Only update if not subscribed (subscription will handle it)
			if (!isSubscribed.value) {
				const index = tags.value.findIndex(t => t.id === id)
				if (index !== -1) {
					tags.value[index] = updatedTag
				}
				if (currentTag.value?.id === id) {
					currentTag.value = updatedTag
				}
			}

			return updatedTag
		}
		catch (e) {
			error.value = e as Error
			console.error('Error updating tag:', e)
			throw e
		}
		finally {
			isLoading.value = false
		}
	}

	/**
	 * Delete a tag
	 */
	async function remove(id: string) {
		isLoading.value = true
		error.value = null
		try {
			await deleteTag(id)

			// Only remove if not subscribed (subscription will handle it)
			if (!isSubscribed.value) {
				tags.value = tags.value.filter(t => t.id !== id)
				if (currentTag.value?.id === id) {
					currentTag.value = null
				}
			}
		}
		catch (e) {
			error.value = e as Error
			console.error('Error deleting tag:', e)
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
		console.log('Tag subscription event:', data.action, data.record)

		switch (data.action) {
			case 'create': {
				// Check if tag already exists
				const exists = tags.value.some(t => t.id === data.record.id)
				if (!exists) {
					tags.value.push(data.record)
				}
				break
			}
			case 'update': {
				const index = tags.value.findIndex(t => t.id === data.record.id)
				if (index !== -1) {
					tags.value[index] = data.record
				}
				if (currentTag.value?.id === data.record.id) {
					currentTag.value = data.record
				}
				break
			}
			case 'delete': {
				tags.value = tags.value.filter(t => t.id !== data.record.id)
				if (currentTag.value?.id === data.record.id) {
					currentTag.value = null
				}
				break
			}
		}
	}

	/**
	 * Subscribe to all tags changes
	 */
	async function subscribe(options?: TagSubscriptionOptions) {
		if (isSubscribed.value) {
			console.warn('Already subscribed to tags')
			return
		}

		try {
			unsubscribeFn = await subscribeToAllTags(handleSubscription, options)
			isSubscribed.value = true
			console.log('Subscribed to all tags')
		}
		catch (e) {
			console.error('Error subscribing to tags:', e)
			error.value = e as Error
			throw e
		}
	}

	/**
	 * Subscribe to a specific tag
	 */
	async function subscribeOne(id: string, options?: TagSubscriptionOptions) {
		try {
			unsubscribeFn = await subscribeToTag(id, handleSubscription, options)
			isSubscribed.value = true
			console.log('Subscribed to tag:', id)
		}
		catch (e) {
			console.error('Error subscribing to tag:', e)
			error.value = e as Error
			throw e
		}
	}

	/**
	 * Unsubscribe from all tag updates
	 */
	function unsubscribe() {
		if (unsubscribeFn) {
			unsubscribeFn()
			unsubscribeFn = null
			isSubscribed.value = false
			console.log('Unsubscribed from tags')
		}
	}

	/**
	 * Clear all tags from store
	 */
	function clear() {
		tags.value = []
		currentTag.value = null
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
		tags: readonly(tags),
		currentTag: readonly(currentTag),
		isLoading: readonly(isLoading),
		error: readonly(error),
		isSubscribed: readonly(isSubscribed),

		// Getters
		tagsCount,
		tagById,
		sortedTags,
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
	import.meta.hot.accept(acceptHMRUpdate(useTagStore, import.meta.hot))
