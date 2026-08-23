<script setup lang="ts">
const {counter, incresment, decrement} = useCounter()
</script>

<template>
  <div>
    Counter: {{ counter }}
    <button @click="incresment">
      +
    </button>
    <button @click="decrement">
      -
    </button>
  </div>
</template>