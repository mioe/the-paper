<script setup lang="ts">
import AppNav from '~/components/_playground/play.app.nav.vue'
import Btn from '~/components/_playground/play.btn.vue'
import Line from '~/components/_playground/play.line.vue'
import Theme from '~/components/_playground/play.theme.vue'
</script>

<template>
	<main class="p-6 flex flex-col gap-6">
		<h1>Playground</h1>
		<Btn />
		<Theme />
		<AppNav />
		<Line />
	</main>
</template>
