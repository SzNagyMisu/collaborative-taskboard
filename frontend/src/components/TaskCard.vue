<script setup lang="ts">
import { ref, watch } from 'vue'

type Status = 'To Do' | 'In Progress' | 'Done'

type Size = 'XS' | 'S' | 'M' | 'L' | 'XL'

const props = defineProps<{
  title: string
  status: Status
  size: Size
}>()

const emit = defineEmits<{
  'update:title': [value: string]
  'update:status': [value: Status]
  'update:size': [value: Size]
}>()

const isEditingTitle = ref(false)
const localTitle = ref(props.title)

watch(
  () => props.title,
  (newTitle) => {
    if (!isEditingTitle.value) {
      localTitle.value = newTitle
    }
  }
)

const startEditingTitle = () => {
  isEditingTitle.value = true
}

const finishEditingTitle = () => {
  const trimmed = localTitle.value.trim()
  const nextTitle = trimmed.length > 0 ? trimmed : props.title
  localTitle.value = nextTitle
  emit('update:title', nextTitle)
  isEditingTitle.value = false
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    finishEditingTitle()
  } else if (event.key === 'Escape') {
    localTitle.value = props.title
    isEditingTitle.value = false
  }
}

const statusOptions: Status[] = ['To Do', 'In Progress', 'Done']
const sizeOptions: Size[] = ['XS', 'S', 'M', 'L', 'XL']

const handleStatusChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value as Status
  emit('update:status', value)
}

const handleSizeChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value as Size
  emit('update:size', value)
}
</script>

<template>
  <article class="card">
    <div class="card-header">
      <input
        v-if="isEditingTitle"
        v-model="localTitle"
        class="card-title-input"
        type="text"
        @blur="finishEditingTitle"
        @keydown="handleKeydown"
      >
      <h3
        v-else
        class="card-title"
        @click="startEditingTitle"
      >
        {{ localTitle }}
      </h3>
    </div>

    <div class="card-meta">
      <label class="card-field">
        <span class="card-label">Status</span>
        <select
          class="card-select card-pill card-pill-status"
          :value="props.status"
          @change="handleStatusChange"
        >
          <option
            v-for="option in statusOptions"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>
      </label>

      <label class="card-field">
        <span class="card-label">Size</span>
        <select
          class="card-select card-pill card-pill-size"
          :value="props.size"
          @change="handleSizeChange"
        >
          <option
            v-for="option in sizeOptions"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>
      </label>
    </div>
  </article>
</template>

<style scoped>
.card {
  background: linear-gradient(135deg, #020617, #020617);
  border-radius: 0.7rem;
  padding: 0.75rem 0.8rem;
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow:
    0 10px 25px rgba(15, 23, 42, 0.7),
    inset 0 0 0 1px rgba(15, 23, 42, 0.95);
  transition:
    transform 150ms ease,
    box-shadow 150ms ease,
    border-color 150ms ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 16px 30px rgba(15, 23, 42, 0.9),
    inset 0 0 0 1px rgba(15, 23, 42, 0.98);
  border-color: rgba(96, 165, 250, 0.7);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
  margin-bottom: 0.35rem;
}

.card-title,
.card-title-input {
  margin: 0 0 0.4rem 0;
  font-size: 0.95rem;
  font-weight: 500;
  color: #e5e7eb;
}

.card-title {
  cursor: text;
}

.card-title-input {
  flex: 1;
  padding: 0.25rem 0.35rem;
  border-radius: 0.4rem;
  border: 1px solid rgba(148, 163, 184, 0.7);
  background: rgba(15, 23, 42, 0.9);
  color: #e5e7eb;
  outline: none;
}

.card-title-input:focus {
  border-color: rgba(96, 165, 250, 0.9);
  box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.5);
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.card-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.16rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
}

.card-pill-status {
  background: rgba(96, 165, 250, 0.16);
  color: #bfdbfe;
  border: 1px solid rgba(96, 165, 250, 0.6);
}

.card-pill-size {
  background: rgba(52, 211, 153, 0.16);
  color: #a7f3d0;
  border: 1px solid rgba(52, 211, 153, 0.6);
}

.card-field {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  font-size: 0.7rem;
}

.card-label {
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.card-select {
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, #9ca3af 50%),
    linear-gradient(135deg, #9ca3af 50%, transparent 50%);
  background-position:
    calc(100% - 10px) 55%,
    calc(100% - 6px) 55%;
  background-size:
    5px 5px,
    5px 5px;
  background-repeat: no-repeat;
  padding-right: 1.3rem;
  cursor: pointer;
}
</style>

