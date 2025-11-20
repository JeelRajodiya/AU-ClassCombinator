<script setup lang="ts">
// I want to show the time table of a combination
// the data I have to display is
// course code, section no. and their time slot.
// TimeTable.vue (Script Setup)

export interface TimetableEvent {
  id: string | number;
  title: string; // e.g., "FAC121-1"
  subtitle?: string; // e.g., "Lecture Hall A" (optional)
  day: string; // "Mon", "Tue", etc. matches your column headers
  startTime: string; // "08:00" (24h format is best for calculations)
  endTime: string; // "09:30"
  color?: string; // Optional: to color code different courses
}

interface TimetableConfig {
  startHour: number; // e.g., 8 (for 08:00)
  endHour: number; // e.g., 19 (for 19:00)
  slotSize: number; // e.g., 60 (for 60 minutes)
}

const props = withDefaults(
  defineProps<{ events: TimetableEvent[]; config?: TimetableConfig }>(),
  {
    config: () => ({
      startHour: 8,
      endHour: 18,
      slotSize: 60,
    }),
  }
);

const config = computed(() => props.config);
</script>
<template>
  {{ events }}
  <div v-for="event in props.events" :key="event.id">
    <h3>{{ event.title }}</h3>
    <p>{{ event.day }}: {{ event.startTime }} - {{ event.endTime }}</p>
  </div>
</template>
