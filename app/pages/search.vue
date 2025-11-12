<script setup lang="ts">
const route = useRoute();
const searchTerm = (route.query.q as string) || "";
const { selectedSem, setSelectedSem } = useSelectedSemester();
</script>

<template>
  <div>{{ searchTerm }} {{ selectedSem }}</div>
</template>
