<script setup lang="ts">
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div>
    <span class="text-sm font-bold">{{ label }}</span
    >&nbsp;
    <span class="text-sm text-muted">
      <slot />
    </span>
  </div>
</template>
