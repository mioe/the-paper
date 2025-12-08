import { acceptHMRUpdate, defineStore } from 'pinia'

import type { BookmarkMetadata } from '~/services/bookmark.service'

function setDefaultState(): {
	step: 0 | 1 | 2
} {
	return {
		step: 0,
	}
}

function setDefaultForm(): {
	idle: boolean
	href: string | null
} {
	return {
		idle: true,
		href: null,
	}
}

export const useAppAddBookmark = defineStore('app.add-bookmark', () => {
	const state = reactive(structuredClone(setDefaultState()))
	const form = reactive(structuredClone(setDefaultForm()))
	const metadata = ref<BookmarkMetadata | null>(null)

	function $reset() {
		const dState = structuredClone(setDefaultState())
		// only manual
		state.step = dState.step
	}

	return {
		state,
		form,
		metadata,

		$reset,
	}
})

/**
 * HMR (Hot Module Replacement)
 * https://pinia.vuejs.org/cookbook/hot-module-replacement.html
 */
if (import.meta.hot)
	import.meta.hot.accept(acceptHMRUpdate(useAppAddBookmark, import.meta.hot))
