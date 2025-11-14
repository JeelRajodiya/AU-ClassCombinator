<script setup lang="ts">
const router = useRouter();
const inputRef = ref<any>(null);

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

const handleClear = () => {
  emits("update:modelValue", "");
  nextTick(() => {
    // UInput wraps the actual input element, so we need to access it
    const input = inputRef.value?.$el?.querySelector("input");
    if (input) {
      input.focus();
    }
  });
};
</script>

<template>
  <UFieldGroup class="w-full">
    <UInput
      ref="inputRef"
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
      :icon="
        modelValue != router.currentRoute.value.query.q
          ? 'i-lucide-search'
          : 'i-lucide-x'
      "
      size="xl"
      variant="subtle"
      color="neutral"
      @click="
        modelValue != router.currentRoute.value.query.q
          ? searchFunction(modelValue)
          : handleClear()
      "
    />
  </UFieldGroup>
</template>
