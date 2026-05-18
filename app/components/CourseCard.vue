<script setup lang="ts">
import type { ICourseDTO } from "~~/types/course";
const props = defineProps<{
  course: ICourseDTO;
  isSelected: boolean;
}>();
const emit = defineEmits<{
  select: [course: ICourseDTO];
}>();

const details = computed(() => {
  const items = [
    {
      label: "Faculties:",
      value: props.course.faculties.join(", ")
        ? props.course.faculties.join(", ")
        : "N/A",
    },
  ];
  if (props.course.gerCategory) {
    items.push({ label: "GER Category:", value: props.course.gerCategory });
  }
  if (props.course.prerequisite) {
    items.push({ label: "Prerequisite:", value: props.course.prerequisite });
  }
  if (props.course.antirequisite) {
    items.push({ label: "Antirequisite:", value: props.course.antirequisite });
  }
  return items;
});
const isDisabled = props.course.sections.length === 0;
</script>

<template>
  <UCard
    class="shadow-sm"
    variant="outline"
    @click="$emit('select', course)"
    :class="isSelected ? 'border-primary border' : ''"
  >
    <template #header>
      <div class="flex flex-row justify-between items-start gap-3 flex-wrap">
        <span
          class="font-bold text-base md:text-lg min-w-0 flex-1 break-words"
          :class="isDisabled ? 'text-muted' : ''"
        >
          {{ props.course.code }}: {{ props.course.name }}
        </span>
        <span class="flex flex-row items-center gap-3 md:gap-4 shrink-0">
          <span class="font-bold text-muted text-sm md:text-base whitespace-nowrap"
            >{{ props.course.credits }} Credits</span
          >

          <Icon
            :name="isSelected ? 'i-lucide-check' : 'i-lucide-circle'"
            :size="24"
            :class="isSelected ? 'text-primary' : 'text-muted'"
            v-if="!isDisabled"
          />
        </span>
      </div>
    </template>
    <div class="flex flex-col gap-4">
      <div>
        <CourseCardItem
          v-for="item in details"
          :key="item.label"
          :label="item.label"
          :class="isDisabled ? 'text-muted' : ''"
        >
          {{ item.value }}
        </CourseCardItem>
      </div>
      <div class="flex gap-4 flex-col">
        <UCollapsible class="flex flex-col gap-2">
          <UButton
            :label="course.sections.length + ' Sections'"
            color="neutral"
            class="text-muted p-3"
            variant="outline"
            trailing-icon="i-lucide-chevron-down"
            block
            @click.stop
          />

          <template #content>
            <div
              class="rounded-lg text-muted p-4"
              v-if="course.sections.length > 0"
            >
              <CardScheduleTable :sections="course.sections" />
            </div>
            <div v-else class="rounded-lg text-muted p-4">
              <p>No sections available. You cannot select this course.</p>
            </div>
          </template>
        </UCollapsible>
        <UCollapsible class="flex flex-col gap-2">
          <UButton
            label="Description"
            color="neutral"
            class="text-muted p-3"
            variant="outline"
            trailing-icon="i-lucide-chevron-down"
            block
            @click.stop
          />

          <template #content>
            <div
              class="border-dashed border border-muted rounded-lg text-muted p-4"
            >
              <p v-if="course.description">{{ course.description }}</p>
              <p v-else>No description available.</p>
            </div>
          </template>
        </UCollapsible>
      </div>
    </div>
  </UCard>
</template>
<style lang="css" scoped></style>
