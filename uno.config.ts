import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import {
	defineConfig,
	presetIcons,
	presetWind4,
} from 'unocss'

export default defineConfig({
	shortcuts: [
		['bg-primary', 'bg-[#f7f7f2f5] dark:bg-[hsl(218,_13%,_7.5%)]'],
		['inpt', 'px-3 py-2 border-2 rounded-md w-full'],
		['link', 'text-blue underline underline-dashed'],
	],
	rules: [
		['scrolling-touch', { '-webkit-overflow-scrolling': 'touch' }],
		['scrollbar-stable', { 'scrollbar-gutter': 'stable' }],
		['btn-shadow', { 'box-shadow': '.15rem .20rem 0 0 currentColor' }],
		['bg-lines', {
			'background-image': 'linear-gradient(135deg, color-mix(in oklch, currentColor var(--line-op, 100%), transparent) 12.5%, transparent 12.5%, transparent 50%, color-mix(in oklch, currentColor var(--line-op, 100%), transparent) 50%, color-mix(in oklch, currentColor var(--line-op, 100%), transparent) 62.5%, transparent 62.5%, transparent 100%)',
			'background-size': '.6rem .6rem',
		}],
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
