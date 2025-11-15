<script setup lang="ts">
import Btn from '~/components/_common/btn.vue'
import Section from '~/components/_playground/_play.section.vue'

const appStore = useAppStore()
const themes = ['dark', 'light', 'auto'] as const
</script>

<template>
	<Section
		id="theme"
		title="play.theme.vue"
	>
		<div class="flex flex-col gap-4">
			<div class="flex flex-col">
				<p>currentTheme: {{ appStore.theme }}</p>
				<p>isDark: {{ appStore.isDark }}</p>
			</div>
			<div class="flex flex-wrap gap-2">
				<Btn v-for="t in themes" :key="t" @click="appStore.theme = t">
					{{ t }}
				</Btn>
			</div>
		</div>
	</Section>
</template>
