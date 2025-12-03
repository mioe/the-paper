<script setup lang="ts">
import Line from '~/components/_common/line.vue'
import AppFooter from '~/components/app/app.footer.vue'
import AppMouseHunter from '~/components/app/app.mouse-hunter.vue'
import AppNav from '~/components/app/app.nav.vue'
</script>

<template>
	<main class="scroll-smooth flex flex-1 w-svw select-none relative overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrolling-touch">
		<div class="flex flex-shrink-0 w-svw max-h-svh snap-start scrollbar-stable lg:w-74">
			<div class="h-full w-full overflow-y-auto">
				<div class="h-[8000px]">
					ff
				</div>
			</div>

			<div class="ml-auto top-0 relative">
				<Line class="border-x border-black border-op-20 flex-shrink-0 h-full w-4 dark:border-white" />
			</div>
		</div>

		<div class="flex flex-shrink-0 flex-col w-svw max-h-svh snap-start scrollbar-stable lg:flex-1 lg:w-auto">
			<div class="h-full w-full overflow-y-auto">
				<slot />
			</div>
		</div>

		<div class="flex flex-shrink-0 w-svw max-h-svh snap-start scrollbar-stable lg:w-82">
			<div class="mr-auto border-x border-black border-op-20 flex-shrink-0 min-h-full w-4 dark:border-white">
				<Line class="h-full w-full" />
			</div>

			<div class="h-full w-full overflow-y-auto">
				<div class="p-4 flex flex-1 flex-col gap-4 h-[9000px]">
					<h1>the-paper <b class="op-20">v0</b></h1>
					<AppNav />
					<AppFooter class="mt-auto" />
				</div>
			</div>
		</div>
	</main>

	<AppMouseHunter />
</template>
