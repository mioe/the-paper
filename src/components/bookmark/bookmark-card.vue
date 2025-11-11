<script setup lang="ts">
import type { RecordModel } from 'pocketbase'
import { storeToRefs } from 'pinia'

import { useBookmarkStore } from '~/stores/bookmark'

interface Props {
	bookmark: RecordModel
}

const props = defineProps<Props>()

const emit = defineEmits<{
	deleted: []
	updated: []
}>()

const bookmarkStore = useBookmarkStore()
const { currentUserId } = storeToRefs(bookmarkStore)

const isEditing = ref(false)
const isDeleting = ref(false)
const editFormData = ref({
	title: '',
	description: '',
	tag: [] as string[],
})

// Check if current user is the creator
const isOwner = computed(() => {
	return currentUserId.value === props.bookmark.creator
})

/**
 * Format date to readable string
 */
function formatDate(date: string) {
	return new Date(date).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

/**
 * Get domain from URL
 */
function getDomain(url: string) {
	try {
		return new URL(url).hostname
	}
	catch {
		return url
	}
}

/**
 * Start editing mode
 */
function startEdit() {
	editFormData.value = {
		title: props.bookmark.title,
		description: props.bookmark.description || '',
		tag: props.bookmark.tag || [],
	}
	isEditing.value = true
}

/**
 * Save edits
 */
async function handleUpdate() {
	if (!editFormData.value.title.trim())
		return

	try {
		await bookmarkStore.update(props.bookmark.id, {
			title: editFormData.value.title.trim(),
			description: editFormData.value.description.trim() || undefined,
			tag: editFormData.value.tag.length > 0 ? editFormData.value.tag : undefined,
		})
		isEditing.value = false
		emit('updated')
	}
	catch (e) {
		console.error('Failed to update bookmark:', e)
	}
}

/**
 * Cancel editing
 */
function cancelEdit() {
	isEditing.value = false
}

/**
 * Delete bookmark
 */
async function handleDelete() {
	// eslint-disable-next-line no-alert
	if (!confirm('Are you sure you want to delete this bookmark?'))
		return

	isDeleting.value = true
	try {
		await bookmarkStore.remove(props.bookmark.id)
		emit('deleted')
	}
	catch (e) {
		console.error('Failed to delete bookmark:', e)
		isDeleting.value = false
	}
}
</script>

<template>
	<div class="bookmark-card" :class="{ deleting: isDeleting }">
		<!-- Edit mode -->
		<template v-if="isEditing">
			<div class="edit-form">
				<input
					v-model="editFormData.title"
					type="text"
					placeholder="Title"
					maxlength="255"
					@keyup.enter="handleUpdate"
				/>
				<textarea
					v-model="editFormData.description"
					placeholder="Description"
					rows="2"
				/>
				<div class="edit-actions">
					<button class="btn-save" @click="handleUpdate">
						Save
					</button>
					<button class="btn-cancel" @click="cancelEdit">
						Cancel
					</button>
				</div>
			</div>
		</template>

		<!-- View mode -->
		<template v-else>
			<div class="bookmark-header">
				<a
					:href="bookmark.href"
					target="_blank"
					rel="noopener noreferrer"
					class="bookmark-title"
				>
					{{ bookmark.title }}
				</a>
				<span class="bookmark-domain">{{ getDomain(bookmark.href) }}</span>
			</div>

			<a
				:href="bookmark.href"
				target="_blank"
				rel="noopener noreferrer"
				class="bookmark-url"
			>
				{{ bookmark.href }}
			</a>

			<p v-if="bookmark.description" class="bookmark-description">
				{{ bookmark.description }}
			</p>

			<!-- Tags -->
			<div v-if="bookmark.expand?.tag && bookmark.expand.tag.length > 0" class="bookmark-tags">
				<span
					v-for="tag in bookmark.expand.tag"
					:key="tag.id"
					class="tag"
				>
					{{ tag.name }}
				</span>
			</div>

			<div class="bookmark-footer">
				<span class="bookmark-date">{{ formatDate(bookmark.created) }}</span>

				<!-- Actions (only for owner) -->
				<div v-if="isOwner" class="bookmark-actions">
					<button class="btn-edit" @click="startEdit">
						Edit
					</button>
					<button class="btn-delete" :disabled="isDeleting" @click="handleDelete">
						{{ isDeleting ? 'Deleting...' : 'Delete' }}
					</button>
				</div>
			</div>
		</template>
	</div>
</template>

<style scoped>
.bookmark-card {
	background-color: #fff;
	border: 1px solid #e0e0e0;
	border-radius: 8px;
	padding: 16px;
	transition: all 0.2s;
}

.bookmark-card:hover {
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.bookmark-card.deleting {
	opacity: 0.5;
	pointer-events: none;
}

.bookmark-header {
	display: flex;
	align-items: baseline;
	gap: 8px;
	margin-bottom: 8px;
}

.bookmark-title {
	font-size: 1.1em;
	font-weight: 600;
	color: #007bff;
	text-decoration: none;
	word-break: break-word;
}

.bookmark-title:hover {
	text-decoration: underline;
}

.bookmark-domain {
	font-size: 0.8em;
	color: #999;
}

.bookmark-url {
	display: block;
	font-size: 0.85em;
	color: #666;
	text-decoration: none;
	margin-bottom: 8px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.bookmark-url:hover {
	text-decoration: underline;
}

.bookmark-description {
	margin: 12px 0;
	color: #555;
	line-height: 1.5;
}

.bookmark-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	margin-bottom: 12px;
}

.tag {
	padding: 4px 10px;
	background-color: #e7f3ff;
	color: #007bff;
	border-radius: 12px;
	font-size: 0.8em;
	font-weight: 500;
}

.bookmark-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 12px;
	padding-top: 12px;
	border-top: 1px solid #f0f0f0;
}

.bookmark-date {
	font-size: 0.8em;
	color: #999;
}

.bookmark-actions {
	display: flex;
	gap: 8px;
}

.btn-edit,
.btn-delete,
.btn-save,
.btn-cancel {
	padding: 6px 12px;
	border: none;
	border-radius: 4px;
	font-size: 0.85em;
	cursor: pointer;
	transition: all 0.2s;
}

.btn-edit {
	background-color: #f0f0f0;
	color: #555;
}

.btn-edit:hover {
	background-color: #e0e0e0;
}

.btn-delete {
	background-color: #dc3545;
	color: white;
}

.btn-delete:hover:not(:disabled) {
	background-color: #c82333;
}

.btn-delete:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.edit-form {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.edit-form input,
.edit-form textarea {
	padding: 8px 12px;
	border: 1px solid #ddd;
	border-radius: 4px;
	font-size: 14px;
	font-family: inherit;
}

.edit-form input:focus,
.edit-form textarea:focus {
	outline: none;
	border-color: #007bff;
}

.edit-actions {
	display: flex;
	gap: 8px;
}

.btn-save {
	background-color: #28a745;
	color: white;
}

.btn-save:hover {
	background-color: #218838;
}

.btn-cancel {
	background-color: #6c757d;
	color: white;
}

.btn-cancel:hover {
	background-color: #5a6268;
}

/* Dark mode support */
:root.dark .bookmark-card {
	background-color: #2d2d2d;
	border-color: #444;
}

:root.dark .bookmark-title {
	color: #5ba3ff;
}

:root.dark .bookmark-url {
	color: #999;
}

:root.dark .bookmark-description {
	color: #b0b0b0;
}

:root.dark .tag {
	background-color: #1a3a52;
	color: #5ba3ff;
}

:root.dark .bookmark-footer {
	border-top-color: #444;
}

:root.dark .bookmark-date {
	color: #777;
}

:root.dark .btn-edit {
	background-color: #3d3d3d;
	color: #b0b0b0;
}

:root.dark .btn-edit:hover {
	background-color: #4d4d4d;
}

:root.dark .edit-form input,
:root.dark .edit-form textarea {
	background-color: #1a1a1a;
	border-color: #444;
	color: #e0e0e0;
}
</style>
