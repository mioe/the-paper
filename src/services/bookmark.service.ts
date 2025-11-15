import type { RecordModel, RecordSubscription } from 'pocketbase'

export interface Bookmark {
	id?: string
	url: string
	title: string
	description?: string
	favicon?: string
	preview_image?: string
	creator: string
	created?: string
	updated?: string
}

export interface BookmarkMetadata {
	title: string | null
	description: string | null
	favicons: string[]
	preview_images: string[]
	url: string
}

const COLLECTION = 'bookmark'

/**
 * Fetch metadata from Axum API
 */
export async function fetchUrlMetadata(url: string): Promise<BookmarkMetadata> {
	const apiUrl = `http://localhost:8091/api/metadata?url=${encodeURIComponent(url)}`

	try {
		const response = await fetch(apiUrl)
		if (!response.ok) {
			throw new Error(`Failed to fetch metadata: ${response.statusText}`)
		}
		return await response.json()
	}
	catch (error) {
		console.error('Error fetching metadata:', error)
		throw error
	}
}

/**
 * Get all bookmarks
 */
export async function getAllBookmarks(filter?: string, sort?: string): Promise<RecordModel[]> {
	const pb = usePb()
	return await pb.collection(COLLECTION).getFullList({
		filter: filter || '',
		sort: sort || '-created',
	})
}

/**
 * Get a single bookmark by ID
 */
export async function getBookmark(id: string): Promise<RecordModel> {
	const pb = usePb()
	return await pb.collection(COLLECTION).getOne(id)
}

/**
 * Create a new bookmark
 */
export async function createBookmark(data: Omit<Bookmark, 'id' | 'created' | 'updated'>): Promise<RecordModel> {
	const pb = usePb()
	return await pb.collection(COLLECTION).create(data)
}

/**
 * Update an existing bookmark
 */
export async function updateBookmark(
	id: string,
	data: Partial<Omit<Bookmark, 'id' | 'created' | 'updated'>>,
): Promise<RecordModel> {
	const pb = usePb()
	return await pb.collection(COLLECTION).update(id, data)
}

/**
 * Delete a bookmark
 */
export async function deleteBookmark(id: string): Promise<boolean> {
	const pb = usePb()
	return await pb.collection(COLLECTION).delete(id)
}

export interface BookmarkSubscriptionOptions {
	filter?: string
	expand?: string
	headers?: Record<string, string>
}

/**
 * Subscribe to all bookmarks changes
 */
export async function subscribeToAllBookmarks(
	callback: (data: RecordSubscription<RecordModel>) => void,
	options?: BookmarkSubscriptionOptions,
): Promise<() => void> {
	const pb = usePb()
	await pb.collection(COLLECTION).subscribe('*', callback, options)
	return () => unsubscribeFromBookmarks('*')
}

/**
 * Subscribe to a specific bookmark
 */
export async function subscribeToBookmark(
	id: string,
	callback: (data: RecordSubscription<RecordModel>) => void,
	options?: BookmarkSubscriptionOptions,
): Promise<() => void> {
	const pb = usePb()
	await pb.collection(COLLECTION).subscribe(id, callback, options)
	return () => unsubscribeFromBookmarks(id)
}

/**
 * Unsubscribe from bookmarks
 */
export function unsubscribeFromBookmarks(id: string): void {
	const pb = usePb()
	pb.collection(COLLECTION).unsubscribe(id)
}

/**
 * Unsubscribe from all bookmarks
 */
export function unsubscribeFromAllBookmarks(): void {
	const pb = usePb()
	pb.collection(COLLECTION).unsubscribe()
}
