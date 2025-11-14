<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

const emit = defineEmits<{ "update:activeTab": [value: "search" | "selected"] }>();

const props = defineProps({
  activeTab: {
    type: String as () => "search" | "selected",
    default: "search",
  },
});

const items = [
  {
    label: "Search",
    value: "search" as const,
  },
  {
    label: "Selected Courses",
    value: "selected" as const,
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
      list: 'w-fit  ',
      root: 'items-start mb-0 pb-0 ',
    }"
    :model-value="activeTab"
    @update:model-value="
      emit('update:activeTab', $event as 'search' | 'selected')
    "
  >
  </UTabs>
</template>
