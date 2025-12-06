<script setup lang="ts">
const { detents = ['large'], dragIndicator = 'automatic' } = defineProps<{
	detents?: ('medium' | 'large')[]
	dragIndicator?: 'automatic' | 'hidden' | 'visible'
}>()

const emit = defineEmits<{
	close: []
}>()

const MEDIUM_DETENT = 50
const LARGE_DETENT = 100
const IS_MANY_DETENTS = computed(() => detents.length === 2)
function getInitDetent() {
	return detents.includes('large') && !IS_MANY_DETENTS.value
		? LARGE_DETENT
		: MEDIUM_DETENT
}
const showDragIndicator = computed(() => {
	switch (dragIndicator) {
		case 'hidden':
			return false
		case 'visible':
			return true
		default:
			return IS_MANY_DETENTS.value
	}
})

const sheet = reactive({
	open: false,
	bodyHeight: getInitDetent(),
	full: getInitDetent() === LARGE_DETENT,
})

function open() {
	sheet.open = true
	sheet.bodyHeight = getInitDetent()
	sheet.full = getInitDetent() === LARGE_DETENT
}

function close() {
	sheet.open = false
	sheet.bodyHeight = 0
	sheet.full = false
}

const drag = reactive({
	idle: true,
	initPosY: 0,
	initSheetBodyHeight: 0,
})

function dragStart(ev: TouchEvent) {
	drag.idle = false
	// eslint-disable-next-line ts/ban-ts-comment
	// @ts-expect-error
	drag.initPosY = ev.touches?.[0].pageY
	drag.initSheetBodyHeight = 0 + sheet.bodyHeight
}

function dragging(ev: TouchEvent) {
	if (drag.idle)
		return
	sheet.full = false
	// eslint-disable-next-line ts/ban-ts-comment
	// @ts-expect-error
	const delta = drag.initPosY - ev.touches?.[0].pageY

	if (IS_MANY_DETENTS.value || getInitDetent() === LARGE_DETENT) {
		const newHeight = drag.initSheetBodyHeight + delta / window.innerHeight * 100
		sheet.bodyHeight = newHeight > 100 ? 100 : newHeight
		if (sheet.bodyHeight < 5) {
			close()
		}
	}
	else {
		const newHeight = drag.initSheetBodyHeight + delta / window.innerHeight * (delta > 65 ? 20 : 100)
		sheet.bodyHeight = newHeight > 100 ? 65 : newHeight
		if (sheet.bodyHeight < 5) {
			close()
		}
	}
}

function dragStop() {
	drag.idle = true
	const sheetHeight = 0 + sheet.bodyHeight

	if (IS_MANY_DETENTS.value) {
		if (sheetHeight < 25) {
			close()
		}
		else {
			if (sheetHeight > 75) {
				sheet.full = true
			}
			else {
				sheet.bodyHeight = 50
			}
		}
	}
	else {
		if (getInitDetent() === LARGE_DETENT) {
			if (sheetHeight < 50) {
				close()
			}
			else {
				sheet.bodyHeight = LARGE_DETENT - 6
				sheet.full = true
			}
		}
		else {
			if (sheetHeight < 25) {
				close()
			}
			else { sheet.bodyHeight = 50 }
		}
	}
}

function handleDragIndicator() {
	if (IS_MANY_DETENTS.value) {
		sheet.full = !sheet.full
		if (!sheet.full) {
			sheet.bodyHeight = 50
		}
		else { sheet.bodyHeight = 100 }
	}
	else { close() }
}

function lockScrollPage(lock = true) {
	if (lock) {
		document.body.style.overflow = 'hidden'
	}
	else { document.body.style.overflow = '' }
}

function onTransitionEnter() {
	lockScrollPage()
}
function onTransitionLeave() {
	lockScrollPage(false)
	emit('close')
}

function setFull() {
	sheet.full = true
}

onUnmounted(() => {
	lockScrollPage(false)
})

defineExpose({
	open,
	close,
	setFull,
})
</script>

<template>
	<Teleport to="body">
		<Transition
			name="sheet"
			@enter="onTransitionEnter"
			@leave="onTransitionLeave"
		>
			<div
				v-if="sheet.open"
				class="sheet-shadow flex flex-col inset-0 fixed z-99"
			>
				<div
					class="flex-1"
					@click="close"
				/>

				<div
					class="sheet-body border-t border-black bg-primary flex flex-shrink-0 flex-col shadow-lg overflow-auto dark:border-white" :class="[
						!sheet.full ? 'h-[var(--h)]' : 'h-[calc(100%-24px)]',
					]"
					:style="{
						'--h': `${sheet.bodyHeight}svh`,
					}"
					@touchstart="dragStart"
					@touchmove="dragging"
					@touchend="dragStop"
				>
					<div
						class="flex flex-1 flex-col" :class="[
							IS_MANY_DETENTS || getInitDetent() === MEDIUM_DETENT
								? 'min-h-[50svh]'
								: 'min-h-[calc(100svh-24px)]',
						]"
					>
						<header class="p-2 flex flex-shrink-0 w-full items-center top-0 justify-center sticky">
							<button
								v-if="showDragIndicator"
								class="text-orange border-1.5 border-orange bg-orange bg-op-20 h-4 w-12 bg-lines"
								tabindex="0"
								@click="handleDragIndicator"
							/>
						</header>
						<div class="flex flex-1 flex-col items-center justify-center">
							<slot />
						</div>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<style>
.sheet-shadow {
	background: rgba(0, 0, 0, 0.1);
}

.sheet-enter-active,
.sheet-leave-active {
	transition: 0.35s var(--anime);
}

.sheet-enter-from,
.sheet-leave-to {
	background: rgba(0, 0, 0, 0);
}

.sheet-body {
	transition: 0.35s var(--anime);
}

.sheet-enter-from .sheet-body,
.sheet-leave-to .sheet-body {
	transform: translateY(100%);
}
</style>
