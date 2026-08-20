<script setup lang="ts">
const calc = useCalculatorStore()

const Result = ref('0')
const previous = ref<number | null>(null)
const operator = ref<string | null>(null)
const waitingForNewInput = ref(false)

// small trail above the main number, e.g. "12 +"
const expression = computed(() =>
  previous.value === null ? '' : `${previous.value} ${operator.value ?? ''}`
)

// avoid floating point noise (0.1 + 0.2 → 0.30000000000000004) and flag bad math
function format(n: number) {
  return Number.isFinite(n) ? String(Number(n.toPrecision(12))) : 'Error'
}

const toRad = (deg: number) => (deg * Math.PI) / 180

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
  if (previous.value === null || operator.value === null) return

  const current = parseFloat(Result.value)

  if (operator.value === '+') {
    Result.value = format(previous.value + current)
  } else if (operator.value === '-') {
    Result.value = format(previous.value - current)
  } else if (operator.value === '×') {
    Result.value = format(previous.value * current)
  } else if (operator.value === '÷') {
    Result.value = format(previous.value / current)
  } else if (operator.value === '√') {
    // nth root: previous √ n  →  previous ^ (1 / n)
    Result.value = format(Math.pow(previous.value, 1 / current))
  } else if (operator.value === '^') {
    // power: previous ^ current
    Result.value = format(Math.pow(previous.value, current))
  }

  previous.value = null
  operator.value = null
  waitingForNewInput.value = true
}

// scientific functions apply straight to the number on screen (degrees for trig)
function applyUnary(fn: (x: number) => number) {
  Result.value = format(fn(parseFloat(Result.value)))
  waitingForNewInput.value = true
}

function insertConstant(value: number) {
  Result.value = format(value)
  waitingForNewInput.value = true
}




</script>
<template>
  <main class="min-h-screen bg-amber-500 flex items-center justify-center p-4">
    <div>{{ calc.Result }}</div>
    <section class="w-full max-w-xs rounded-3xl bg-neutral-900 p-5 shadow-2xl shadow-black/30">
      <!-- screen -->
      <div class="mb-5 rounded-2xl bg-neutral-950/60 px-4 py-5 text-right [font-variant-numeric:tabular-nums]">
        <p class="h-5 truncate text-sm text-neutral-500">{{ expression }}&nbsp;</p>
        <p class="mt-1 overflow-x-auto whitespace-nowrap text-5xl font-light text-white">{{ Result }}</p>
      </div>

      <!-- keypad -->
      <div class="grid grid-cols-4 gap-3">
        <button
          type="button"
          title="Root of n: enter a number, tap ⁿ√, enter n, then ="
          class="col-span-4 rounded-2xl py-3 text-xl font-medium transition-colors duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          :class="operator === '√' ? 'bg-white text-amber-500' : 'bg-amber-500 text-white hover:bg-amber-400'"
          @click="setOperator('√')"
        >
          ⁿ√
        </button>

        <button
          v-for="n in ['7','8','9']"
          :key="n"
          type="button"
          class="aspect-square rounded-2xl bg-neutral-700 text-xl font-medium text-white transition-colors duration-150 hover:bg-neutral-600 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          @click="inputNum(n)"
        >
          {{ n }}
        </button>
        <button
          type="button"
          class="aspect-square rounded-2xl text-xl font-medium transition-colors duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          :class="operator === '÷' ? 'bg-white text-amber-500' : 'bg-amber-500 text-white hover:bg-amber-400'"
          @click="setOperator('÷')"
        >
          ÷
        </button>

        <button
          v-for="n in ['4','5','6']"
          :key="n"
          type="button"
          class="aspect-square rounded-2xl bg-neutral-700 text-xl font-medium text-white transition-colors duration-150 hover:bg-neutral-600 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          @click="inputNum(n)"
        >
          {{ n }}
        </button>
        <button
          type="button"
          class="aspect-square rounded-2xl text-xl font-medium transition-colors duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          :class="operator === '×' ? 'bg-white text-amber-500' : 'bg-amber-500 text-white hover:bg-amber-400'"
          @click="setOperator('×')"
        >
          ×
        </button>

        <button
          v-for="n in ['1','2','3']"
          :key="n"
          type="button"
          class="aspect-square rounded-2xl bg-neutral-700 text-xl font-medium text-white transition-colors duration-150 hover:bg-neutral-600 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          @click="inputNum(n)"
        >
          {{ n }}
        </button>
        <button
          type="button"
          class="aspect-square rounded-2xl text-xl font-medium transition-colors duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          :class="operator === '-' ? 'bg-white text-amber-500' : 'bg-amber-500 text-white hover:bg-amber-400'"
          @click="setOperator('-')"
        >
          −
        </button>

        <button
          type="button"
          class="aspect-square rounded-2xl bg-red-500/90 text-lg font-semibold text-white transition-colors duration-150 hover:bg-red-500 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300"
          @click="clear"
        >
          C
        </button>
        <button
          type="button"
          class="aspect-square rounded-2xl bg-neutral-700 text-xl font-medium text-white transition-colors duration-150 hover:bg-neutral-600 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          @click="inputNum('0')"
        >
          0
        </button>
        <button
          type="button"
          class="aspect-square rounded-2xl bg-amber-600 text-xl font-semibold text-white transition-colors duration-150 hover:bg-amber-700 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          @click="equals()"
        >
          =
        </button>
        <button
          type="button"
          class="aspect-square rounded-2xl text-xl font-medium transition-colors duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          :class="operator === '+' ? 'bg-white text-amber-500' : 'bg-amber-500 text-white hover:bg-amber-400'"
          @click="setOperator('+')"
        >
          +
        </button>
      </div>
    </section>
  </main>
</template>
