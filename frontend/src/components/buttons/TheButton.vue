<script setup>
defineProps({
  label: {
    type: String,
    default: 'Click here'
  }
})
</script>

<template>
    <button class="text-white bg-purple px-4 py-2 rounded-md border hover:bg-white hover:border-purple hover:text-purple">{{ label }}</button>
</template>

<style scoped></style>