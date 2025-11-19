import combinations from '~~/server/api/combinations';
<script setup lang="ts">
const { combinations, setCombinations } = useCombinations();
</script>
<template>
  {{ combinations }}
</template>
