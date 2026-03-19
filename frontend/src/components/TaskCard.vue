<script setup lang="ts">
type Status = 'To Do' | 'In Progress' | 'Done'

type Size = 'XS' | 'S' | 'M' | 'L' | 'XL'

const props = defineProps<{
  title: string
  status: Status
  size: Size
}>()
</script>

<template>
  <article class="card">
    <h3 class="card-title">
      {{ props.title }}
    </h3>
    <div class="card-meta">
      <span class="card-pill card-pill-status">
        {{ props.status }}
      </span>
      <span class="card-pill card-pill-size">
        Size: {{ props.size }}
      </span>
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

.card-title {
  margin: 0 0 0.4rem 0;
  font-size: 0.95rem;
  font-weight: 500;
  color: #e5e7eb;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
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
</style>

