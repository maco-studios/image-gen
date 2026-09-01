<script setup lang="ts">
import { ref, watch } from 'vue'
import MenuForm from './components/MenuForm.vue'
import StoryCanvas from './components/StoryCanvas.vue'
import { fileStamp, loadMenu, saveMenu, type MenuData } from './menu'
import { STORY_HEIGHT, STORY_WIDTH } from './storyDraw'

const menu = ref<MenuData>(loadMenu())
const preview = ref<{ exportPng: () => Promise<string> } | null>(null)
const exporting = ref(false)
const error = ref('')

watch(
  menu,
  (value) => {
    saveMenu(value)
  },
  { deep: true },
)

async function downloadStory() {
  if (!preview.value || exporting.value) return
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
    link.download = `cardapio-${fileStamp(menu.value)}.png`
    link.click()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Não foi possível gerar a imagem.'
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="page">
    <header class="mast">
      <p class="kicker">Família Chico Gastrobar</p>
      <h1>Cardápio do dia</h1>
      <p class="lede">Preencha o prato de hoje e baixe o anúncio pronto para o Stories.</p>
    </header>

    <div class="workspace">
      <section class="desk" aria-label="Dados do cardápio">
        <MenuForm v-model="menu" />
        <button class="download" type="button" :disabled="exporting" @click="downloadStory">
          <i class="fa-solid fa-download" aria-hidden="true"></i>
          {{ exporting ? 'Gerando imagem…' : 'Baixar Stories' }}
        </button>
        <p v-if="error" class="error" role="alert">{{ error }}</p>
        <p class="hint">Arquivo PNG 1080×1920, formato Instagram Stories.</p>
      </section>

      <section class="stage" aria-label="Prévia do anúncio">
        <div class="phone">
          <div class="phone__screen">
            <StoryCanvas ref="preview" :menu="menu" live />
          </div>
          <p class="parallax-hint">
            <i class="fa-solid fa-up-down-left-right" aria-hidden="true"></i>
            Passe o mouse na prévia para o efeito de profundidade.
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100svh;
  padding: 2rem 1.5rem 3rem;
  box-sizing: border-box;
}

.mast {
  max-width: 1180px;
  margin: 0 auto 1.75rem;
}

.kicker {
  margin: 0 0 0.35rem;
  color: #f0b429;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.mast h1 {
  margin: 0;
  font-weight: 800;
  font-size: clamp(2.4rem, 5vw, 4.2rem);
  letter-spacing: -0.03em;
  color: #f6ead6;
  line-height: 0.95;
}

.lede {
  margin: 0.7rem 0 0;
  max-width: 36rem;
  color: #d7c2a0;
}

.workspace {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(280px, 420px) minmax(280px, 1fr);
  gap: 1.5rem;
  align-items: start;
}

.desk {
  background: #2a2118;
  border: 1px solid #6a5132;
  padding: 1.25rem;
  box-shadow: 8px 12px 0 #120e0a;
}

.download {
  margin-top: 1.25rem;
  width: 100%;
  border: 0;
  background: #f0b429;
  color: #1a1208;
  font: inherit;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.95rem 1rem;
  cursor: pointer;
  box-shadow: 0 4px 0 #9a6d10;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}

.download:hover:not(:disabled) {
  background: #ffc94a;
}

.download:disabled {
  opacity: 0.65;
  cursor: wait;
}

.download:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

.hint,
.error {
  margin: 0.75rem 0 0;
  font-size: 0.88rem;
}

.hint {
  color: #cbb89a;
}

.error {
  color: #ffb4a2;
}

.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.parallax-hint {
  margin: 0;
  font-size: 0.82rem;
  color: #cbb89a;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.phone {
  width: min(100%, 360px);
  background: #050505;
  border-radius: 36px;
  padding: 14px 12px 18px;
  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.45),
    inset 0 0 0 2px #2a2a2a;
}

.phone__screen {
  display: grid;
  aspect-ratio: 9 / 16;
  overflow: hidden;
  border-radius: 22px;
  background: #14110e;
}

@media (max-width: 920px) {
  .workspace {
    grid-template-columns: 1fr;
  }

  .stage {
    order: -1;
  }
}
</style>
