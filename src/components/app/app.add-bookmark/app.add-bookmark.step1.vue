<script setup lang="ts">
import Btn from '~/components/_common/btn.vue'

const appAddBookmarkStore = useAppAddBookmark()
const loading = computed(() => !appAddBookmarkStore.form.idle)

function onSubmit() {
	console.log('🦕 onSubmit')
}
</script>

<template>
	<form @submit.prevent="onSubmit">
		<h2>{{ $t('Add bookmark') }}</h2>

		<Btn
			type="submit"
			:disabled="loading"
			tabindex="0"
		>
			{{ loading ? `${$t('Loading')}...` : $t('Fetch metadata') }}
		</Btn>
	</form>
</template>
