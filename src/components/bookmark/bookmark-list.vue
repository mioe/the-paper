<script setup lang="ts">
import type { RecordModel } from 'pocketbase'
import { storeToRefs } from 'pinia'

import BookmarkCard from './bookmark-card.vue'
import { useBookmarkStore } from '~/stores/bookmark'
import { useTagStore } from '~/stores/tag'

const bookmarkStore = useBookmarkStore()
const tagStore = useTagStore()

const { sortedBookmarks, isLoading, error } = storeToRefs(bookmarkStore)
const { sortedTags } = storeToRefs(tagStore)

// Filter state
const selectedTagId = ref<string | null>(null)
const searchQuery = ref('')

// Computed filtered bookmarks
const filteredBookmarks = computed(() => {
	let result = sortedBookmarks.value

	// Filter by tag
	if (selectedTagId.value) {
		result = result.filter(b => b.tag?.includes(selectedTagId.value))
	}

	// Filter by search query
	if (searchQuery.value.trim()) {
		const query = searchQuery.value.toLowerCase()
		result = result.filter(b =>
			b.title.toLowerCase().includes(query)
			|| b.href.toLowerCase().includes(query)
			|| b.description?.toLowerCase().includes(query),
		)
	}

	return result
})

/**
 * Clear filters
 */
function clearFilters() {
	selectedTagId.value = null
	searchQuery.value = ''
}

/**
 * Toggle tag filter
 */
function toggleTagFilter(tagId: string) {
	selectedTagId.value = selectedTagId.value === tagId ? null : tagId
}
</script>

<template>
	<div class="bookmark-list">
		<!-- Filters -->
		<div class="filters">
			<!-- Search -->
			<div class="search-box">
				<input
					v-model="searchQuery"
					type="text"
					placeholder="Search bookmarks..."
				/>
			</div>

			<!-- Tag filters -->
			<div v-if="sortedTags.length > 0" class="tag-filters">
				<span class="filter-label">Filter by tag:</span>
				<button
					v-for="tag in sortedTags"
					:key="tag.id"
					class="tag-filter"
					:class="{ active: selectedTagId === tag.id }"
					@click="toggleTagFilter(tag.id)"
				>
					{{ tag.name }}
				</button>
				<button
					v-if="selectedTagId || searchQuery"
					class="clear-filters"
					@click="clearFilters"
				>
					Clear filters
				</button>
			</div>
		</div>

		<!-- Loading state -->
		<div v-if="isLoading" class="loading">
			Loading bookmarks...
		</div>

		<!-- Error state -->
		<div v-else-if="error" class="error">
			{{ error.message }}
		</div>

		<!-- Empty state -->
		<div v-else-if="filteredBookmarks.length === 0" class="empty">
			<p v-if="selectedTagId || searchQuery">
				No bookmarks found matching your filters.
			</p>
			<p v-else>
				No bookmarks yet. Create your first bookmark!
			</p>
		</div>

		<!-- Bookmarks grid -->
		<div v-else class="bookmarks-grid">
			<BookmarkCard
				v-for="bookmark in filteredBookmarks"
				:key="bookmark.id"
				:bookmark="bookmark"
			/>
		</div>

		<!-- Results count -->
		<div v-if="!isLoading" class="results-info">
			<p>
				Showing {{ filteredBookmarks.length }} of {{ sortedBookmarks.length }} bookmarks
			</p>
		</div>
	</div>
</template>

<style scoped>
.bookmark-list {
	width: 100%;
}

.filters {
	background-color: #f8f9fa;
	padding: 16px;
	border-radius: 8px;
	margin-bottom: 24px;
}

.search-box {
	margin-bottom: 16px;
}

.search-box input {
	width: 100%;
	padding: 10px 12px;
	border: 1px solid #ddd;
	border-radius: 4px;
	font-size: 14px;
}

.search-box input:focus {
	outline: none;
	border-color: #007bff;
}

.tag-filters {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 8px;
}

.filter-label {
	font-size: 0.9em;
	color: #666;
	font-weight: 500;
}

.tag-filter {
	padding: 6px 12px;
	border: 1px solid #ddd;
	border-radius: 16px;
	background-color: #fff;
	color: #555;
	cursor: pointer;
	font-size: 0.85em;
	transition: all 0.2s;
}

.tag-filter:hover {
	background-color: #f0f0f0;
	border-color: #007bff;
}

.tag-filter.active {
	background-color: #007bff;
	color: white;
	border-color: #007bff;
}

.clear-filters {
	padding: 6px 12px;
	border: 1px solid #dc3545;
	border-radius: 16px;
	background-color: #fff;
	color: #dc3545;
	cursor: pointer;
	font-size: 0.85em;
	transition: all 0.2s;
}

.clear-filters:hover {
	background-color: #dc3545;
	color: white;
}

.loading {
	text-align: center;
	padding: 40px;
	color: #666;
}

.error {
	background-color: #fee;
	color: #c00;
	padding: 16px;
	border-radius: 4px;
	margin-bottom: 20px;
}

.empty {
	text-align: center;
	padding: 60px 20px;
	color: #999;
}

.empty p {
	font-size: 1.1em;
}

.bookmarks-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
	gap: 20px;
	margin-bottom: 24px;
}

@media (max-width: 768px) {
	.bookmarks-grid {
		grid-template-columns: 1fr;
	}
}

.results-info {
	text-align: center;
	padding: 12px;
	color: #666;
	font-size: 0.9em;
}

.results-info p {
	margin: 0;
}

/* Dark mode support */
:root.dark .filters {
	background-color: #2d2d2d;
}

:root.dark .search-box input {
	background-color: #1a1a1a;
	border-color: #444;
	color: #e0e0e0;
}

:root.dark .filter-label {
	color: #b0b0b0;
}

:root.dark .tag-filter {
	background-color: #2d2d2d;
	border-color: #444;
	color: #b0b0b0;
}

:root.dark .tag-filter:hover {
	background-color: #3d3d3d;
}

:root.dark .tag-filter.active {
	background-color: #007bff;
	color: white;
}

:root.dark .clear-filters {
	background-color: #2d2d2d;
}

:root.dark .loading,
:root.dark .empty,
:root.dark .results-info {
	color: #999;
}
</style>
