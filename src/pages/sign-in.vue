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
	<div class="flex min-h-screen items-center justify-center">
		<div class="p-8 max-w-md w-full space-y-8">
			<div>
				<h2 class="text-3xl font-bold text-center">
					Sign In
				</h2>
			</div>

			<form class="mt-8 space-y-6" @submit.prevent="handleSignIn">
				<div class="space-y-4">
					<div>
						<label for="email" class="text-sm font-medium block">
							Email
						</label>
						<input
							id="email"
							v-model="form.email"
							type="email"
							required
							class="mt-1 px-3 py-2 border border-gray-300 rounded-md w-full block"
						/>
					</div>

					<div>
						<label for="password" class="text-sm font-medium block">
							Password
						</label>
						<input
							id="password"
							v-model="form.password"
							type="password"
							required
							class="mt-1 px-3 py-2 border border-gray-300 rounded-md w-full block"
						/>
					</div>
				</div>

				<div v-if="form.err" class="text-sm text-red-600">
					{{ form.err }}
				</div>

				<button
					type="submit"
					:disabled="!form.idle"
					class="text-white px-4 py-2 border border-transparent rounded-md bg-blue-600 w-full hover:bg-blue-700 disabled:opacity-50"
				>
					{{ !form.idle ? 'Signing in...' : 'Sign In' }}
				</button>
			</form>
		</div>
	</div>
</template>
