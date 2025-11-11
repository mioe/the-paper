<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useBookmarkStore } from '~/stores/bookmark'
import { useTagStore } from '~/stores/tag'

const emit = defineEmits<{
	created: []
	cancelled: []
}>()

const bookmarkStore = useBookmarkStore()
const tagStore = useTagStore()
const { currentUserId } = storeToRefs(bookmarkStore)
const { sortedTags } = storeToRefs(tagStore)

// Form data
const formData = ref({
	href: '',
	title: '',
	description: '',
	tag: [] as string[],
})

const isSubmitting = ref(false)
const error = ref<string | null>(null)

/**
 * Handle form submission
 */
async function handleSubmit() {
	if (!formData.value.href.trim() || !formData.value.title.trim() || !currentUserId.value)
		return

	isSubmitting.value = true
	error.value = null

	try {
		await bookmarkStore.create({
			href: formData.value.href.trim(),
			title: formData.value.title.trim(),
			description: formData.value.description.trim() || undefined,
			tag: formData.value.tag.length > 0 ? formData.value.tag : undefined,
			creator: currentUserId.value,
		})

		// Reset form
		formData.value = {
			href: '',
			title: '',
			description: '',
			tag: [],
		}

		emit('created')
	}
	catch (e: any) {
		console.error('Failed to create bookmark:', e)
		error.value = e.message || 'Failed to create bookmark'
	}
	finally {
		isSubmitting.value = false
	}
}

/**
 * Toggle tag selection
 */
function toggleTag(tagId: string) {
	const index = formData.value.tag.indexOf(tagId)
	if (index > -1) {
		formData.value.tag.splice(index, 1)
	}
	else {
		formData.value.tag.push(tagId)
	}
}

/**
 * Cancel form
 */
function handleCancel() {
	formData.value = {
		href: '',
		title: '',
		description: '',
		tag: [],
	}
	error.value = null
	emit('cancelled')
}
</script>

<template>
	<div class="bookmark-form">
		<h3>Add New Bookmark</h3>

		<!-- Error message -->
		<div v-if="error" class="error">
			{{ error }}
		</div>

		<form @submit.prevent="handleSubmit">
			<!-- URL input -->
			<div class="form-group">
				<label for="href">URL *</label>
				<input
					id="href"
					v-model="formData.href"
					type="url"
					placeholder="https://example.com"
					required
					:disabled="isSubmitting"
				/>
			</div>

			<!-- Title input -->
			<div class="form-group">
				<label for="title">Title *</label>
				<input
					id="title"
					v-model="formData.title"
					type="text"
					placeholder="Bookmark title"
					maxlength="255"
					required
					:disabled="isSubmitting"
				/>
			</div>

			<!-- Description input -->
			<div class="form-group">
				<label for="description">Description</label>
				<textarea
					id="description"
					v-model="formData.description"
					placeholder="Optional description"
					rows="3"
					:disabled="isSubmitting"
				/>
			</div>

			<!-- Tags selection -->
			<div v-if="sortedTags.length > 0" class="form-group">
				<label>Tags</label>
				<div class="tags-selector">
					<button
						v-for="tag in sortedTags"
						:key="tag.id"
						type="button"
						class="tag-button"
						:class="{ active: formData.tag.includes(tag.id) }"
						:disabled="isSubmitting"
						@click="toggleTag(tag.id)"
					>
						{{ tag.name }}
					</button>
				</div>
			</div>

			<!-- Form actions -->
			<div class="form-actions">
				<button
					type="submit"
					class="btn-primary"
					:disabled="!formData.href.trim() || !formData.title.trim() || isSubmitting"
				>
					{{ isSubmitting ? 'Creating...' : 'Create Bookmark' }}
				</button>
				<button
					type="button"
					class="btn-secondary"
					:disabled="isSubmitting"
					@click="handleCancel"
				>
					Cancel
				</button>
			</div>
		</form>
	</div>
</template>

<style scoped>
.bookmark-form {
	background-color: #fff;
	border-radius: 8px;
	padding: 24px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h3 {
	margin-top: 0;
	margin-bottom: 20px;
	color: #333;
}

.error {
	background-color: #fee;
	color: #c00;
	padding: 10px;
	border-radius: 4px;
	margin-bottom: 16px;
	font-size: 0.9em;
}

.form-group {
	margin-bottom: 20px;
}

.form-group label {
	display: block;
	margin-bottom: 8px;
	font-weight: 500;
	color: #555;
}

.form-group input,
.form-group textarea {
	width: 100%;
	padding: 10px 12px;
	border: 1px solid #ddd;
	border-radius: 4px;
	font-size: 14px;
	font-family: inherit;
	transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
	outline: none;
	border-color: #007bff;
}

.form-group input:disabled,
.form-group textarea:disabled {
	background-color: #f5f5f5;
	cursor: not-allowed;
}

.tags-selector {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.tag-button {
	padding: 6px 12px;
	border: 1px solid #ddd;
	border-radius: 16px;
	background-color: #fff;
	color: #555;
	cursor: pointer;
	font-size: 0.85em;
	transition: all 0.2s;
}

.tag-button:hover:not(:disabled) {
	background-color: #f0f0f0;
	border-color: #007bff;
}

.tag-button.active {
	background-color: #007bff;
	color: white;
	border-color: #007bff;
}

.tag-button:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.form-actions {
	display: flex;
	gap: 12px;
	margin-top: 24px;
}

.btn-primary,
.btn-secondary {
	padding: 10px 20px;
	border: none;
	border-radius: 4px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s;
}

.btn-primary {
	background-color: #007bff;
	color: white;
}

.btn-primary:hover:not(:disabled) {
	background-color: #0056b3;
}

.btn-primary:disabled {
	background-color: #ccc;
	cursor: not-allowed;
}

.btn-secondary {
	background-color: #6c757d;
	color: white;
}

.btn-secondary:hover:not(:disabled) {
	background-color: #5a6268;
}

.btn-secondary:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

/* Dark mode support */
:root.dark .bookmark-form {
	background-color: #2d2d2d;
}

:root.dark h3 {
	color: #e0e0e0;
}

:root.dark .form-group label {
	color: #b0b0b0;
}

:root.dark .form-group input,
:root.dark .form-group textarea {
	background-color: #1a1a1a;
	border-color: #444;
	color: #e0e0e0;
}

:root.dark .form-group input:disabled,
:root.dark .form-group textarea:disabled {
	background-color: #2a2a2a;
}

:root.dark .tag-button {
	background-color: #2d2d2d;
	border-color: #444;
	color: #b0b0b0;
}

:root.dark .tag-button:hover:not(:disabled) {
	background-color: #3d3d3d;
}

:root.dark .tag-button.active {
	background-color: #007bff;
	color: white;
}
</style>
