<script setup lang="ts">
import Line from '~/components/_common/line.vue'
import Portal from '~/components/_common/portal.vue'
import SafeArea from '~/components/_common/safe-area.vue'
import AppMouseHunter from '~/components/app/app.mouse-hunter.vue'
import AppNav from '~/components/app/app.nav.vue'

const appStore = useAppStore()
</script>

<template>
	<main class="scroll-smooth flex flex-1 w-svw select-none relative overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrolling-touch">
		<div class="flex flex-shrink-0 w-svw max-h-svh snap-start scrollbar-stable lg:w-74">
			<div class="h-full w-full overflow-y-auto">
				<div class="flex flex-col min-h-svh">
					<span>#todo</span>
					<SafeArea />
				</div>
			</div>

			<div class="ml-auto top-0 relative">
				<Portal class="text-blue translate-x-[-50%] transform left-[50%] top-[var(--t)] absolute z-1" :style="{ '--t': `${appStore.mouse.y - 2}px` }" />
				<Line class="border-x border-black border-op-20 flex-shrink-0 h-full w-4 dark:border-white" />
			</div>
		</div>

		<div class="flex flex-shrink-0 flex-col w-svw max-h-svh snap-start scrollbar-stable lg:flex-1 lg:w-auto">
			<div class="h-full w-full overflow-y-auto">
				<div class="flex flex-col min-h-svh">
					<slot />
					<SafeArea />
				</div>
			</div>
		</div>

		<div class="flex flex-shrink-0 w-svw max-h-svh snap-start scrollbar-stable lg:w-82">
			<div class="mr-auto border-x border-black border-op-20 flex-shrink-0 min-h-full w-4 relative dark:border-white">
				<Portal class="text-orange translate-x-[-50%] transform transition-ease-linear left-[50%] top-[var(--t)] absolute z-1" :style="{ '--t': `${appStore.mouse.y - 2}px` }" />
				<Line class="h-full w-full" />
			</div>

			<div class="h-full w-full overflow-y-auto">
				<div class="flex flex-col min-h-svh">
					<div class="p-4 flex flex-col gap-4">
						<h1>the-paper <b class="op-20">v0</b></h1>
						<AppNav />
					</div>
					<SafeArea />
				</div>
			</div>
		</div>
	</main>

	<AppMouseHunter />

	<footer class="p-1.5 border-2 inline-flex translate-x-[-50%] transform bottom-4 left-[50%] fixed btn-shadow bg-lines" :style="{ '--line-op': '50%' }">
		<button class="py-2 pl-2 pr-4 border-2 bg-primary flex gap-2 items-center">
			<div class="i-mi:carbon-add-large op-50 h-6 w-6 aspect-square" />
			<span>{{ $t('Add bookmark') }}</span>
		</button>
	</footer>
</template>
