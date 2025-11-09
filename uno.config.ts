import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import {
	defineConfig,
	presetIcons,
	presetWind4,
} from 'unocss'

export default defineConfig({
	shortcuts: [
		['body-primary', 'bg-[#f7f7f2f5] dark:bg-[hsl(218,_13%,_7.5%)] text-gray-700 dark:text-gray-300'],
		['link', 'text-blue underline underline-dashed'],
	],
	rules: [
		['scrolling-touch', { '-webkit-overflow-scrolling': 'touch' }],
	],
	presets: [
		presetWind4({
			preflights: {
				reset: true,
			},
		}),
		presetIcons({
			warn: true,
			collections: {
				mi: FileSystemIconLoader('./src/assets/icons'),
			},
		}),
	],
})
