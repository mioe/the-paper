<script setup lang="ts">
import Line from '~/components/_common/line.vue'
import Section from '~/components/_playground/_play.section.vue'
</script>

<template>
	<Section
		id="line"
		title="line.vue"
	>
		<div class="flex flex-col w-full">
			<p>Need subclass (exp <code>h-4 w-full</code>):</p>
			<Line class="h-4 w-full" />
		</div>
	</Section>
</template>
