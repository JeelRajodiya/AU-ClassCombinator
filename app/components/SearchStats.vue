<template>
  <div class="flex flex-col gap-8 h-fit">
    <SemesterSwitch class="w-fit" />
    <USeparator orientation="horizontal" class="w-48 pt-16" />
    <div class="flex flex-col gap-4">
      <StatItem icon="i-lucide-coins" label="Total Credits:" value="32" />
      <StatItem icon="i-lucide-book" label="Selected Courses:" value="96" />
      <StatItem
        icon="i-lucide-combine"
        label="Total Combinations:"
        value="96"
      />
    </div>
  </div>
</template>

<style scoped>
/* .search-stats {
} */
</style>
