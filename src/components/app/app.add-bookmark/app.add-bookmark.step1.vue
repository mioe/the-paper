<script setup lang="ts">
import Btn from '~/components/_common/btn.vue'
import { fetchUrlMetadata } from '~/services/bookmark.service'

const appAddBookmarkStore = useAppAddBookmark()
const formRef = shallowRef<HTMLFormElement | null>(null)
const loading = computed(() => !appAddBookmarkStore.form.idle)

function handleEnterSubmit() {
	formRef.value?.submit()
}

async function onSubmit() {
	if (!appAddBookmarkStore.form.href?.trim()) {
		console.error('🦕 onSubmit, value is empty')
		return
	}

	appAddBookmarkStore.form.idle = false
	try {
		appAddBookmarkStore.metadata = await fetchUrlMetadata(appAddBookmarkStore.form.href)
	}
	catch (err) {
		console.error('🦕 Error fetching metadata:', err)
	}
	finally {
		appAddBookmarkStore.form.idle = true
	}
}
</script>

<template>
	<form ref="formRef" class="flex flex-col gap-3" @submit.prevent="onSubmit">
		<h2>{{ $t('Add bookmark') }}</h2>

		<div>
			<label for="href" class="text-sm font-medium">
				{{ $t('Enter URL') }}
			</label>
			<input
				id="href"
				v-model="appAddBookmarkStore.form.href"
				type="url"
				placeholder="https://example.com"
				required
				class="mt-1 inpt"
				@keyup.enter="handleEnterSubmit"
			/>
		</div>

		<Btn
			type="submit"
			:disabled="loading"
			tabindex="0"
		>
			{{ loading ? `${$t('Loading')}...` : $t('Fetch metadata') }}
		</Btn>
	</form>
</template>
