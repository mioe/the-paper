<script setup lang="ts">
const {
	id = crypto.randomUUID(),
	title = 'Play section',
} = defineProps<{
	id?: string
	title?: string
}>()
</script>

<template>
	<section>
		<header :id="id">
			<h2>{{ title }}</h2>
		</header>

		<div>
			<slot />
		</div>
	</section>
</template>
