<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

const emit = defineEmits<{ "update:activeTab": [value: "all" | "selected"] }>();

const props = defineProps({
  activeTab: {
    type: String as () => "all" | "selected",
    default: "all",
  },
});

const items = [
  {
    label: "All",
    value: "all" as const,
  },
  {
    label: "Selected",
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
      list: 'w-fit ',
      root: 'items-start mb-0 pb-0',
    }"
    :model-value="activeTab"
    @update:model-value="emit('update:activeTab', $event as 'all' | 'selected')"
  >
  </UTabs>
</template>
