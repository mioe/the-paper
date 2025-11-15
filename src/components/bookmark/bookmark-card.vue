<script setup lang="ts">
import type { RecordModel } from 'pocketbase'

const props = defineProps<{
	bookmark: RecordModel
}>()

const emit = defineEmits<{
	delete: [id: string]
	edit: [id: string]
}>()

const pb = usePb()

// Get file URL from PocketBase
function getFileUrl(record: RecordModel, filename: string): string {
	if (!filename)
		return ''
	return pb.files.getUrl(record, filename)
}

// Get favicon URL (either from PocketBase file or direct URL)
const faviconUrl = computed(() => {
	if (props.bookmark.favicon) {
		// Check if it's a PocketBase file or URL
		if (props.bookmark.favicon.startsWith('http')) {
			return props.bookmark.favicon
		}
		return getFileUrl(props.bookmark, props.bookmark.favicon)
	}
	return ''
})

// Get preview image URL
const previewUrl = computed(() => {
	if (props.bookmark.preview_image) {
		if (props.bookmark.preview_image.startsWith('http')) {
			return props.bookmark.preview_image
		}
		return getFileUrl(props.bookmark, props.bookmark.preview_image)
	}
	return ''
})

function handleDelete() {
	if (confirm('Are you sure you want to delete this bookmark?')) {
		emit('delete', props.bookmark.id)
	}
}
</script>

<template>
	<div class="rounded-lg bg-white shadow-md transition-shadow overflow-hidden dark:bg-gray-800 hover:shadow-lg">
		<!-- Preview Image -->
		<div v-if="previewUrl" class="bg-gray-200 h-48 overflow-hidden dark:bg-gray-700">
			<img
				:src="previewUrl"
				:alt="bookmark.title"
				class="h-full w-full object-cover"
				onerror="this.parentElement.style.display='none'"
			/>
		</div>

		<!-- Content -->
		<div class="p-4">
			<!-- Title with Favicon -->
			<div class="mb-2 flex gap-3 items-start">
				<img
					v-if="faviconUrl"
					:src="faviconUrl"
					alt="Favicon"
					class="mt-1 flex-shrink-0 h-6 w-6"
					onerror="this.style.display='none'"
				/>
				<h3 class="text-lg text-gray-900 font-semibold line-clamp-2 dark:text-white">
					{{ bookmark.title }}
				</h3>
			</div>

			<!-- Description -->
			<p v-if="bookmark.description" class="text-sm text-gray-600 mb-3 line-clamp-2 dark:text-gray-400">
				{{ bookmark.description }}
			</p>

			<!-- URL -->
			<a
				:href="bookmark.url"
				target="_blank"
				rel="noopener noreferrer"
				class="text-sm text-blue-600 mb-3 block truncate dark:text-blue-400 hover:underline"
			>
				{{ bookmark.url }}
			</a>

			<!-- Actions -->
			<div class="pt-3 border-t border-gray-200 flex gap-2 dark:border-gray-700">
				<button
					class="text-sm text-white px-3 py-1.5 rounded bg-blue-600 flex-1 hover:bg-blue-700"
					@click="emit('edit', bookmark.id)"
				>
					Edit
				</button>
				<button
					class="text-sm text-white px-3 py-1.5 rounded bg-red-600 flex-1 hover:bg-red-700"
					@click="handleDelete"
				>
					Delete
				</button>
			</div>
		</div>
	</div>
</template>
