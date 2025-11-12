<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

const props = defineProps<{
  results: any[];
}>();

const items = [
  {
    label: "All",
    description: `Found ${props.results.length} courses`,

    slot: "all" as const,
  },
  {
    label: "Selected",
    description:
      "Change your password here. After saving, you'll be logged out.",
    slot: "selected" as const,
  },
] satisfies TabsItem[];
</script>

<template>
  <UTabs
    color="neutral"
    :items="items"
    variant="link"
    :ui="{
      trigger: 'grow',
      list: 'w-fit ',
      root: 'items-start',
    }"
    class="gap-4"
  >
    <template #all="{ item }">
      <div class="space-y-4">
        <div
          v-for="course in results"
          :key="course.code"
          class="p-4 border rounded"
        >
          <h3 class="font-bold">{{ course.code }}: {{ course.name }}</h3>
          <p>{{ course.description }}</p>
          <p>Credits: {{ course.credits }}</p>
          <p>Faculties: {{ course.faculties.join(", ") }}</p>
        </div>
      </div>
    </template>

    <template #selected="{ item }">
      sselected selected selected selected selected elected
    </template>
  </UTabs>
</template>
