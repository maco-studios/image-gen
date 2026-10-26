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
import { THEMES } from '../storyDraw'

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
    <section class="group">
      <h3>Tema</h3>
      <label class="field">
        <span><i class="fa-solid fa-palette" aria-hidden="true"></i> Visual</span>
        <select v-model="menu.theme">
          <option v-for="(t, id) in THEMES" :key="id" :value="id">{{ t.label }}</option>
        </select>
      </label>
    </section>

    <section class="group">
      <h3>Data</h3>
      <div class="pair">
    <label class="field">
      <span><i class="fa-solid fa-calendar-day" aria-hidden="true"></i> Data</span>
      <input v-model="isoDate" type="date" />
    </label>

    <label class="field">
      <span><i class="fa-solid fa-clock" aria-hidden="true"></i> Dia da semana</span>
      <select v-model="menu.weekday">
        <option v-for="day in WEEKDAYS" :key="day" :value="day">{{ day }}</option>
      </select>
    </label>
      </div>
    </section>

    <section class="group">
      <h3>Conteúdo</h3>

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

    </section>

    <section class="group">
      <h3>Contato</h3>
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
    </section>
  </form>
</template>

<style scoped>
.form {
  display: grid;
  gap: 1.75rem;
}

.group {
  display: grid;
  gap: 1.1rem;
  align-content: start;
}

.group h3 {
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #4a4a4a;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #a8a8a8;
}

.pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.field {
  display: grid;
  gap: 0.5rem;
}

.field span {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #b8b8b8;
}

.field span i {
  width: 1em;
  text-align: center;
}

.field small {
  color: #a8a8a8;
  font-size: 0.85rem;
}

input,
select,
textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #4a4a4a;
  background: #1e1e1e;
  color: #e6e6e6;
  border-radius: 2px;
  padding: 0.85rem 0.9rem;
  font-size: 1rem;
  font: inherit;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

textarea {
  resize: vertical;
  min-height: 9rem;
  line-height: 1.45;
}

input:focus,
select:focus,
textarea:focus {
  outline: 2px solid #2d8ceb;
  outline-offset: 2px;
  border-color: #2d8ceb;
}

@media (max-width: 640px) {
  .pair {
    grid-template-columns: 1fr;
  }
}
</style>
