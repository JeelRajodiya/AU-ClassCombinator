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
  <div class="page px-3 md:px-0">
    <div class="md:hidden pt-4">
      <LogoSmall class="w-fit" />
    </div>
    <div class="flex flex-col md:flex-row md:align-top gap-4 md:gap-8">
      <div class="flex md:flex-5 flex-col min-w-0">
        <div class="flex gap-4 h-full">
          <LogoSmall class="hidden md:block w-fit pl-8 pr-16 top-8 sticky" />
          <div class="w-full min-w-0">
            <slot />
          </div>
        </div>
      </div>
      <SearchStats
        class="search-stats-container w-full md:flex-2 md:sticky md:top-0 md:py-8 md:h-screen md:overflow-y-auto pb-8"
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
