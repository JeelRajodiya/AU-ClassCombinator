<script setup lang="ts">
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div>
    <span class="text-sm font-bold" :class="isDisabled ? 'text-muted' : ''">{{
      label
    }}</span
    >&nbsp;
    <span class="text-sm text-muted">
      <slot />
    </span>
  </div>
</template>
