<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import MenuForm from './components/MenuForm.vue'
import StoryCanvas from './components/StoryCanvas.vue'
import { fileStamp, loadMenu, saveMenu, type MenuData, type StoryKind } from './menu'
import { photoFromFile } from './photo'
import { STORY_HEIGHT, STORY_WIDTH } from './storyDraw'

const menu = ref<MenuData>(loadMenu())
const preview = ref<{ exportPng: () => Promise<string> } | null>(null)
const hero = ref<HTMLCanvasElement | null>(null)
const exporting = ref(false)
const error = ref('')
const menuOpen = ref(false)
const pickerOpen = ref(false)
const cameraInput = ref<HTMLInputElement | null>(null)
const galleryInput = ref<HTMLInputElement | null>(null)

const photoMode = computed(() => menu.value.kind === 'photo')

watch(
  menu,
  (value) => {
    saveMenu(value)
  },
  { deep: true },
)

watch([menuOpen, pickerOpen], () => {
  document.body.style.overflow = menuOpen.value || pickerOpen.value ? 'hidden' : ''
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})

function setKind(kind: StoryKind) {
  menu.value.kind = kind
  error.value = ''
  pickerOpen.value = false
}

function openPicker() {
  if (!photoMode.value) return
  error.value = ''
  pickerOpen.value = true
}

function closeOverlays() {
  menuOpen.value = false
  pickerOpen.value = false
}

function pickCamera() {
  pickerOpen.value = false
  cameraInput.value?.click()
}

function pickGallery() {
  pickerOpen.value = false
  galleryInput.value?.click()
}

async function onPhoto(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  error.value = ''
  try {
    hero.value = await photoFromFile(file)
  } catch (err) {
    hero.value = null
    error.value = err instanceof Error ? err.message : 'Não foi possível ler a foto.'
  }
}

function clearPhoto() {
  hero.value = null
  pickerOpen.value = false
}

async function downloadStory() {
  if (!preview.value || exporting.value) return
  if (photoMode.value && !hero.value) {
    error.value = 'Toque na prévia e escolha uma foto do prato.'
    pickerOpen.value = true
    return
  }
  exporting.value = true
  error.value = ''
  try {
    const dataUrl = await preview.value.exportPng()
    const probe = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = reject
      image.src = dataUrl
    })
    if (probe.naturalWidth !== STORY_WIDTH || probe.naturalHeight !== STORY_HEIGHT) {
      throw new Error('A imagem não saiu em 1080×1920.')
    }
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `${photoMode.value ? 'prato' : 'cardapio'}-${fileStamp(menu.value)}.png`
    link.click()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Não foi possível gerar a imagem.'
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="studio" :class="{ 'studio--photo': photoMode }">
    <section class="stage" aria-label="Prévia do anúncio">
      <div class="frame">
        <StoryCanvas ref="preview" :menu="menu" :hero="hero" :live="!photoMode" />
        <button
          v-if="photoMode"
          class="shutter"
          type="button"
          @click="openPicker"
        >
          <span class="shutter__badge">
            <i class="fa-solid fa-camera" aria-hidden="true"></i>
            {{ hero ? 'Trocar foto' : 'Tirar ou anexar foto' }}
          </span>
        </button>
      </div>
    </section>

    <nav class="dock" aria-label="Ações">
      <button class="dock__btn" type="button" :aria-expanded="menuOpen" @click="menuOpen = true">
        <i class="fa-solid fa-sliders" aria-hidden="true"></i>
        <span>Menu</span>
      </button>
      <button class="dock__btn dock__btn--gold" type="button" :disabled="exporting" @click="downloadStory">
        <i class="fa-solid fa-download" aria-hidden="true"></i>
        <span>{{ exporting ? 'Gerando…' : 'Baixar' }}</span>
      </button>
      <button
        class="dock__btn"
        type="button"
        :aria-pressed="photoMode"
        @click="setKind(photoMode ? 'menu' : 'photo')"
      >
        <i :class="photoMode ? 'fa-solid fa-list' : 'fa-solid fa-camera'" aria-hidden="true"></i>
        <span>{{ photoMode ? 'Cardápio' : 'Foto' }}</span>
      </button>
    </nav>

    <p v-if="error" class="toast" role="alert">{{ error }}</p>

    <div v-if="pickerOpen" class="veil" @click="pickerOpen = false">
      <div class="sheet" role="dialog" aria-labelledby="picker-title" @click.stop>
        <p id="picker-title" class="sheet__kicker">Foto do prato</p>
        <h2 class="sheet__title">Como quer colocar a foto?</h2>
        <button class="choice" type="button" @click="pickCamera">
          <i class="fa-solid fa-camera" aria-hidden="true"></i>
          <span>
            <strong>Tirar foto</strong>
            <small>Abre a câmera do celular</small>
          </span>
        </button>
        <button class="choice" type="button" @click="pickGallery">
          <i class="fa-solid fa-paperclip" aria-hidden="true"></i>
          <span>
            <strong>Anexar</strong>
            <small>Escolher da galeria ou arquivos</small>
          </span>
        </button>
        <button v-if="hero" class="sheet__ghost" type="button" @click="clearPhoto">Remover foto</button>
        <button class="sheet__ghost" type="button" @click="pickerOpen = false">Cancelar</button>
      </div>
    </div>

    <div v-if="menuOpen" class="veil" @click="closeOverlays">
      <aside class="drawer" aria-label="Dados do cardápio" @click.stop>
        <header class="drawer__head">
          <div>
            <p class="drawer__kicker">Família Chico Gastrobar</p>
            <h2>{{ photoMode ? 'Prato do dia' : 'Cardápio do dia' }}</h2>
          </div>
          <button class="drawer__close" type="button" aria-label="Fechar menu" @click="menuOpen = false">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </header>
        <div class="modes" role="tablist" aria-label="Tipo de Stories">
          <button
            type="button"
            role="tab"
            class="modes__btn"
            :aria-selected="menu.kind === 'menu'"
            :class="{ 'modes__btn--on': menu.kind === 'menu' }"
            @click="setKind('menu')"
          >
            Cardápio
          </button>
          <button
            type="button"
            role="tab"
            class="modes__btn"
            :aria-selected="menu.kind === 'photo'"
            :class="{ 'modes__btn--on': menu.kind === 'photo' }"
            @click="setKind('photo')"
          >
            Foto
          </button>
        </div>
        <MenuForm v-model="menu" />
      </aside>
    </div>

    <input
      ref="cameraInput"
      class="sr"
      type="file"
      accept="image/*"
      capture="environment"
      @change="onPhoto"
    />
    <input ref="galleryInput" class="sr" type="file" accept="image/*" @change="onPhoto" />
  </div>
