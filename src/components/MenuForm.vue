<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  WEEKDAYS,
  dateLabelFromDate,
  isoFromDate,
  parseIsoDate,
  weekdayFromDate,
  type MenuData,
} from '../menu'

const menu = defineModel<MenuData>({ required: true })
const props = defineProps<{
  hasPhoto?: boolean
}>()
const emit = defineEmits<{
  photo: [file: File]
  clearPhoto: []
}>()

const cameraInput = ref<HTMLInputElement | null>(null)
const galleryInput = ref<HTMLInputElement | null>(null)

const isoDate = computed({
  get() {
    const [d, m] = menu.value.dateLabel.split('/')
    const year = new Date().getFullYear()
    if (!d || !m) return isoFromDate(new Date())
    return `${year}-${m}-${d}`
  },
  set(value: string) {
    const date = parseIsoDate(value)
    menu.value.dateLabel = dateLabelFromDate(date)
    menu.value.weekday = weekdayFromDate(date)
  },
})

function onFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) emit('photo', file)
}
</script>

<template>
  <form class="form" @submit.prevent>
    <label class="field">
      <span><i class="fa-solid fa-calendar-day" aria-hidden="true"></i> Dia do cardápio</span>
      <input v-model="isoDate" type="date" />
    </label>

    <label class="field">
      <span><i class="fa-solid fa-clock" aria-hidden="true"></i> Dia da semana</span>
      <select v-model="menu.weekday">
        <option v-for="day in WEEKDAYS" :key="day" :value="day">{{ day }}</option>
      </select>
    </label>

    <label v-if="menu.kind === 'menu'" class="field">
      <span><i class="fa-solid fa-utensils" aria-hidden="true"></i> Pratos do dia</span>
      <textarea v-model="menu.items" rows="6" spellcheck="false" />
      <small>Um prato por linha.</small>
    </label>

    <div v-else class="field">
      <span><i class="fa-solid fa-camera" aria-hidden="true"></i> Foto do prato</span>
      <div class="shot">
        <button class="shot__btn" type="button" @click="cameraInput?.click()">
          <i class="fa-solid fa-camera" aria-hidden="true"></i>
          Tirar foto
        </button>
        <button class="shot__btn shot__btn--ghost" type="button" @click="galleryInput?.click()">
          <i class="fa-solid fa-image" aria-hidden="true"></i>
          Galeria
        </button>
      </div>
      <button v-if="hasPhoto" class="shot__clear" type="button" @click="emit('clearPhoto')">
        Remover foto
      </button>
      <small>No celular, use a câmera. A foto entra no centro do Stories, com a identidade do Chico.</small>
      <input
        ref="cameraInput"
        class="sr"
        type="file"
        accept="image/*"
        capture="environment"
        @change="onFile"
      />
      <input ref="galleryInput" class="sr" type="file" accept="image/*" @change="onFile" />
    </div>

    <label v-if="menu.kind === 'menu'" class="field">
      <span><i class="fa-solid fa-star" aria-hidden="true"></i> Opção</span>
      <input v-model="menu.option" type="text" />
    </label>

    <label class="field">
      <span><i class="fa-solid fa-bullhorn" aria-hidden="true"></i> Chamada</span>
      <input v-model="menu.cta" type="text" />
    </label>

    <div class="pair">
      <label class="field">
        <span><i class="fa-solid fa-phone" aria-hidden="true"></i> Telefone</span>
        <input v-model="menu.phone1" type="text" inputmode="tel" />
      </label>
      <label class="field">
        <span><i class="fa-brands fa-whatsapp" aria-hidden="true"></i> WhatsApp</span>
        <input v-model="menu.phone2" type="text" inputmode="tel" />
      </label>
    </div>

    <label class="field">
      <span><i class="fa-solid fa-location-dot" aria-hidden="true"></i> Endereço</span>
      <input v-model="menu.address" type="text" />
    </label>
  </form>
</template>

<style scoped>
.form {
  display: grid;
  gap: 1.15rem;
  position: relative;
}

.pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}

.field {
  display: grid;
  gap: 0.4rem;
}

.field span {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #e7c27a;
}

.field span i {
  width: 1em;
  text-align: center;
}

.field small {
  color: #cbb89a;
  font-size: 0.8rem;
}

.shot {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}

.shot__btn {
  border: 1px solid #f0b429;
  background: #f0b429;
  color: #1a1208;
  font: inherit;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.8rem 0.6rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
}

.shot__btn--ghost {
  background: #1a140f;
  color: #f6ead6;
}

.shot__clear {
  justify-self: start;
  border: 0;
  background: none;
  color: #ffb4a2;
  padding: 0;
  cursor: pointer;
  font: inherit;
  font-size: 0.85rem;
}

.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

input,
select,
textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #5a4630;
  background: #1a140f;
  color: #f6ead6;
  border-radius: 4px;
  padding: 0.7rem 0.8rem;
  font: inherit;
  box-shadow: inset 0 1px 0 rgba(255, 214, 140, 0.06);
}

textarea {
  resize: vertical;
  min-height: 9rem;
  line-height: 1.45;
}

input:focus,
select:focus,
textarea:focus {
  outline: 2px solid #f0b429;
  outline-offset: 2px;
  border-color: #f0b429;
}

@media (max-width: 640px) {
  .pair {
    grid-template-columns: 1fr;
  }
}
</style>
