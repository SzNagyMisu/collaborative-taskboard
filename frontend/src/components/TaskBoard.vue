<script setup lang="ts">
import { ref } from 'vue'
import TaskCard from './TaskCard.vue'

type Status = 'To Do' | 'In Progress' | 'Done'

type Size = 'XS' | 'S' | 'M' | 'L' | 'XL'

interface Task {
  id: number
  title: string
  status: Status
  size: Size
}

const columns: { key: Status; title: Status }[] = [
  { key: 'To Do', title: 'To Do' },
  { key: 'In Progress', title: 'In Progress' },
  { key: 'Done', title: 'Done' }
]

const tasks = ref<Task[]>([
  { id: 1, title: 'Set up project structure', status: 'To Do', size: 'M' },
  { id: 2, title: 'Design task card layout', status: 'In Progress', size: 'S' },
  { id: 3, title: 'Implement taskboard columns', status: 'In Progress', size: 'L' },
  { id: 4, title: 'Review and refactor', status: 'Done', size: 'M' },
  { id: 5, title: 'Write documentation', status: 'To Do', size: 'S' }
])
</script>

<template>
  <div class="board">
    <header class="board-header">
      <h1 class="board-title">Taskboard</h1>
      <p class="board-subtitle">
        Track work across columns with title, status, and T-shirt size.
      </p>
    </header>

    <main class="board-columns">
      <section
        v-for="column in columns"
        :key="column.key"
        class="column"
      >
        <header class="column-header">
          <h2 class="column-title">
            {{ column.title }}
          </h2>
          <span class="column-count">
            {{
              tasks.filter((task) => task.status === column.key).length
            }}
          </span>
        </header>

        <div class="column-body">
          <TaskCard
            v-for="task in tasks.filter((task) => task.status === column.key)"
            :key="task.id"
            :title="task.title"
            @update:title="task.title = $event"
            :status="task.status"
            @update:status="task.status = $event"
            :size="task.size"
            @update:size="task.size = $event"
          />

          <p
            v-if="tasks.filter((task) => task.status === column.key).length === 0"
            class="column-empty"
          >
            No tasks in this column yet.
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.board {
  min-height: 100vh;
  padding: 2.5rem 2rem;
  background: radial-gradient(circle at top left, #1f2937 0, #020617 55%);
  color: #f9fafb;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  box-sizing: border-box;
}

.board-header {
  max-width: 960px;
  margin: 0 auto 1.75rem auto;
}

.board-title {
  margin: 0 0 0.35rem 0;
  font-size: 2.2rem;
  font-weight: 650;
  letter-spacing: -0.03em;
}

.board-subtitle {
  margin: 0;
  color: #9ca3af;
  font-size: 0.95rem;
}

.board-columns {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
  max-width: 1200px;
  margin: 0 auto;
}

.column {
  background: rgba(15, 23, 42, 0.9);
  border-radius: 0.9rem;
  padding: 1rem;
  box-shadow:
    0 22px 45px rgba(15, 23, 42, 0.9),
    0 0 0 1px rgba(148, 163, 184, 0.08);
  backdrop-filter: blur(16px);
  display: flex;
  flex-direction: column;
  min-height: 260px;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.65rem;
}

.column-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #d1d5db;
}

.column-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.7rem;
  padding: 0.05rem 0.4rem;
  border-radius: 999px;
  background: rgba(31, 41, 55, 0.9);
  color: #9ca3af;
  font-size: 0.78rem;
  font-weight: 500;
}

.column-body {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.3rem;
}

.column-empty {
  margin: 0.4rem 0 0 0;
  font-size: 0.8rem;
  color: #6b7280;
  font-style: italic;
}

@media (max-width: 960px) {
  .board {
    padding: 1.75rem 1.2rem;
  }

  .board-columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .board {
    padding: 1.5rem 1rem 2rem;
  }

  .board-title {
    font-size: 1.7rem;
  }

  .board-columns {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>

