<script setup lang="ts">
defineEmits<{
	home: []
	bookmark: []
	search: []
	add: []
}>()
</script>

<template>
	<nav class="p-1 border-2 rounded-md inline-flex btn-shadow bg-lines" :style="{ '--line-op': '50%' }">
		<div class="px-2 border-2 rounded bg-primary flex gap-2">
			<button class="p-1" @click="$emit('home')">
				<div class="i-mi:carbon-home h-6 w-6 aspect-square" />
			</button>
			<button class="p-1" @click="$emit('bookmark')">
				<div class="i-mi:carbon-bookmark h-6 w-6 aspect-square" />
			</button>
			<button class="p-1 lg:hidden" @click="$emit('search')">
				<div class="i-mi:carbon-search h-6 w-6 aspect-square" />
			</button>

			<div class="p-1">
				<hr
					class="rounded-full bg-current op-50 h-full w-[2px] self-stretch"
				/>
			</div>

			<button class="p-1" @click="$emit('add')">
				<div class="i-mi:carbon-add-large h-6 w-6 aspect-square" />
			</button>
		</div>
	</nav>
</template>
