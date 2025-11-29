<script setup lang="ts">
import { useElementBounding, useElementByPoint, useEventListener, useMouse } from '@vueuse/core'

type CSSProp = Record<string, string | number>

const { x, y } = useMouse({ type: 'client' })
const { element } = useElementByPoint({ x, y })
const bounding = reactive(useElementBounding(element))
useEventListener('scroll', bounding.update, true)

const pointStyles = computed<CSSProp>(() => ({
	position: 'fixed',
	left: '0px',
	top: '0px',
	pointerEvents: 'none',
	zIndex: 9999,
	transform: `translate(calc(${x.value}px - 50%), calc(${y.value}px - 50%))`,
}))
</script>

<template>
	<Teleport to="body">
		<div class="rounded-full bg-red h-2 w-2" :style="pointStyles" />
	</Teleport>
</template>
