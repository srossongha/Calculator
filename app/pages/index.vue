<script setup lang="ts">

const Result = ref('0')
const previous = ref<number | null>(null)
const operator = ref<string | null>(null)
const waitingForNewInput = ref(false)

function inputNum(d:string) {
  if (waitingForNewInput.value) {
    Result.value = d
    waitingForNewInput.value = false   // 
  } else if (Result.value === '0') {
    Result.value = d
  } else {
    Result.value = Result.value + d
  }
}

function clear() {
  Result.value = "0"
}

function setOperator(op:string) {
  previous.value =parseFloat(Result.value)
  operator.value = op
  waitingForNewInput.value = true
}

function equals() {
  const current = parseFloat(Result.value)

  if (operator.value === '+') {
    Result.value = String(previous.value + current)
  }
}




</script>
<template>
  <main class="min-h-screen bg-amber-500 ">
    <section class="flex justify-center text-8xl">
      {{ Result }}
    </section>
    
      <div class="grid grid-cols-3 gap-2">
        
        <button
          v-for="n in ['7','8','9','4','5','6','1','2','3']"
          :key="n"
          @click="inputNum(n)"
          class="bg-gray-200 p-4 rounded"
        >
          {{ n }}
        </button>
        <button @click="inputNum('0')" class="col-span-3 bg-gray-200 p-4 rounded">0</button>
        <button @click="clear" class="col-span-3 bg-gray-200 p-4 rounded">C</button>
        <button @click="setOperator('+')" class="bg-orange-300 p-4 rounded">+</button>
        <button @click="setOperator('-')" class="bg-orange-300 p-4 rounded">-</button>
        <button @click="setOperator('×')" class="bg-orange-300 p-4 rounded">×</button>
        <button @click="setOperator('÷')" class="bg-orange-300 p-4 rounded">÷</button>
      </div>
  </main>
</template>
