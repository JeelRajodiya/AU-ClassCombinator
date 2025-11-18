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
  isLoading: {
    type: Boolean,
    required: false,
    default: false,
  },
  zeroIndicator: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>
<template>
  <div class="stat-item flex flex-row items-center text-md">
    <span class="text-muted flex items-center gap-2">
      <UIcon :name="props.icon" class="size-4" />
      {{ props.label }} &nbsp;
    </span>
    <span v-if="props.isLoading" class="flex items-center">
      <UIcon name="i-lucide-loader" size="16" class="animate-spin bg-primary" />
    </span>
    <span
      v-else
      :class="{ 'text-warning': props.zeroIndicator && props.value === 0 }"
      >{{ props.value }}</span
    >
  </div>
</template>
