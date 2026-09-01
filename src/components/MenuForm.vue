<script setup lang="ts">
import { computed } from 'vue'
import {
  WEEKDAYS,
  dateLabelFromDate,
  isoFromDate,
  parseIsoDate,
  weekdayFromDate,
  type MenuData,
} from '../menu'

const menu = defineModel<MenuData>({ required: true })

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

    <label v-if="menu.kind === 'menu'" class="field">
      <span><i class="fa-solid fa-star" aria-hidden="true"></i> Opção</span>
      <input v-model="menu.option" type="text" />
    </label>

    <label v-if="menu.kind === 'announce'" class="field">
      <span><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Título</span>
      <input v-model="menu.headline" type="text" placeholder="AVISO" />
    </label>

    <label v-if="menu.kind === 'announce'" class="field">
      <span><i class="fa-solid fa-align-left" aria-hidden="true"></i> Mensagem</span>
      <textarea v-model="menu.message" rows="6" spellcheck="true" />
      <small>Texto livre. Use para avisos, horários ou recados.</small>
    </label>

    <label v-if="menu.kind !== 'announce'" class="field">
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
