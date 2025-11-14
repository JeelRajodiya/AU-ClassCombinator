<script setup>
import { computed } from "vue";

// Define the props this component accepts
defineProps({
  sections: {
    type: Array,
    required: true,
    default: () => [],
  },
});

// --- Helper Functions ---

// Maps short day names (from JSON) to full names (like in the image)
const dayMap = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};
const getFullDayName = (shortDay) => dayMap[shortDay] || shortDay;

// Formats a YYYY-MM-DD string to DD-MM-YYYY
const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (e) {
    // Fallback if the date string is not in the expected format
    return dateString;
  }
};

// Creates the formatted date range string (e.g., "05-01-2026 - 19-04-2026")
const formatDateRange = (dateRange) => {
  if (!dateRange || !dateRange.start || !dateRange.end) return "N/A";
  const start = formatDate(dateRange.start);
  const end = formatDate(dateRange.end);
  return `${start} - ${end}`;
};
</script>

<template>
  <div class="w-full space-y-4">
    <div
      v-for="section in sections"
      :key="section.sectionId"
      class="overflow-hidden border border-default"
    >
      <h3
        class="px-6 py-2 text-lg font-bold border-t border-default text-center"
      >
        Section {{ section.sectionId }}
      </h3>

      <div class="border border-default">
        <div
          v-for="(slot, index) in section.slots"
          :key="index"
          class="grid grid-cols-[130px_1fr] items-start"
        >
          <div class="font-bold border border-default h-full center border-l-0">
            {{ getFullDayName(slot.day) }}
          </div>

          <div class="">
            <div class="flex items-center">
              <span class="w-24 p-4 py-2 text-sm center h-full">Time</span>
              <span class="text-sm p-4 py-2 border border-default w-full"
                >{{ slot.startTime }} – {{ slot.endTime }}</span
              >
            </div>
            <div class="flex items-center">
              <span
                class="w-24 text-sm center h-full p-4 py-2 border border-default"
                >Dates</span
              >
              <span class="text-sm p-4 py-2 border border-default w-full">{{
                formatDateRange(section.dateRange)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="!section.slots || section.slots.length === 0"
        class="p-6 text-center"
      >
        No schedule available for this section.
      </div>
    </div>
  </div>
</template>
