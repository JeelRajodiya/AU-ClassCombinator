<script setup lang="ts">
const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
});
</script>
<template>
  <div class="stat-item flex flex-row items-center text-sm">
    <span class="text-muted flex items-center gap-2">
      <UIcon :name="props.icon" class="size-4" />
      {{ props.label }} &nbsp;
    </span>
    <span>{{ props.value }}</span>
  </div>
</template>
