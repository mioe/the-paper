<script setup lang="ts">
import Section from '~/components/_playground/_play.section.vue'
import AppNav from '~/components/app/app.nav.vue'

const em = ref('')
</script>

<template>
	<Section
		id="app.nav"
		title="app.nav.vue"
	>
		<AppNav
			@home="em = 'home'"
			@bookmark="em = 'bookmark'"
			@search="em = 'search'"
			@add="() => { em = 'add' }"
		/>
		<p class="mt-2">
			emit: {{ em }}
		</p>
	</Section>
</template>
