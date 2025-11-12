<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
});

const emits = defineEmits({ "update:modelValue": (value: string) => true });
</script>

<template>
  <UInput
    icon="i-lucide-search"
    size="xl"
    placeholder="Search courses..."
    variant="subtle"
    class="w-full"
    :ui="{ base: 'py-3' }"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>
