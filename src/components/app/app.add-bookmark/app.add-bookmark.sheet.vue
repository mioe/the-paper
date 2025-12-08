<script setup lang="ts">
import Sheet from '~/components/_common/sheet.vue'

const sheetRef = ref<InstanceType<typeof Sheet> | null>(null)

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
		<section v-if="currentStep === 0">
			STEP 0
			<button @click="handleSubmitFirstStep">
				go to 1
			</button>
		</section>

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
	</Sheet>
</template>
