<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import type { Day } from "~~/server/models/Course";

export interface TimetableEvent {
  id: string | number;
  title: string;
  subtitle?: string;
  day: Day;
  startTime: string;
  endTime: string;
  color?: string;
}

const props = defineProps({
  events: {
    type: Array as () => TimetableEvent[],
    required: true,
  },
});

const containerRef = ref<HTMLElement | null>(null);
const days: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dayColumnMap: Record<Day, number> = {
  Mon: 2,
  Tue: 3,
  Wed: 4,
  Thu: 5,
  Fri: 6,
  Sat: 7,
  Sun: 8,
};

// Extract unique time edges from all events
const uniqueEdges = computed(() => {
  const times = new Set<string>();
  props.events.forEach((e) => {
    times.add(e.startTime);
    times.add(e.endTime);
  });
  return Array.from(times).sort();
});

// Map time string to grid row index (header is row 1, so first time is row 2)
const getTimeRow = (time: string) => {
  return uniqueEdges.value.indexOf(time) + 2;
};

// Prepare event items with grid positioning
const eventItems = computed(() => {
  return props.events.map((event) => {
    const rowStart = getTimeRow(event.startTime);
    const rowEnd = getTimeRow(event.endTime);
    const col = dayColumnMap[event.day];
    return {
      ...event,
      style: {
        gridArea: `${rowStart} / ${col} / ${rowEnd} / ${col + 1}`,
      },
    };
  });
});

// Color logic
const eventColors = computed(() => {
  const colors: Record<string, string> = {};
  const gridItemBGOpacity = "20";
  const bgVariant = 500;
  const baseColors = [
    `bg-red-${bgVariant}/${gridItemBGOpacity} border-red-${bgVariant}`,
    `bg-orange-${bgVariant}/${gridItemBGOpacity} border-orange-${bgVariant}`,
    `bg-amber-${bgVariant}/${gridItemBGOpacity} border-amber-${bgVariant}`,
    `bg-yellow-${bgVariant}/${gridItemBGOpacity} border-yellow-${bgVariant}`,
    `bg-lime-${bgVariant}/${gridItemBGOpacity} border-lime-${bgVariant}`,
    `bg-green-${bgVariant}/${gridItemBGOpacity} border-green-${bgVariant}`,
    `bg-emerald-${bgVariant}/${gridItemBGOpacity} border-emerald-${bgVariant}`,
    `bg-teal-${bgVariant}/${gridItemBGOpacity} border-teal-${bgVariant}`,
    `bg-cyan-${bgVariant}/${gridItemBGOpacity} border-cyan-${bgVariant}`,
    `bg-sky-${bgVariant}/${gridItemBGOpacity} border-sky-${bgVariant}`,
    `bg-blue-${bgVariant}/${gridItemBGOpacity} border-blue-${bgVariant}`,
    `bg-indigo-${bgVariant}/${gridItemBGOpacity} border-indigo-${bgVariant}`,
    `bg-violet-${bgVariant}/${gridItemBGOpacity} border-violet-${bgVariant}`,
    `bg-purple-${bgVariant}/${gridItemBGOpacity} border-purple-${bgVariant}`,
    `bg-fuchsia-${bgVariant}/${gridItemBGOpacity} border-fuchsia-${bgVariant}`,
    `bg-pink-${bgVariant}/${gridItemBGOpacity} border-pink-${bgVariant}`,
    `bg-rose-${bgVariant}/${gridItemBGOpacity} border-rose-${bgVariant}`,
  ];
  let colorIndex = 0;
  props.events.forEach((event) => {
    const courseCode = event.title.split("-")[0];
    if (courseCode && !colors[courseCode]) {
      colors[courseCode] = baseColors[colorIndex % baseColors.length]!;
      colorIndex++;
    }
  });
  return colors;
});

const getEventColor = (title: string) => {
  const courseCode = title.split("-")[0];
  return (
    eventColors.value[courseCode || ""] || "bg-gray-500/20 border-gray-500"
  );
};

// Update dashed line width
const updateLineWidth = () => {
  if (containerRef.value) {
    // Calculate width spanning from column 2 to end
    // We can approximate or use scrollWidth.
    // The React code used scrollWidth - 60.
    // Here we want it to start after the time column (50px).
    const width = containerRef.value.scrollWidth - 50;
    containerRef.value.style.setProperty("--line-width", `${width}px`);
  }
};

onMounted(() => {
  updateLineWidth();
  window.addEventListener("resize", updateLineWidth);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateLineWidth);
});
</script>

<template>
  <div class="container-main rounded-lg">
    <div
      ref="containerRef"
      class="container-grid"
      :style="{
        gridTemplateRows: `50px repeat(${uniqueEdges.length}, 60px)`,
      }"
    >
      <!-- Header Row -->
      <div class="grid-item-empty"></div>
      <div v-for="day in days" :key="day" class="days text-sm font-bold">
        {{ day }}
      </div>

      <!-- Time Column & Lines -->
      <div
        v-for="(time, index) in uniqueEdges"
        :key="time"
        class="time text-xs text-muted"
        :style="{ gridRow: index + 2 }"
      >
        {{ time }}
      </div>

      <!-- Events -->
      <div
        v-for="event in eventItems"
        :key="event.id"
        class="grid-item"
        :class="getEventColor(event.title)"
        :style="event.style"
      >
        <div class="event-title text-sm font-semibold">{{ event.title }}</div>
        <div class="event-time text-xs opacity-75">
          {{ event.startTime }} - {{ event.endTime }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container-main {
  width: 100%;
  max-width: 800px;

  background-color: var(--ui-bg);

  border: 1px solid var(--ui-border);
  padding-top: 10px;
  overflow-x: auto;
}

.container-grid {
  display: grid;
  width: 100%;
  min-width: 600px;
  grid-template-columns: 50px repeat(7, 1fr);
  grid-auto-flow: row;
}

.days {
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--ui-text-muted);
  padding-bottom: 10px;
}

.time {
  position: relative;
  color: var(--ui-text-muted);
  margin-left: 10px;
  margin-top: -6px;
  height: 0;
  z-index: 0;
  white-space: nowrap;
}

.time::after {
  content: "";
  position: absolute;
  width: var(--line-width, 100%);
  border-top: 1px dashed var(--ui-border-muted);
  top: 6px;
  left: 40px;
  z-index: -1;
  opacity: 0.5;
}

.grid-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin: 2px;
  padding: 2px 4px;
  border-radius: var(--ui-radius);
  z-index: 1;
  min-height: 30px;
  overflow: hidden;
}

.event-title {
  line-height: 1;
  color: var(--ui-text);
}

.event-time {
  color: var(--ui-text-muted);
  margin-top: 2px;
}

@media (max-width: 768px) {
  .container-grid {
    grid-template-columns: 40px repeat(7, 1fr);
  }
  .time {
    margin-left: 4px;
  }
  .time::after {
    left: 36px;
  }
}
</style>
