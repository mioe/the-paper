import type { RecordModel, RecordSubscription } from 'pocketbase'

export interface Bookmark {
	id?: string
	href: string
	title: string
	description?: string
	favicon?: string
	preview?: string
	tag?: string[] // Array of tag IDs
	creator: string
	created?: string
	updated?: string
}

export interface BookmarkSubscriptionOptions {
	filter?: string
	expand?: string
	headers?: Record<string, string>
}

const COLLECTION_NAME = 'bookmark'

/**
 * Create a new bookmark
 */
export async function createBookmark(data: Omit<Bookmark, 'id' | 'created' | 'updated'>) {
	const pb = usePb()
	return await pb.collection(COLLECTION_NAME).create(data)
}

/**
 * Get a bookmark by ID
 */
export async function getBookmark(id: string, expand?: string) {
	const pb = usePb()
	return await pb.collection(COLLECTION_NAME).getOne(id, { expand })
}

/**
 * Get all bookmarks with optional filtering and pagination
 */
export async function getBookmarks(filter?: string, sort?: string, page = 1, perPage = 50, expand?: string) {
	const pb = usePb()
	return await pb.collection(COLLECTION_NAME).getList(page, perPage, {
		filter,
		sort,
		expand,
	})
}

/**
 * Get all bookmarks (full list without pagination)
 */
export async function getAllBookmarks(filter?: string, sort?: string, expand?: string) {
	const pb = usePb()
	return await pb.collection(COLLECTION_NAME).getFullList({
		filter,
		sort,
		expand,
	})
}

/**
 * Update a bookmark by ID
 */
export async function updateBookmark(
	id: string,
	data: Partial<Omit<Bookmark, 'id' | 'created' | 'updated'>>,
) {
	const pb = usePb()
	return await pb.collection(COLLECTION_NAME).update(id, data)
}

/**
 * Delete a bookmark by ID
 */
export async function deleteBookmark(id: string) {
	const pb = usePb()
	return await pb.collection(COLLECTION_NAME).delete(id)
}

/**
 * Subscribe to changes in all bookmark records
 */
export async function subscribeToAllBookmarks(
	callback: (data: RecordSubscription<RecordModel>) => void,
	options?: BookmarkSubscriptionOptions,
) {
	const pb = usePb()
	await pb.collection(COLLECTION_NAME).subscribe('*', callback, options)
	return () => unsubscribeFromBookmarks('*')
}

/**
 * Subscribe to changes in a specific bookmark record
 */
export async function subscribeToBookmark(
	id: string,
	callback: (data: RecordSubscription<RecordModel>) => void,
	options?: BookmarkSubscriptionOptions,
) {
	const pb = usePb()
	await pb.collection(COLLECTION_NAME).subscribe(id, callback, options)
	return () => unsubscribeFromBookmarks(id)
}

/**
 * Unsubscribe from specific bookmark record or topic
 */
export function unsubscribeFromBookmarks(recordIdOrTopic?: string) {
	const pb = usePb()
	pb.collection(COLLECTION_NAME).unsubscribe(recordIdOrTopic)
}

/**
 * Unsubscribe from all bookmark subscriptions
 */
export function unsubscribeFromAllBookmarks() {
	const pb = usePb()
	pb.collection(COLLECTION_NAME).unsubscribe()
}
