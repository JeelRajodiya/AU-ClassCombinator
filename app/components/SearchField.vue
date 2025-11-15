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
function handleClear() {
  emits("update:modelValue", "");
  nextTick(() => {
    const input = inputRef.value?.$el?.querySelector("input");
    if (input) {
      input.focus();
    }
  });
}

async function handleSearch(value: string) {
  if (!value.trim()) return;
  const query = typeof value === "string" ? value : props.modelValue;
  try {
    await Promise.resolve(props.searchFunction(query));
  } finally {
    nextTick(() => {
      const input = inputRef.value?.$el?.querySelector("input");
      if (input) {
        input.blur();
      }
    });
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
    event.preventDefault();
    const input = inputRef.value?.$el?.querySelector("input");
    if (input) {
      input.focus();
    }
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
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
      @keydown.enter="handleSearch($event.target.value)"
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
          ? handleSearch(modelValue)
          : handleClear()
      "
    />
  </UFieldGroup>
</template>
