import { acceptHMRUpdate, defineStore } from 'pinia'

import { APP_PREFIX } from '~/const'

export const useAppStore = defineStore('app', () => {
	// > theme
	const theme = useLocalStorage<'auto' | 'dark' | 'light'>(`${APP_PREFIX}:theme`, 'auto')
	const isPreferredDark = usePreferredDark()
	const isDark = computed(() => {
		switch (theme.value) {
			case 'dark':
				return true
			case 'light':
				return false
			default:
				return isPreferredDark.value
		}
	})
	watch(isDark, (val) => {
		if (val) {
			document.documentElement.classList.add('dark')
		}
		else {
			document.documentElement.classList.remove('dark')
		}
	})
	// < theme

	return {
		theme,
		isDark,
	}
})

/**
 * HMR (Hot Module Replacement)
 * https://pinia.vuejs.org/cookbook/hot-module-replacement.html
 */
if (import.meta.hot)
	import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
