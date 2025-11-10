<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useTagStore } from '~/stores/tag'

const tagStore = useTagStore()
const { tags, isLoading, error, currentUserId } = storeToRefs(tagStore)

// Form data
const newTagName = ref('')
const editingTag = ref<{ id: string, name: string } | null>(null)

// Initialize: fetch and subscribe
onMounted(async () => {
	await tagStore.fetchAll()
	await tagStore.subscribe()
})

// Cleanup on unmount
onUnmounted(() => {
	tagStore.unsubscribe()
})

/**
 * Create a new tag
 */
async function handleCreateTag() {
	if (!newTagName.value.trim() || !currentUserId.value)
		return

	try {
		await tagStore.create({
			name: newTagName.value.trim(),
			creator: currentUserId.value,
		})
		newTagName.value = ''
	}
	catch (e) {
		console.error('Failed to create tag:', e)
	}
}

/**
 * Start editing a tag
 */
function startEdit(tag: any) {
	editingTag.value = {
		id: tag.id,
		name: tag.name,
	}
}

/**
 * Save edited tag
 */
async function handleUpdateTag() {
	if (!editingTag.value || !editingTag.value.name.trim())
		return

	try {
		await tagStore.update(editingTag.value.id, {
			name: editingTag.value.name.trim(),
		})
		editingTag.value = null
	}
	catch (e) {
		console.error('Failed to update tag:', e)
	}
}

/**
 * Cancel editing
 */
function cancelEdit() {
	editingTag.value = null
}

/**
 * Delete a tag
 */
async function handleDeleteTag(id: string) {
	// eslint-disable-next-line no-alert
	if (!confirm('Are you sure you want to delete this tag?'))
		return

	try {
		await tagStore.remove(id)
	}
	catch (e) {
		console.error('Failed to delete tag:', e)
	}
}

/**
 * Refresh tags list
 */
async function handleRefresh() {
	await tagStore.fetchAll()
}
</script>

<template>
	<div class="tag-manager">
		<h2>Tag Manager</h2>

		<!-- Error message -->
		<div v-if="error" class="error">
			{{ error.message }}
		</div>

		<!-- Create new tag form -->
		<div class="create-form">
			<input
				v-model="newTagName"
				type="text"
				placeholder="Enter tag name"
				@keyup.enter="handleCreateTag"
			/>
			<button
				:disabled="!newTagName.trim() || !currentUserId"
				@click="handleCreateTag"
			>
				Create Tag
			</button>
			<button @click="handleRefresh">
				Refresh
			</button>
		</div>

		<!-- Loading state -->
		<div v-if="isLoading" class="loading">
			Loading tags...
		</div>

		<!-- Tags list -->
		<div v-else class="tags-list">
			<div v-if="tags.length === 0" class="empty">
				No tags yet. Create your first tag!
			</div>

			<div
				v-for="tag in tags"
				:key="tag.id"
				class="tag-item"
			>
				<!-- Edit mode -->
				<template v-if="editingTag?.id === tag.id">
					<input
						v-model="editingTag.name"
						type="text"
						@keyup.enter="handleUpdateTag"
					/>
					<button @click="handleUpdateTag">
						Save
					</button>
					<button @click="cancelEdit">
						Cancel
					</button>
				</template>

				<!-- View mode -->
				<template v-else>
					<span class="tag-name">{{ tag.name }}</span>
					<span class="tag-meta">
						Created: {{ new Date(tag.created).toLocaleString() }}
					</span>
					<div class="tag-actions">
						<button @click="startEdit(tag)">
							Edit
						</button>
						<button @click="handleDeleteTag(tag.id)">
							Delete
						</button>
					</div>
				</template>
			</div>
		</div>

		<!-- Real-time updates indicator -->
		<div class="info">
			<p>
				<strong>Real-time updates enabled!</strong>
				Changes from other users will appear automatically.
			</p>
			<p>
				Total tags: {{ tags.length }}
			</p>
		</div>
	</div>
</template>

<style scoped>
.tag-manager {
	max-width: 800px;
	margin: 0 auto;
	padding: 20px;
}

h2 {
	margin-bottom: 20px;
}

.error {
	background-color: #fee;
	color: #c00;
	padding: 10px;
	border-radius: 4px;
	margin-bottom: 20px;
}

.create-form {
	display: flex;
	gap: 10px;
	margin-bottom: 20px;
}

.create-form input {
	flex: 1;
	padding: 8px 12px;
	border: 1px solid #ddd;
	border-radius: 4px;
}

.create-form button {
	padding: 8px 16px;
	background-color: #007bff;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
}

.create-form button:hover:not(:disabled) {
	background-color: #0056b3;
}

.create-form button:disabled {
	background-color: #ccc;
	cursor: not-allowed;
}

.loading {
	text-align: center;
	padding: 20px;
	color: #666;
}

.tags-list {
	margin-bottom: 20px;
}

.empty {
	text-align: center;
	padding: 40px;
	color: #999;
}

.tag-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 12px;
	border: 1px solid #ddd;
	border-radius: 4px;
	margin-bottom: 10px;
}

.tag-name {
	font-weight: 600;
	flex: 1;
}

.tag-meta {
	font-size: 0.85em;
	color: #666;
}

.tag-actions {
	display: flex;
	gap: 5px;
}

.tag-item button {
	padding: 4px 12px;
	border: 1px solid #ddd;
	border-radius: 4px;
	background-color: white;
	cursor: pointer;
}

.tag-item button:hover {
	background-color: #f5f5f5;
}

.tag-item input {
	flex: 1;
	padding: 4px 8px;
	border: 1px solid #ddd;
	border-radius: 4px;
}

.info {
	background-color: #e7f3ff;
	padding: 15px;
	border-radius: 4px;
	border-left: 4px solid #007bff;
}

.info p {
	margin: 5px 0;
}

.info strong {
	color: #007bff;
}

/* Dark mode support */
:root.dark .tag-manager {
	color: #e0e0e0;
}

:root.dark .create-form input,
:root.dark .tag-item input {
	background-color: #2d2d2d;
	border-color: #444;
	color: #e0e0e0;
}

:root.dark .tag-item {
	border-color: #444;
}

:root.dark .tag-item button {
	background-color: #2d2d2d;
	border-color: #444;
	color: #e0e0e0;
}

:root.dark .tag-item button:hover {
	background-color: #3d3d3d;
}
</style>
