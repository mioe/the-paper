<script setup lang="ts">
import SheetDragIndicator from '~/components/_common/sheet/sheet.drag-indicator.vue'
import Sheet from '~/components/_common/sheet/sheet.vue'
import Step1 from '~/components/app/app.add-bookmark/app.add-bookmark.step1.vue'

const sheetRef = shallowRef<InstanceType<typeof Sheet> | null>(null)

const appAddBookmarkStore = useAppAddBookmark()
const detents = computed<('medium' | 'large')[]>(() =>
	appAddBookmarkStore.state.step < 1 ? ['medium'] : ['large'],
)
const currentStep = computed(() => appAddBookmarkStore.state.step)

function open() {
	sheetRef.value?.open()
}

function close() {
	sheetRef.value?.close()
}

function onAfterClose() {
	appAddBookmarkStore.$reset()
}

function handleSubmitFirstStep() {
	appAddBookmarkStore.state.step = 1
}

function handleSubmitSecondStep() {
	appAddBookmarkStore.state.step = 2
}

function handleSubmitThirdStep() {
	appAddBookmarkStore.state.step = 0
}

watch(currentStep, (val) => {
	sheetRef.value?.setFull(val > 0)
})

defineExpose({
	open,
	close,
})
</script>

<template>
	<Sheet ref="sheetRef" :detents drag-indicator="visible" @after-close="onAfterClose">
		<header class="mb-auto flex gap-4">
			<SheetDragIndicator
				v-for="i in [0, 1, 2] as (0 | 1 | 2)[]"
				:key="`step-${i + 1}`"
				:class="{
					'op-10': currentStep !== i,
					'text-orange bg-orange bg-op-20': currentStep === i,
				}"
				@click="appAddBookmarkStore.state.step = i"
			/>
		</header>

		<Step1 v-if="currentStep === 0" />

		<section v-else-if="currentStep === 1">
			STEP 1
			<button @click="handleSubmitSecondStep">
				go to 2
			</button>
		</section>

		<section v-else-if="currentStep === 2">
			STEP 2
			<button @click="handleSubmitThirdStep">
				go to 0
			</button>
		</section>

		<footer class="mt-auto op-0 flex">
			by mioe
		</footer>
	</Sheet>
</template>
