<script setup lang="ts">
const route = useRoute();
const searchTerm = ref((route.query.q as string) || "");
const { selectedSem, setSelectedSem } = useSelectedSemester();
</script>

<template>
  <div class="page p-8">
    <div class="layout">
      <div class="flex gap-16">
        <LogoSmall />
        <div>
          <SearchField v-model="searchTerm" />
          <SearchResults />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped></style>
