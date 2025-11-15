<script setup lang="ts">
import type { BookmarkMetadata } from '~/services/bookmark.service'

import { fetchUrlMetadata } from '~/services/bookmark.service'
import { useBookmarkStore } from '~/stores/bookmark'

const props = defineProps<{
	open: boolean
}>()

const emit = defineEmits<{
	close: []
	created: [id: string]
}>()

const bookmarkStore = useBookmarkStore()
const pb = usePb()

// Step control
const step = ref<'url' | 'form'>('url')

// Form data
const url = ref('')
const title = ref('')
const description = ref('')
const selectedFavicon = ref('')
const selectedPreviewImage = ref('')
const customFavicon = ref<File | null>(null)
const customPreviewImage = ref<File | null>(null)

// Metadata from API
const metadata = ref<BookmarkMetadata | null>(null)
const isLoadingMetadata = ref(false)
const metadataError = ref('')

// Custom file uploads
const faviconFileInput = ref<HTMLInputElement | null>(null)
const previewFileInput = ref<HTMLInputElement | null>(null)

// Reset form
function resetForm() {
	step.value = 'url'
	url.value = ''
	title.value = ''
	description.value = ''
	selectedFavicon.value = ''
	selectedPreviewImage.value = ''
	customFavicon.value = null
	customPreviewImage.value = null
	metadata.value = null
	isLoadingMetadata.value = false
	metadataError.value = ''
}

// Fetch metadata from URL
async function handleFetchMetadata() {
	if (!url.value.trim()) {
		metadataError.value = 'Please enter a URL'
		return
	}

	isLoadingMetadata.value = true
	metadataError.value = ''

	try {
		metadata.value = await fetchUrlMetadata(url.value)

		// Pre-fill form with metadata
		title.value = metadata.value.title || ''
		description.value = metadata.value.description || ''
		selectedFavicon.value = metadata.value.favicons[0] || ''
		selectedPreviewImage.value = metadata.value.preview_images[0] || ''

		// Move to form step
		step.value = 'form'
	}
	catch (error) {
		console.error('Error fetching metadata:', error)
		metadataError.value = 'Failed to fetch metadata. Please try again.'
	}
	finally {
		isLoadingMetadata.value = false
	}
}

// Handle custom favicon upload
function handleFaviconUpload(event: Event) {
	const input = event.target as HTMLInputElement
	if (input.files && input.files[0]) {
		customFavicon.value = input.files[0]
		selectedFavicon.value = '' // Clear selected URL
	}
}

// Handle custom preview image upload
function handlePreviewUpload(event: Event) {
	const input = event.target as HTMLInputElement
	if (input.files && input.files[0]) {
		customPreviewImage.value = input.files[0]
		selectedPreviewImage.value = '' // Clear selected URL
	}
}

// Remove custom favicon
function removeCustomFavicon() {
	customFavicon.value = null
	if (faviconFileInput.value) {
		faviconFileInput.value.value = ''
	}
}

// Remove custom preview image
function removeCustomPreviewImage() {
	customPreviewImage.value = null
	if (previewFileInput.value) {
		previewFileInput.value.value = ''
	}
}

// Upload file to PocketBase and get URL
async function uploadFile(file: File, recordId: string, fieldName: string): Promise<string> {
	const formData = new FormData()
	formData.append(fieldName, file)

	const updatedRecord = await pb.collection('bookmarks').update(recordId, formData)
	return updatedRecord[fieldName]
}

// Save bookmark
const isSaving = ref(false)
async function handleSave() {
	if (!title.value.trim()) {
		alert('Please enter a title')
		return
	}

	isSaving.value = true

	try {
		// Create bookmark with basic data
		const bookmarkData = {
			url: url.value,
			title: title.value,
			description: description.value || undefined,
			favicon: selectedFavicon.value || undefined,
			preview_image: selectedPreviewImage.value || undefined,
			creator: bookmarkStore.currentUserId,
		}

		const newBookmark = await bookmarkStore.create(bookmarkData)

		// Upload custom files if provided
		if (customFavicon.value) {
			await uploadFile(customFavicon.value, newBookmark.id, 'favicon')
		}
		if (customPreviewImage.value) {
			await uploadFile(customPreviewImage.value, newBookmark.id, 'preview_image')
		}

		emit('created', newBookmark.id)
		handleClose()
	}
	catch (error) {
		console.error('Error saving bookmark:', error)
		alert('Failed to save bookmark. Please try again.')
	}
	finally {
		isSaving.value = false
	}
}

// Handle close
function handleClose() {
	resetForm()
	emit('close')
}

// Handle back to URL step
function handleBack() {
	step.value = 'url'
}

// Watch open prop to reset form
watch(() => props.open, (isOpen) => {
	if (!isOpen) {
		resetForm()
	}
})
</script>

