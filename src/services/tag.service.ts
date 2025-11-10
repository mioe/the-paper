import type { RecordModel, RecordSubscription } from 'pocketbase'

export interface Tag {
	id?: string
	name: string
	creator: string
	created?: string
	updated?: string
}

export interface TagSubscriptionOptions {
	filter?: string
	expand?: string
	headers?: Record<string, string>
}

const COLLECTION_NAME = 'tag'

/**
 * Create a new tag
 */
export async function createTag(data: Omit<Tag, 'id' | 'created' | 'updated'>) {
	const pb = usePb()
	return await pb.collection(COLLECTION_NAME).create(data)
}

/**
 * Get a tag by ID
 */
export async function getTag(id: string) {
	const pb = usePb()
	return await pb.collection(COLLECTION_NAME).getOne(id)
}

/**
 * Get all tags with optional filtering and pagination
 */
export async function getTags(filter?: string, sort?: string, page = 1, perPage = 50) {
	const pb = usePb()
	return await pb.collection(COLLECTION_NAME).getList(page, perPage, {
		filter,
		sort,
	})
}

/**
 * Get all tags (full list without pagination)
 */
export async function getAllTags(filter?: string, sort?: string) {
	const pb = usePb()
	return await pb.collection(COLLECTION_NAME).getFullList({
		filter,
		sort,
	})
}

/**
 * Update a tag by ID
 */
export async function updateTag(
	id: string,
	data: Partial<Omit<Tag, 'id' | 'created' | 'updated'>>,
) {
	const pb = usePb()
	return await pb.collection(COLLECTION_NAME).update(id, data)
}

/**
 * Delete a tag by ID
 */
export async function deleteTag(id: string) {
	const pb = usePb()
	return await pb.collection(COLLECTION_NAME).delete(id)
}

/**
 * Subscribe to changes in all tag records
 */
export async function subscribeToAllTags(
	callback: (data: RecordSubscription<RecordModel>) => void,
	options?: TagSubscriptionOptions,
) {
	const pb = usePb()
	await pb.collection(COLLECTION_NAME).subscribe('*', callback, options)
	return () => unsubscribeFromTags('*')
}

/**
 * Subscribe to changes in a specific tag record
 */
export async function subscribeToTag(
	id: string,
	callback: (data: RecordSubscription<RecordModel>) => void,
	options?: TagSubscriptionOptions,
) {
	const pb = usePb()
	await pb.collection(COLLECTION_NAME).subscribe(id, callback, options)
	return () => unsubscribeFromTags(id)
}

/**
 * Unsubscribe from specific tag record or topic
 */
export function unsubscribeFromTags(recordIdOrTopic?: string) {
	const pb = usePb()
	pb.collection(COLLECTION_NAME).unsubscribe(recordIdOrTopic)
}

/**
 * Unsubscribe from all tag subscriptions
 */
export function unsubscribeFromAllTags() {
	const pb = usePb()
	pb.collection(COLLECTION_NAME).unsubscribe()
}
