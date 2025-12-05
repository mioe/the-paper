<script setup lang="ts">
import Line from '~/components/_common/line.vue'
import Portal from '~/components/_common/portal.vue'
import SafeArea from '~/components/_common/safe-area.vue'
import AppMouseHunter from '~/components/app/app.mouse-hunter.vue'
import AppSheetAddBookmark from '~/components/app/app.sheet-add-bookmark.vue'

const appStore = useAppStore()
const router = useRouter()
const pb = usePb()
const { locale } = useI18n()

const userName = ref(pb.authStore.record?.name)
const appSheetAddBookmarkRef = ref<InstanceType<typeof AppSheetAddBookmark> | null>(null)

function handleLogout() {
	pb.authStore.clear()
	router.replace('/sign-in')
}

function handleOpenAddBookmark() {
	appSheetAddBookmarkRef.value?.open()
}
</script>

<template>
	<footer class="p-1.5 border-2 inline-flex translate-x-[-50%] transform bottom-4 left-[50%] fixed btn-shadow bg-lines" :style="{ '--line-op': '50%' }">
		<button class="py-2 pl-2 pr-4 border-2 bg-primary flex gap-2 items-center" tabindex="0" @click="handleOpenAddBookmark">
			<div class="i-mi:carbon-add-large op-50 h-6 w-6 aspect-square" />
			<span>{{ $t('Add bookmark') }}</span>
		</button>
	</footer>

	<main class="scroll-smooth flex flex-1 w-svw select-none relative overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrolling-touch">
		<div class="flex flex-shrink-0 w-svw max-h-svh snap-start scrollbar-stable lg:w-74">
			<div class="h-full w-full overflow-y-auto">
				<div class="flex flex-col min-h-svh">
					<span>#todo</span>
					<SafeArea class="lg:hidden" />
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
					<div class="flex flex-1 flex-col">
						<h1 class="p-4">
							the-paper <b class="op-20">v0</b>
						</h1>
						<div class="border-t border-black border-op-20 flex flex-1 dark:border-white">
							<Line class="flex-1 flex-shrink-0" />
						</div>
						<footer class="mt-auto p-4 border-t border-black border-op-20 flex flex-col gap-2 dark:border-white">
							<p class="inline-flex flex-wrap gap-4">
								<span>{{ $t('Language') }}:</span>
								<button class="link" :class="{ 'text-orange': locale === 'en' }" @click="locale = 'en'">
									en
								</button>
								<button class="link" :class="{ 'text-orange': locale === 'ru' }" @click="locale = 'ru'">
									ru
								</button>
							</p>

							<p class="inline-flex flex-wrap gap-4">
								<span>{{ $t('Theme') }}:</span>
								<button class="link" :class="{ 'text-orange': appStore.theme === 'light' }" @click="appStore.theme = 'light'">
									<div class="i-mi:carbon-sun h-5 w-5" />
								</button>
								<button class="link" :class="{ 'text-orange': appStore.theme === 'dark' }" @click="appStore.theme = 'dark'">
									<div class="i-mi:carbon-moon h-5 w-5" />
								</button>
								<button class="link" :class="{ 'text-orange': appStore.theme === 'auto' }" @click="appStore.theme = 'auto'">
									<div class="i-mi:carbon-application-web h-5 w-5" />
								</button>
							</p>

							<p class="inline-flex flex-wrap gap-x-4 gap-y-1">
								<span>{{ $t('Welcome back') }}, {{ userName }}</span>
								<span>·</span>
								<button class="link lowercase" tabindex="0" @click="handleLogout">
									{{ $t('Logout') }}
								</button>
							</p>
						</footer>
					</div>
					<SafeArea class="lg:hidden" />
				</div>
			</div>
		</div>
	</main>

	<AppMouseHunter />
	<AppSheetAddBookmark ref="appSheetAddBookmarkRef" />
</template>
