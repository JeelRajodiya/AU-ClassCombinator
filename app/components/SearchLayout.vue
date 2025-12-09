<script setup lang="ts">
defineProps({
  page: {
    type: String as PropType<"search" | "combinations">,
    required: false,
    default: "search",
  },
});
</script>

<template>
  <div class="page">
    <div class="flex align-top gap-8">
      <div class="flex flex-5 flex-col">
        <div class="flex gap-4">
          <LogoSmall class="w-fit pl-8 pr-16 top-8 sticky" />
          <div class="w-full">
            <slot />
          </div>
        </div>
      </div>
      <SearchStats
        class="search-stats-container flex-2 sticky top-0 py-8 h-screen overflow-y-auto"
        :page="page"
      />
    </div>
  </div>
</template>

<style scoped>
/* Hide scrollbar but keep functionality */
.search-stats-container {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.search-stats-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style>
