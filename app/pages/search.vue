<script setup lang="ts">
const route = useRoute();
const searchTerm = ref((route.query.q as string) || "");
const { selectedSem, setSelectedSem } = useSelectedSemester();
</script>

<template>
  <div class="page p-8">
    <div class="flex gap-8">
      <div class="flex wrapper flex-5">
        <LogoSmall class="w-fit pr-16" />
        <div class="w-full flex flex-col gap-2">
          <SearchField v-model="searchTerm" />
          <SearchResults />
        </div>
        <USeparator orientation="vertical" class="pt-48 h-96" />
      </div>

      <SearchStats class="flex-2" />
    </div>
  </div>
</template>

<style lang="css" scoped>
.wrapper {
}
</style>
