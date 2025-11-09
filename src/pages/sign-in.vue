<script setup lang="ts">
const router = useRouter()
const route = useRoute()
const pb = usePb()

const form = reactive({
	idle: true,
	email: '',
	password: '',
	err: '',
})

async function handleSignIn() {
	form.err = ''
	form.idle = false

	try {
		const { email, password } = form
		await pb.collection('user').authWithPassword(email, password)
		// Redirect to original destination or home
		const redirect = route.query.redirect as string
		await router.push(redirect || '/')
	}
	catch (err: any) {
		form.err = err.message || 'Failed to sign in'
	}
	finally {
		form.idle = true
	}
}
</script>

<template>
	<main class="mx-auto p-4 flex flex-1 flex-col gap-4 max-w-[300px] w-full">
		<article class="flex flex-col gap-4">
			<h1 class="text-[2rem]">
				the-paper
			</h1>

			<form class="flex flex-col gap-3" @submit.prevent="handleSignIn">
				<div>
					<label for="email" class="text-sm font-medium">
						Email
					</label>
					<input
						id="email"
						v-model="form.email"
						type="email"
						required
						class="mt-1 px-3 py-2 border rounded-md w-full"
					/>
				</div>

				<div>
					<label for="password" class="text-sm font-medium">
						Password
					</label>
					<input
						id="password"
						v-model="form.password"
						type="password"
						required
						class="mt-1 px-3 py-2 border rounded-md w-full"
					/>
				</div>

				<section class="flex flex-col min-h-5">
					<div v-if="form.err" class="text-sm text-red-600">
						{{ form.err }}
					</div>
				</section>

				<button
					type="submit"
					:disabled="!form.idle"
					class="px-3 py-2 border rounded-md"
				>
					{{ !form.idle ? 'Signing in...' : 'Sign In' }}
				</button>
			</form>
		</article>
	</main>
</template>