</template>

<style scoped>
.studio {
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 1rem 1rem 6.5rem;
}

.stage {
  width: min(100%, 420px);
}

.frame {
  position: relative;
  background: #050505;
  border-radius: 28px;
  padding: 10px;
  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.45),
    inset 0 0 0 2px #2a2a2a;
}

.frame :deep(.story) {
  width: 100%;
  height: auto;
  aspect-ratio: 9 / 16;
  display: block;
  border-radius: 18px;
  background: #14110e;
}

.shutter {
  position: absolute;
  inset: 10px;
  border: 0;
  border-radius: 18px;
  background: transparent;
  cursor: pointer;
  display: grid;
  place-items: center;
}

.shutter:focus-visible {
  outline: 2px solid #f0b429;
  outline-offset: 3px;
}

.shutter__badge {
  pointer-events: none;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  background: rgba(10, 7, 4, 0.88);
  color: #ffc43a;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.82rem;
  padding: 1.1rem 1.25rem;
  border: 1px solid #f0b429;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
  min-width: 11rem;
}

.shutter__badge i {
  font-size: 1.7rem;
}

.dock {
  position: fixed;
  left: 50%;
  bottom: max(1.25rem, env(safe-area-inset-bottom));
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  gap: 0.35rem;
  padding: 0.45rem;
  background: rgba(18, 12, 8, 0.94);
  border: 1px solid #6a5132;
  border-radius: 999px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
}

.dock__btn {
  border: 0;
  background: transparent;
  color: #f6ead6;
  min-width: 4.6rem;
  padding: 0.55rem 0.7rem;
  cursor: pointer;
  display: grid;
  justify-items: center;
  gap: 0.2rem;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dock__btn i {
  font-size: 1.1rem;
}

.dock__btn--gold {
  background: #f0b429;
  color: #1a1208;
  border-radius: 999px;
}

.dock__btn:disabled {
  opacity: 0.65;
  cursor: wait;
}

.dock__btn:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 6.2rem;
  transform: translateX(-50%);
  z-index: 21;
  margin: 0;
  max-width: min(92vw, 28rem);
  background: #3a1c14;
  color: #ffb4a2;
  padding: 0.7rem 1rem;
  border: 1px solid #ffb4a2;
}

.veil {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgba(6, 3, 1, 0.62);
  display: grid;
  align-items: end;
  justify-items: center;
}

.sheet,
.drawer {
  width: min(100%, 420px);
  background: #2a2118;
  border: 1px solid #6a5132;
  padding: 1.25rem 1.25rem calc(1.25rem + env(safe-area-inset-bottom));
  box-shadow: 0 -16px 40px rgba(0, 0, 0, 0.4);
}

.sheet__kicker,
.drawer__kicker {
  margin: 0;
  color: #f0b429;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.sheet__title,
.drawer__head h2 {
  margin: 0.35rem 0 1rem;
  font-size: 1.35rem;
  letter-spacing: -0.03em;
}

.choice {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  text-align: left;
  border: 1px solid #6a5132;
  background: #1a140f;
  color: inherit;
  padding: 0.9rem 1rem;
  margin-bottom: 0.6rem;
  cursor: pointer;
}

.choice i {
  width: 2.2rem;
  height: 2.2rem;
  display: grid;
  place-items: center;
  background: #f0b429;
  color: #1a1208;
  font-size: 1rem;
}

.choice strong {
  display: block;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.choice small {
  display: block;
  color: #cbb89a;
  font-size: 0.82rem;
}

.sheet__ghost {
  display: block;
  width: 100%;
  margin-top: 0.35rem;
  border: 0;
  background: none;
  color: #d7c2a0;
  cursor: pointer;
  padding: 0.55rem;
}

.drawer {
  max-height: min(88svh, 820px);
  overflow: auto;
}

.drawer__head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: start;
}

.drawer__close {
  border: 1px solid #6a5132;
  background: #1a140f;
  color: #f6ead6;
  width: 2.4rem;
  height: 2.4rem;
  cursor: pointer;
}

.modes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin: 0 0 1.25rem;
}

.modes__btn {
  border: 1px solid #6a5132;
  background: #1a140f;
  color: #d7c2a0;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.7rem 0.5rem;
  cursor: pointer;
}

.modes__btn--on {
  background: #f0b429;
  border-color: #f0b429;
  color: #1a1208;
}

.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

@media (min-width: 720px) {
  .veil {
    align-items: center;
  }

  .sheet,
  .drawer {
    box-shadow: 8px 12px 0 #120e0a;
  }
}
</style>
