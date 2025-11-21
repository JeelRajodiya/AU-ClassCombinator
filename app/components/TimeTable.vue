<script setup lang="ts">
import type { Day } from "~~/server/models/Course";

export interface TimetableEvent {
  id: string | number;
  title: string;
  subtitle?: string;
  day: Day;
  startTime: string; // "08:00" (24h format)
  endTime: string; // "09:30"
  color?: string;
}

const props = defineProps({
  events: {
    type: Array as () => TimetableEvent[],
    required: true,
  },
});

const days: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Helper function to convert time string to minutes since midnight
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);

  if (
    hours === undefined ||
    minutes === undefined ||
    isNaN(hours) ||
    isNaN(minutes) ||
    hours < 0 ||
    hours >= 24 ||
    minutes < 0 ||
    minutes >= 60
  ) {
    throw new Error(`Invalid time format: ${time}`);
  }
  return hours * 60 + minutes;
};

// Helper function to convert minutes to time string
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const mins = (minutes % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
};

// Find the time range for the timetable
const timeRange = computed(() => {
  if (props.events.length === 0) {
    return { startMinutes: 8 * 60, endMinutes: 18 * 60 }; // 8 AM to 6 PM
  }

  let minStart = Infinity;
  let maxEnd = -Infinity;

  props.events.forEach((event) => {
    const start = timeToMinutes(event.startTime);
    const end = timeToMinutes(event.endTime);
    minStart = Math.min(minStart, start);
    maxEnd = Math.max(maxEnd, end);
  });

  // Round to nearest hour
  const startMinutes = Math.floor(minStart / 60) * 60;
  const endMinutes = Math.ceil(maxEnd / 60) * 60;

  return { startMinutes, endMinutes };
});

// Calculate slot size based on shortest event duration
const slotSizeMinutes = computed(() => {
  if (props.events.length === 0) return 30;

  const durations = props.events.map((event) => {
    const start = timeToMinutes(event.startTime);
    const end = timeToMinutes(event.endTime);
    return end - start;
  });

  const minDuration = Math.min(...durations);

  // Find the greatest common divisor for better slot alignment
  // Use common academic time slots: 30, 60, 90 minutes
  if (minDuration >= 90) return 90;
  if (minDuration >= 60) return 60;
  return 30;
});

// Generate time slots
const timeSlots = computed(() => {
  const slots: number[] = [];
  const { startMinutes, endMinutes } = timeRange.value;

  for (
    let minutes = startMinutes;
    minutes < endMinutes;
    minutes += slotSizeMinutes.value
  ) {
    slots.push(minutes);
  }

  return slots;
});

// Calculate event positioning for each day
const eventsByDay = computed(() => {
  const byDay: Record<
    Day,
    Array<
      TimetableEvent & {
        rowStart: number;
        rowSpan: number;
        topOffset: number;
        heightPercent: number;
      }
    >
  > = {
    Mon: [],
    Tue: [],
    Wed: [],
    Thu: [],
    Fri: [],
    Sat: [],
    Sun: [],
  };

  props.events.forEach((event) => {
    const startMinutes = timeToMinutes(event.startTime);
    const endMinutes = timeToMinutes(event.endTime);
    const { startMinutes: rangeStart } = timeRange.value;

    // Find which row this event starts in
    const minutesFromStart = startMinutes - rangeStart;
    const rowStart = Math.floor(minutesFromStart / slotSizeMinutes.value);

    // Calculate exact position within the grid
    const topOffset =
      (minutesFromStart % slotSizeMinutes.value) / slotSizeMinutes.value;

    // Calculate how many slots this event spans
    const eventDuration = endMinutes - startMinutes;
    const heightPercent = (eventDuration / slotSizeMinutes.value) * 100;

    byDay[event.day].push({
      ...event,
      rowStart,
      rowSpan: Math.ceil(eventDuration / slotSizeMinutes.value),
      topOffset,
      heightPercent,
    });
  });

  return byDay;
});

// Generate random colors for events using Tailwind color utilities
const eventColors = computed(() => {
  const colors: Record<string, string> = {};
  const baseColors = [
    "bg-blue-500/20 border-blue-500",
    "bg-green-500/20 border-green-500",
    "bg-purple-500/20 border-purple-500",
    "bg-orange-500/20 border-orange-500",
    "bg-pink-500/20 border-pink-500",
    "bg-cyan-500/20 border-cyan-500",
    "bg-yellow-500/20 border-yellow-500",
  ];

  let colorIndex = 0;
  props.events.forEach((event) => {
    // Extract course code from title (e.g., "FAC121-1" -> "FAC121")
    const courseCode = event.title.split("-")[0];
    if (!colors[courseCode!]) {
      colors[courseCode!] = baseColors[colorIndex % baseColors.length]!;
      colorIndex++;
    }
  });

  return colors;
});

