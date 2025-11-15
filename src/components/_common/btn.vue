<script setup lang="ts">
defineProps<{
	type?: HTMLButtonElement['type']
	disabled?: HTMLButtonElement['disabled']
}>()
</script>

<template>
	<button
		:type
		:disabled
		class="btn-shadow px-3 py-2 text-center border-2 rounded-md flex gap-1.5 items-center justify-center"
	>
		<slot />
	</button>
</template>
