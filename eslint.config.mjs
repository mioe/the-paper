import antfu from '@antfu/eslint-config'

export default antfu({
	type: 'app',
	typescript: true,
	formatters: true,
	unocss: true,
	vue: {
		overrides: {
			'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
			'vue/component-api-style': ['error', ['script-setup']],
			'vue/component-name-in-template-casing': ['error', 'PascalCase', { registeredComponentsOnly: false }],
			'vue/custom-event-name-casing': ['error', 'kebab-case', { ignores: ['/^[a-z]+(?:-[a-z]+)*:[a-z]+(?:-[a-z]+)*$/u'] }],
			'vue/define-macros-order': ['error', { order: ['defineOptions', 'defineProps', 'defineEmits', 'defineSlots'] }],
			'vue/html-indent': ['error', 'tab', { attribute: 1, baseIndent: 1, closeBracket: 0, alignAttributesVertically: true, ignores: [] }],
			'vue/html-self-closing': ['error', { html: { void: 'always', normal: 'any', component: 'always' }, svg: 'always', math: 'always' }],
			'vue/multi-word-component-names': 'off',
			'vue/next-tick-style': ['error', 'promise'],
			'vue/no-empty-component-block': 'error',
			'vue/no-required-prop-with-default': ['error', { autofix: false }],
			'vue/padding-line-between-blocks': ['error', 'always'],
			'vue/prefer-define-options': 'error',
			'vue/require-default-prop': 'off',
			'vue/require-macro-variable-name': ['error', { defineProps: 'props', defineEmits: 'emit', defineSlots: 'slots', useSlots: 'slots', useAttrs: 'attrs' }],
			'vue/require-typed-ref': 'error',
		},
	},
	stylistic: {
		indent: 'tab',
		semi: false,
		quotes: 'single',
	},
	ignores: [
		'**/migrations/*',
		'**/.pocketbase/**/*',
	],
}, {
	rules: {
		'no-console': ['warn'],
		'antfu/no-top-level-await': ['off'],
		'node/prefer-global/process': ['off'],
		'node/no-process-env': ['error'],
		'perfectionist/sort-imports': ['error', {
			tsconfigRootDir: '.',
		}],
		'unicorn/filename-case': ['error', {
			case: 'kebabCase',
			ignore: ['README.md', 'Cargo.toml', 'CLAUDE.md'],
		}],
	},
})
