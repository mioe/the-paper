<script setup lang="ts">
defineEmits<{
	click: []
}>()
</script>

<template>
	<button
		class="text-current border-1.5 border-current h-4 w-12 bg-lines"
		tabindex="0"
		@click="$emit('click')"
	/>
</template>
