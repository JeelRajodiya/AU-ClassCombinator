<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

const items = [
  {
    label: "All",
    description:
      "Make changes to your account here. Click save when you're done.",

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
    :ui="{ trigger: 'grow', list: 'w-fit ', root: 'items-start' }"
    class="gap-4"
  >
    <template #all="{ item }"> all </template>

    <template #selected="{ item }">
      sselected selected selected selected selected elected
    </template>
  </UTabs>
</template>
