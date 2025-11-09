<script setup lang="ts">
import AppSuspense from '~/app-suspense.vue'

useAppStore()
</script>

<template>
	<Suspense>
		<AppSuspense />

		<template #fallback>
			{{ $t('Loading') }}...
		</template>
	</Suspense>
</template>