<template>
	<div v-if="open" class="bg-black bg-opacity-50 flex items-center inset-0 justify-center fixed z-50">
		<div class="mx-4 rounded-lg bg-white max-h-[90vh] max-w-2xl w-full shadow-xl overflow-y-auto dark:bg-gray-800">
			<!-- Header -->
			<div class="p-6 border-b border-gray-200 flex items-center justify-between dark:border-gray-700">
				<h2 class="text-2xl text-gray-900 font-bold dark:text-white">
					Add Bookmark
				</h2>
				<button
					class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
					@click="handleClose"
				>
					<span class="text-2xl">&times;</span>
				</button>
			</div>

			<!-- Content -->
			<div class="p-6">
				<!-- Step 1: URL Input -->
				<div v-if="step === 'url'" class="space-y-4">
					<div>
						<label class="text-sm text-gray-700 font-medium mb-2 block dark:text-gray-300">
							Enter URL
						</label>
						<input
							v-model="url"
							type="url"
							placeholder="https://example.com"
							class="px-4 py-2 border border-gray-300 rounded-lg w-full dark:text-white dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
							@keyup.enter="handleFetchMetadata"
						/>
						<p v-if="metadataError" class="text-sm text-red-600 mt-2 dark:text-red-400">
							{{ metadataError }}
						</p>
					</div>

					<button
						:disabled="isLoadingMetadata"
						class="text-white px-4 py-2 rounded-lg bg-blue-600 w-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
						@click="handleFetchMetadata"
					>
						{{ isLoadingMetadata ? 'Loading...' : 'Fetch Metadata' }}
					</button>
				</div>

				<!-- Step 2: Edit Form -->
				<div v-if="step === 'form'" class="space-y-6">
					<!-- Title -->
					<div>
						<label class="text-sm text-gray-700 font-medium mb-2 block dark:text-gray-300">
							Title *
						</label>
						<input
							v-model="title"
							type="text"
							placeholder="Bookmark title"
							class="px-4 py-2 border border-gray-300 rounded-lg w-full dark:text-white dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<!-- Description -->
					<div>
						<label class="text-sm text-gray-700 font-medium mb-2 block dark:text-gray-300">
							Description
						</label>
						<textarea
							v-model="description"
							rows="3"
							placeholder="Bookmark description"
							class="px-4 py-2 border border-gray-300 rounded-lg w-full dark:text-white dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<!-- Favicon Selection -->
					<div>
						<label class="text-sm text-gray-700 font-medium mb-2 block dark:text-gray-300">
							Favicon
						</label>

						<!-- Custom Favicon Upload -->
						<div v-if="customFavicon" class="mb-3 p-3 rounded-lg bg-blue-50 flex items-center justify-between dark:bg-blue-900">
							<span class="text-sm text-gray-700 dark:text-gray-300">{{ customFavicon.name }}</span>
							<button
								class="text-red-600 dark:text-red-400 hover:text-red-800"
								@click="removeCustomFavicon"
							>
								Remove
							</button>
						</div>

						<!-- Favicon Options -->
						<div v-if="!customFavicon && metadata?.favicons.length" class="mb-3 gap-3 grid grid-cols-4">
							<button
								v-for="(favicon, index) in metadata.favicons"
								:key="index"
								class="p-3 border-2 rounded-lg hover:border-blue-500" :class="[
									selectedFavicon === favicon ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-300 dark:border-gray-600',
								]"
								@click="selectedFavicon = favicon"
							>
								<img :src="favicon" :alt="`Favicon ${index + 1}`" class="mx-auto h-8 w-8" onerror="this.style.display='none'" />
							</button>
						</div>

						<!-- Upload Custom Favicon -->
						<input
							ref="faviconFileInput"
							type="file"
							accept="image/*"
							class="hidden"
							@change="handleFaviconUpload"
						/>
						<button
							v-if="!customFavicon"
							class="text-gray-700 px-4 py-2 border border-gray-300 rounded-lg w-full dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
							@click="faviconFileInput?.click()"
						>
							Upload Custom Favicon
						</button>
					</div>

					<!-- Preview Image Selection -->
					<div>
						<label class="text-sm text-gray-700 font-medium mb-2 block dark:text-gray-300">
							Preview Image
						</label>

						<!-- Custom Preview Upload -->
						<div v-if="customPreviewImage" class="mb-3 p-3 rounded-lg bg-blue-50 flex items-center justify-between dark:bg-blue-900">
							<span class="text-sm text-gray-700 dark:text-gray-300">{{ customPreviewImage.name }}</span>
							<button
								class="text-red-600 dark:text-red-400 hover:text-red-800"
								@click="removeCustomPreviewImage"
							>
								Remove
							</button>
						</div>

						<!-- Preview Options -->
						<div v-if="!customPreviewImage && metadata?.preview_images.length" class="mb-3 gap-3 grid grid-cols-2">
							<button
								v-for="(image, index) in metadata.preview_images"
								:key="index"
								class="p-2 border-2 rounded-lg overflow-hidden hover:border-blue-500" :class="[
									selectedPreviewImage === image ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-300 dark:border-gray-600',
								]"
								@click="selectedPreviewImage = image"
							>
								<img :src="image" :alt="`Preview ${index + 1}`" class="rounded h-32 w-full object-cover" onerror="this.style.display='none'" />
							</button>
						</div>

						<!-- Upload Custom Preview -->
						<input
							ref="previewFileInput"
							type="file"
							accept="image/*"
							class="hidden"
							@change="handlePreviewUpload"
						/>
						<button
							v-if="!customPreviewImage"
							class="text-gray-700 px-4 py-2 border border-gray-300 rounded-lg w-full dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
							@click="previewFileInput?.click()"
						>
							Upload Custom Preview Image
						</button>
					</div>

					<!-- Actions -->
					<div class="pt-4 flex gap-3">
						<button
							class="text-gray-700 px-4 py-2 border border-gray-300 rounded-lg flex-1 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
							@click="handleBack"
						>
							Back
						</button>
						<button
							:disabled="isSaving"
							class="text-white px-4 py-2 rounded-lg bg-blue-600 flex-1 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
							@click="handleSave"
						>
							{{ isSaving ? 'Saving...' : 'Save Bookmark' }}
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
