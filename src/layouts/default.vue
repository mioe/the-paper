<script setup lang="ts">
import Line from '~/components/_common/line.vue'
import AppFooter from '~/components/app/app.footer.vue'
import AppMouseHunter from '~/components/app/app.mouse-hunter.vue'
import AppNav from '~/components/app/app.nav.vue'
</script>

<template>
	<main class="scroll-smooth flex flex-1 w-svw select-none relative overflow-x-auto snap-x snap-mandatory scrolling-touch">
		<div class="scrollbar-stable flex flex-shrink-0 w-svw relative overflow-auto max-h-svh snap-start lg:w-74">
			<Line class="ml-auto border-x border-black border-op-20 flex-shrink-0 h-full w-4 dark:border-white" />
		</div>
		<div class="scrollbar-stable flex flex-shrink-0 flex-col w-svw relative overflow-auto max-h-svh snap-start lg:flex-1 lg:w-auto">
			<slot />
		</div>
		<div class="scrollbar-stable flex flex-shrink-0 w-svw relative overflow-auto max-h-svh snap-start lg:w-82">
			<Line class="mr-auto border-x border-black border-op-20 flex-shrink-0 h-full w-4 dark:border-white" />

			<div class="p-4 flex flex-1 flex-col gap-4">
				<h1>the-paper <b class="op-20">v0</b></h1>
				<AppNav />
				<AppFooter class="mt-auto" />
			</div>
		</div>
	</main>

	<AppMouseHunter />
</template>
