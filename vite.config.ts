import VueI18n from '@intlify/unplugin-vue-i18n/vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Unocss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import vueDevTools from 'vite-plugin-vue-devtools'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
	console.warn('🦕 vite.config.ts/defineConfig', command, mode)

	return {
		resolve: {
			alias: {
				'~/': `${path.resolve(__dirname, 'src')}/`,
			},
		},

		plugins: [
			// https://github.com/vuejs/devtools
			vueDevTools(),

			// https://github.com/posva/unplugin-vue-router
			VueRouter({
				dts: 'src/typed-router.d.ts',
			}),

			// 🦕 Vue must be placed after VueRouter()
			vue(),

			// https://github.com/unocss/unocss
			Unocss(),

			// https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n
			VueI18n({
				runtimeOnly: true,
				compositionOnly: true,
				fullInstall: true,
				include: [path.resolve(__dirname, 'locales/**')],
			}),

			// https://github.com/antfu/unplugin-auto-import
			AutoImport({
				imports: [
					'vue',
					'vue-router',
					'vue-i18n',
					'@vueuse/core',
				],
				dts: 'src/auto-imports.d.ts',
				dirs: [
					'src/composables',
					'src/stores',
				],
				vueTemplate: true,
			}),

			// https://github.com/antfu/vite-plugin-pwa
			VitePWA({
				registerType: 'autoUpdate',
				injectRegister: 'auto',
				workbox: {
					maximumFileSizeToCacheInBytes: 3000000,
				},
				includeAssets: [
					'assets/fonts/**/*.ttf',
					'favicons/*.png',
					'favicons/*.ico',
				],
				manifest: {
					name: 'the-paper',
					short_name: 'the-paper',
					theme_color: '#000000',
					icons: [
						{
							src: '/favicons/web-app-manifest-192x192.png',
							sizes: '192x192',
							type: 'image/png',
							purpose: 'maskable',
						},
						{
							src: '/favicons/web-app-manifest-512x512.png',
							sizes: '512x512',
							type: 'image/png',
							purpose: 'maskable',
						},
					],
				},
			}),
		],
	}
})
