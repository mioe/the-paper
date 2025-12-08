<script setup lang="ts">
import type { BookmarkMetadata } from '~/services/bookmark.service'

import Sheet from '~/components/_common/sheet/sheet.vue'
import { fetchUrlMetadata } from '~/services/bookmark.service'
import { useBookmarkStore } from '~/stores/bookmark'

const bookmarkStore = useBookmarkStore()
const pb = usePb()
const { t } = useI18n()

const sheetRef = ref<InstanceType<typeof Sheet> | null>(null)

// Step control
const step = ref<'url' | 'form'>('url')
const detents = computed<('medium' | 'large')[]>(() => step.value === 'url' ? ['medium'] : ['large'])

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
		metadataError.value = t('Please enter a URL')
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
		sheetRef.value?.setFull()
	}
	catch (error) {
		console.error('Error fetching metadata:', error)
		metadataError.value = t('Failed to fetch metadata')
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
		selectedFavicon.value = ''
	}
}

// Handle custom preview image upload
function handlePreviewUpload(event: Event) {
	const input = event.target as HTMLInputElement
	if (input.files && input.files[0]) {
		customPreviewImage.value = input.files[0]
		selectedPreviewImage.value = ''
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

	const updatedRecord = await pb.collection('bookmark').update(recordId, formData)
	return updatedRecord[fieldName]
}

// Save bookmark
const isSaving = ref(false)
async function handleSave() {
	if (!title.value.trim()) {
		return
	}

	isSaving.value = true

	try {
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

		close()
	}
	catch (error) {
		console.error('Error saving bookmark:', error)
	}
	finally {
		isSaving.value = false
	}
}

// Handle back to URL step
function handleBack() {
	step.value = 'url'
}

function open() {
	resetForm()
	sheetRef.value?.open()
}

function close() {
	sheetRef.value?.close()
	resetForm()
}

function onClose() {
	step.value = 'url'
}

defineExpose({
	open,
	close,
})
</script>

<template>
	<Sheet ref="sheetRef" :detents drag-indicator="visible" @close="onClose">
		<div class="px-4 pb-4 max-w-md w-full">
			<!-- Step 1: URL Input -->
			<div v-if="step === 'url'" class="flex flex-col gap-4">
				<h2 class="text-xl font-bold">
					{{ $t('Add bookmark') }}
				</h2>

				<div class="flex flex-col gap-2">
					<label class="text-sm op-70">
						{{ $t('Enter URL') }}
					</label>
					<input
						v-model="url"
						type="url"
						placeholder="https://example.com"
						class="px-3 py-2 border-2 border-black border-op-20 w-full dark:border-white focus:border-op-100"
						@keyup.enter="handleFetchMetadata"
					/>
					<p v-if="metadataError" class="text-sm text-red">
						{{ metadataError }}
					</p>
				</div>

				<button
					:disabled="isLoadingMetadata"
					class="py-2 border-2 bg-primary w-full btn-shadow disabled:op-50"
					@click="handleFetchMetadata"
				>
					{{ isLoadingMetadata ? $t('Loading...') : $t('Fetch metadata') }}
				</button>
			</div>

			<!-- Step 2: Edit Form -->
			<div v-if="step === 'form'" class="flex flex-col gap-4">
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-bold">
						{{ $t('Edit bookmark') }}
					</h2>
					<button class="op-50 hover:op-100" @click="handleBack">
						{{ $t('Back') }}
					</button>
				</div>

				<!-- Title -->
				<div class="flex flex-col gap-2">
					<label class="text-sm op-70">
						{{ $t('Title') }} *
					</label>
					<input
						v-model="title"
						type="text"
						:placeholder="$t('Bookmark title')"
						class="px-3 py-2 border-2 border-black border-op-20 w-full dark:border-white focus:border-op-100"
					/>
				</div>

				<!-- Description -->
				<div class="flex flex-col gap-2">
					<label class="text-sm op-70">
						{{ $t('Description') }}
					</label>
					<textarea
						v-model="description"
						rows="2"
						:placeholder="$t('Bookmark description')"
						class="px-3 py-2 border-2 border-black border-op-20 w-full resize-none dark:border-white focus:border-op-100"
					/>
				</div>

				<!-- Favicon Selection -->
				<div class="flex flex-col gap-2">
					<label class="text-sm op-70">
						{{ $t('Favicon') }}
					</label>

					<!-- Custom Favicon Upload -->
					<div v-if="customFavicon" class="p-2 border-2 flex items-center justify-between">
						<span class="text-sm truncate">{{ customFavicon.name }}</span>
						<button class="text-red ml-2" @click="removeCustomFavicon">
							{{ $t('Remove') }}
						</button>
					</div>

					<!-- Favicon Options -->
					<div v-if="!customFavicon && metadata?.favicons.length" class="gap-2 grid grid-cols-4">
						<button
							v-for="(favicon, index) in metadata.favicons"
							:key="index"
							class="p-2 border-2 aspect-square hover:border-op-100"
							:class="[selectedFavicon === favicon ? 'border-blue' : 'border-op-20']"
							@click="selectedFavicon = favicon"
						>
							<img :src="favicon" :alt="`Favicon ${index + 1}`" class="mx-auto h-6 w-6 object-contain" />
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
						class="text-sm py-2 border-2 border-op-20 border-dashed op-70 w-full hover:border-op-50"
						@click="faviconFileInput?.click()"
					>
						{{ $t('Upload custom') }}
					</button>
				</div>

				<!-- Preview Image Selection -->
				<div class="flex flex-col gap-2">
					<label class="text-sm op-70">
						{{ $t('Preview image') }}
					</label>

					<!-- Custom Preview Upload -->
					<div v-if="customPreviewImage" class="p-2 border-2 flex items-center justify-between">
						<span class="text-sm truncate">{{ customPreviewImage.name }}</span>
						<button class="text-red ml-2" @click="removeCustomPreviewImage">
							{{ $t('Remove') }}
						</button>
					</div>

					<!-- Preview Options -->
					<div v-if="!customPreviewImage && metadata?.preview_images.length" class="gap-2 grid grid-cols-2">
						<button
							v-for="(image, index) in metadata.preview_images"
							:key="index"
							class="p-1 border-2 overflow-hidden hover:border-op-100"
							:class="[selectedPreviewImage === image ? 'border-blue' : 'border-op-20']"
							@click="selectedPreviewImage = image"
						>
							<img :src="image" :alt="`Preview ${index + 1}`" class="h-20 w-full object-cover" />
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
						class="text-sm py-2 border-2 border-op-20 border-dashed op-70 w-full hover:border-op-50"
						@click="previewFileInput?.click()"
					>
						{{ $t('Upload custom') }}
					</button>
				</div>

				<!-- Save Button -->
				<button
					:disabled="isSaving || !title.trim()"
					class="py-2 border-2 bg-primary w-full btn-shadow disabled:op-50"
					@click="handleSave"
				>
					{{ isSaving ? $t('Saving...') : $t('Save bookmark') }}
				</button>
			</div>
		</div>
	</Sheet>
</template>
