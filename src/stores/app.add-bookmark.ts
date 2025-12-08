import { acceptHMRUpdate, defineStore } from 'pinia'

function setDefaultState(): {
	step: 0 | 1 | 2
} {
	return {
		step: 0,
	}
}

function setDefaultForm(): {
	idle: boolean
	url: string | null
} {
	return {
		idle: true,
		url: null,
	}
}

export const useAppAddBookmark = defineStore('app.add-bookmark', () => {
	const state = reactive(structuredClone(setDefaultState()))
	const form = reactive(structuredClone(setDefaultForm()))

	function $reset() {
		const dState = structuredClone(setDefaultState())
		// only manual
		state.step = dState.step
	}

	return {
		state,
		form,

		$reset,
	}
})

/**
 * HMR (Hot Module Replacement)
 * https://pinia.vuejs.org/cookbook/hot-module-replacement.html
 */
if (import.meta.hot)
	import.meta.hot.accept(acceptHMRUpdate(useAppAddBookmark, import.meta.hot))
