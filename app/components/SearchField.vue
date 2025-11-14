<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  searchFunction: {
    type: Function,
    default: () => {},
  },
});

const emits = defineEmits({ "update:modelValue": (value: string) => true });
</script>

<template>
  <UFieldGroup class="w-full">
    <UInput
      icon="i-lucide-search"
      size="xl"
      placeholder="Search courses..."
      variant="subtle"
      class="w-full"
      :ui="{ base: 'py-3 shadow-sm' }"
      :value="modelValue"
      @input="emits('update:modelValue', $event.target.value)"
      @keydown.enter="searchFunction($event.target.value)"
    />
    <UButton
      class="py-3 px-4"
      icon="i-lucide-search"
      size="xl"
      variant="subtle"
      color="neutral"
      @click="searchFunction(modelValue)"
    />
  </UFieldGroup>
</template>
