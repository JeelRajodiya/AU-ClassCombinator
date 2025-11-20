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

const props = defineProps({
  events: {
    type: Array as () => TimetableEvent[],
    required: true,
  },
});

// iterate through startTime and find the minimum time as startHour, the startTime is a string in ISO format

const eventStartHours = props.events
  .map((event) => event.startTime)
  .filter((time): time is string => typeof time === "string")
  .map((time) => parseInt(time.split(":")[0]!, 10));

const startHour = Math.min(...eventStartHours, 8); // default to 8 AM if no events

const eventEndHours = props.events
  .map((event) => event.endTime)
  .filter((time): time is string => typeof time === "string")
  .map((time) => parseInt(time.split(":")[0]!, 10));

const endHour = Math.max(...eventEndHours, 18); // default to 6 PM if no events

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// iterate through the table items, findout the min slot size in minutes
const eventSlotSizes = props.events.map((event) => {
  const start = event.startTime.split(":");
  const end = event.endTime.split(":");
  const startMinutes = parseInt(start[0]!, 10) * 60 + parseInt(start[1]!, 10);
  const endMinutes = parseInt(end[0]!, 10) * 60 + parseInt(end[1]!, 10);
  return endMinutes - startMinutes;
});
const slotSize = Math.min(...eventSlotSizes, 90); // default to 90 minutes
const timeSlots = Array.from(
  { length: (endHour - startHour) * (60 / slotSize) },
  (_, i) => {
    const totalMinutes = startHour * 60 + i * slotSize;
    const hours = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, "0");
    const minutes = (totalMinutes % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }
);
</script>
<template>
  <div class="timetable">
    <div class="header">
      <span class="header-cell text-muted">Time</span>
      <span
        v-for="day in days"
        :key="day"
        :class="[
          'header-cell',
          { 'text-error': day === 'Sat' || day === 'Sun' },
        ]"
      >
        {{ day }}
      </span>
    </div>
    <div>
      <div v-for="time in timeSlots" :key="time" class="flex">
        {{ time }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
}

.timetable {
  max-width: 500px;
}

.header-cell {
  text-align: center;
  font-weight: bold;
  min-width: 100px;
}
</style>
