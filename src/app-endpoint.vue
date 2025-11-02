<script setup lang="ts">
import AppSuspense from '~/app-suspense.vue'
import AppHello from '~/components/app/app.hello.vue'

useAppStore()
</script>

<template>
	<AppHello />

	<Suspense>
		<AppSuspense />

		<template #fallback>
			{{ $t('Loading') }}...
		</template>
	</Suspense>
</template>
