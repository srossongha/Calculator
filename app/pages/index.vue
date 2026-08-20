<script setup lang="ts">
const Result = ref('0')

function inputNum(d:string) {
  if ( Result.value === '0') {
    Result.value = d
  } else {
    Result.value += d
  }
}

</script>
<template>
  <main class="min-h-screen bg-amber-500 ">
    <section class="flex justify-center text-8xl">
      {{ Result }}
    </section>
    <section class="grid grid-cols-3">
      <button @click="inputNum('7')" class="flex justify-center text-6xl">7</button>

    </section>
  </main>
</template>