const getEventColor = (title: string) => {
  const courseCode = title.split("-")[0];
  return eventColors.value[courseCode!] || "bg-gray-500/20 border-gray-500";
};
</script>

<template>
  <div class="timetable-container">
    <div class="timetable-header">
      <div class="time-header-cell">Time</div>
      <div
        v-for="day in days"
        :key="day"
        :class="[
          'day-header-cell',
          { 'weekend-header': day === 'Sat' || day === 'Sun' },
        ]"
      >
        {{ day }}
      </div>
    </div>

    <div class="timetable-body">
      <!-- Time column -->
      <div class="time-column">
        <div
          v-for="(slotMinutes, index) in timeSlots"
          :key="index"
          class="time-slot"
        >
          {{ minutesToTime(slotMinutes) }}
        </div>
      </div>

      <!-- Days grid -->
      <div class="days-grid">
        <div
          v-for="day in days"
          :key="day"
          class="day-column"
          :style="{ '--slot-count': timeSlots.length }"
        >
          <!-- Background grid cells -->
          <div
            v-for="(slot, index) in timeSlots"
            :key="`slot-${index}`"
            class="grid-cell"
          />

          <!-- Events positioned absolutely -->
          <div
            v-for="event in eventsByDay[day]"
            :key="event.id"
            :class="['event-block', getEventColor(event.title)]"
            :style="{
              gridRow: `${event.rowStart + 1} / span ${event.rowSpan}`,
              marginTop: `${event.topOffset * 100}%`,
              height: `${event.heightPercent}%`,
            }"
          >
            <div class="event-title">{{ event.title }}</div>
            <div class="event-time">
              {{ event.startTime }} - {{ event.endTime }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timetable-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  overflow: hidden;
  background: var(--ui-bg);
}

.timetable-header {
  display: grid;
  grid-template-columns: 100px repeat(7, 1fr);
  border-bottom: 2px solid var(--ui-border-accented);
  background: var(--ui-bg);
}

.time-header-cell,
.day-header-cell {
  padding: 12px 8px;
  text-align: center;
}

.weekend-header {
  color: var(--ui-error);
}

.time-header-cell {
  border-right: 1px solid var(--ui-border-muted);
}

.timetable-body {
  display: grid;
  grid-template-columns: 100px 1fr;
}

.time-column {
  border-right: 1px solid var(--ui-border-muted);
  background: var(--ui-bg);
}

.time-slot {
  height: 80px;
  padding: 8px;
  border-bottom: 1px solid var(--ui-border-muted);

  color: var(--ui-text-muted);
  display: flex;
  align-items: flex-start;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.day-column {
  display: grid;
  grid-template-rows: repeat(var(--slot-count, 1), 80px);
  grid-auto-rows: 0;
  position: relative;
  border-right: 1px solid var(--ui-border-muted);
}

.day-column:last-child {
  border-right: none;
}

.grid-cell {
  height: 80px;
  border-bottom: 1px solid var(--ui-border-muted);
}

.event-block {
  position: relative;
  padding: 6px 8px;
  border-left: 3px solid;
  border-radius: 4px;
  font-size: 12px;
  overflow: hidden;
  cursor: pointer;
  margin: 0 4px;
  min-height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 1;
}

.event-title {
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 2px;
  color: var(--ui-text);
}

.event-subtitle {
  font-size: 11px;
  opacity: 0.8;
  margin-bottom: 2px;
  color: var(--ui-text-toned);
}

.event-time {
  font-size: 10px;
  opacity: 0.7;
  margin-top: auto;
  color: var(--ui-text-muted);
}

@media (max-width: 768px) {
  .timetable-header {
    grid-template-columns: 80px repeat(7, minmax(60px, 1fr));
  }

  .timetable-body {
    grid-template-columns: 80px 1fr;
  }

  .day-header-cell,
  .time-header-cell {
    padding: 8px 4px;
    font-size: 12px;
  }

  .event-block {
    padding: 4px;
    font-size: 10px;
  }
}
</style>
