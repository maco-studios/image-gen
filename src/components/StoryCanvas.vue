<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { MenuData } from '../menu'
import { drawStory, prepareStoryAssets, STORY_HEIGHT, STORY_WIDTH } from '../storyDraw'

const props = defineProps<{
  menu: MenuData
  live?: boolean
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
const tx = ref(0)
const ty = ref(0)
let frame = 0
let ready = false

function paint() {
  const el = canvas.value
  if (!el || !ready) return
  const ctx = el.getContext('2d')
  if (!ctx) return
  drawStory(ctx, props.menu, props.live ? tx.value : 0, props.live ? ty.value : 0)
}

function setOffset(nextX: number, nextY: number) {
  if (frame) cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    tx.value = nextX
    ty.value = nextY
    paint()
  })
}

function onPointerMove(event: PointerEvent) {
  if (!props.live || !canvas.value) return
  const box = canvas.value.getBoundingClientRect()
  const x = ((event.clientX - box.left) / box.width - 0.5) * 2
  const y = ((event.clientY - box.top) / box.height - 0.5) * 2
  setOffset(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y)))
}

function onPointerLeave() {
  if (!props.live) return
  setOffset(0, 0)
}

onMounted(async () => {
  await prepareStoryAssets()
  ready = true
  paint()
})

watch(
  () => props.menu,
  () => paint(),
  { deep: true },
)

onBeforeUnmount(() => {
  if (frame) cancelAnimationFrame(frame)
})

async function exportPng() {
  await prepareStoryAssets()
  ready = true
  const el = canvas.value
  if (!el) throw new Error('Prévia ainda não está pronta.')
  const previousX = tx.value
  const previousY = ty.value
  tx.value = 0
  ty.value = 0
  paint()
  const dataUrl = el.toDataURL('image/png')
  tx.value = previousX
  ty.value = previousY
  paint()
  return dataUrl
}

defineExpose({ exportPng, canvas })
</script>

<template>
  <canvas
    ref="canvas"
    class="story"
    :class="{ 'story--live': live }"
    :width="STORY_WIDTH"
    :height="STORY_HEIGHT"
    aria-hidden="true"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
  />
</template>

<style scoped>
.story {
  width: 100%;
  height: 100%;
  display: block;
  background: #090704;
  touch-action: none;
}
</style>
