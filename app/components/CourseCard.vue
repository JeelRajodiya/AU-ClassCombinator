<script setup lang="ts">
import { type ICourse } from "../../server/models/Course";
const props = defineProps<{
  course: ICourse;
}>();
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-row justify-between">
        <span class="font-bold text-lg">
          {{ props.course.code }}: {{ props.course.name }}
        </span>
        <span class="font-bold text-muted"
          >{{ props.course.credits }} Credits</span
        >
      </div>
    </template>
    <div class="flex flex-col gap-4">
      <div>
        <CourseCardItem label="Faculties:">
          {{ course.faculties.join(", ") }}
        </CourseCardItem>
        <CourseCardItem v-if="course.gerCategory" label="GER Category:">
          {{ course.gerCategory }}
        </CourseCardItem>

        <CourseCardItem v-if="course.prerequisite" label="Prerequisite:">
          {{ course.prerequisite }}
        </CourseCardItem>
        <CourseCardItem v-if="course.antirequisite" label="Antirequisite:">
          {{ course.antirequisite }}
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
          />

          <template #content>
            <div class="rounded-lg text-muted p-4">
              <CardScheduleTable :sections="course.sections" />
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
          />

          <template #content>
            <div
              class="border-dashed border border-muted rounded-lg text-muted p-4"
            >
              <p>{{ course.description }}</p>
            </div>
          </template>
        </UCollapsible>
      </div>
    </div>
  </UCard>
</template>
<style lang="css" scoped></style>
