<script setup lang="ts">
const calc = useCalculatorStore()
const { Result, expression, operator, history } = storeToRefs(calc)

// shrink the result as it grows so it always fits on one line, no scrolling needed
const resultFontSize = computed(() => {
  const len = Result.value.length
  if (len <= 6) return '3rem'
  if (len <= 9) return '2.25rem'
  if (len <= 12) return '1.75rem'
  return '1.25rem'
})
</script>
<template>
  <main class="min-h-screen bg-amber-500 flex items-center justify-center p-4">
    <section class="w-full max-w-xs rounded-3xl bg-neutral-900 p-5 shadow-2xl shadow-black/30">
      <!-- screen: input (live, what you're typing) and result (last answer) as separate sections -->
      <div class="mb-5 space-y-3 rounded-2xl bg-neutral-950/60 px-4 py-4 [font-variant-numeric:tabular-nums]">
        <div class="text-right">
          <p class="text-xs font-medium uppercase tracking-wide text-neutral-500">Input</p>
          <p class="h-5 truncate text-sm text-neutral-400">{{ expression }}&nbsp;</p>
          <p
            class="overflow-x-auto whitespace-nowrap font-light text-white transition-[font-size] duration-150"
            :style="{ fontSize: resultFontSize }"
          >{{ Result }}</p>
        </div>

        <div class="border-t border-neutral-800 pt-3 text-right">
          <p class="text-xs font-medium uppercase tracking-wide text-neutral-500">History</p>
          <p v-if="!history.length" class="mt-1 text-sm text-neutral-600">No calculations yet</p>
          <ul v-else class="mt-1 max-h-28 space-y-1 overflow-y-auto">
            <li
              v-for="(entry, i) in history"
              :key="i"
              class="truncate text-sm text-neutral-400"
            >
              {{ entry }}
            </li>
          </ul>
        </div>
      </div>

      <!-- scientific functions -->
      <div class="mb-3 grid grid-cols-4 gap-2">
        <button
          v-for="fn in [
            { label: 'sin', run: () => calc.applyUnary((x) => Math.sin(calc.toRad(x))) },
            { label: 'cos', run: () => calc.applyUnary((x) => Math.cos(calc.toRad(x))) },
            { label: 'tan', run: () => calc.applyUnary((x) => Math.tan(calc.toRad(x))) },
            { label: '√', run: () => calc.applyUnary(Math.sqrt) },
            { label: 'log', run: () => calc.applyUnary(Math.log10) },
            { label: 'ln', run: () => calc.applyUnary(Math.log) },
            { label: 'x²', run: () => calc.applyUnary((x) => x ** 2) },
            { label: '1/x', run: () => calc.applyUnary((x) => 1 / x) },
            { label: 'π', run: () => calc.insertConstant(Math.PI) },
            { label: 'e', run: () => calc.insertConstant(Math.E) },
          ]"
          :key="fn.label"
          type="button"
          class="rounded-xl bg-neutral-800 py-2 text-sm font-medium text-neutral-200 transition-colors duration-150 hover:bg-neutral-700 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          @click="fn.run"
        >
          {{ fn.label }}
        </button>
        <button
          type="button"
          title="Root of n: enter a number, tap ⁿ√, enter n, then ="
          class="rounded-xl py-2 text-sm font-medium transition-colors duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          :class="operator === '√' ? 'bg-white text-neutral-900' : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'"
          @click="calc.setOperator('√')"
        >
          ⁿ√
        </button>
        <button
          type="button"
          title="Power: enter a base, tap xʸ, enter the exponent, then ="
          class="rounded-xl py-2 text-sm font-medium transition-colors duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          :class="operator === '^' ? 'bg-white text-neutral-900' : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'"
          @click="calc.setOperator('^')"
        >
          xʸ
        </button>
      </div>

      <!-- keypad -->
      <div class="grid grid-cols-4 gap-3">
        <button
          v-for="n in ['7','8','9']"
          :key="n"
          type="button"
          class="aspect-square rounded-2xl bg-neutral-700 text-xl font-medium text-white transition-colors duration-150 hover:bg-neutral-600 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          @click="calc.inputNum(n)"
        >
          {{ n }}
        </button>
        <button
          type="button"
          class="aspect-square rounded-2xl text-xl font-medium transition-colors duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          :class="operator === '÷' ? 'bg-white text-amber-500' : 'bg-amber-500 text-white hover:bg-amber-400'"
          @click="calc.setOperator('÷')"
        >
          ÷
        </button>

        <button
          v-for="n in ['4','5','6']"
          :key="n"
          type="button"
          class="aspect-square rounded-2xl bg-neutral-700 text-xl font-medium text-white transition-colors duration-150 hover:bg-neutral-600 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          @click="calc.inputNum(n)"
        >
          {{ n }}
        </button>
        <button
          type="button"
          class="aspect-square rounded-2xl text-xl font-medium transition-colors duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          :class="operator === '×' ? 'bg-white text-amber-500' : 'bg-amber-500 text-white hover:bg-amber-400'"
          @click="calc.setOperator('×')"
        >
          ×
        </button>

        <button
          v-for="n in ['1','2','3']"
          :key="n"
          type="button"
          class="aspect-square rounded-2xl bg-neutral-700 text-xl font-medium text-white transition-colors duration-150 hover:bg-neutral-600 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          @click="calc.inputNum(n)"
        >
          {{ n }}
        </button>
        <button
          type="button"
          class="aspect-square rounded-2xl text-xl font-medium transition-colors duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          :class="operator === '-' ? 'bg-white text-amber-500' : 'bg-amber-500 text-white hover:bg-amber-400'"
          @click="calc.setOperator('-')"
        >
          −
        </button>

        <button
          type="button"
          class="aspect-square rounded-2xl bg-red-500/90 text-lg font-semibold text-white transition-colors duration-150 hover:bg-red-500 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300"
          @click="calc.clear"
        >
          C
        </button>
        <button
          type="button"
          class="aspect-square rounded-2xl bg-neutral-700 text-xl font-medium text-white transition-colors duration-150 hover:bg-neutral-600 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          @click="calc.inputNum('0')"
        >
          0
        </button>
        <button
          type="button"
          class="aspect-square rounded-2xl bg-amber-600 text-xl font-semibold text-white transition-colors duration-150 hover:bg-amber-700 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          @click="calc.equals()"
        >
          =
        </button>
        <button
          type="button"
          class="aspect-square rounded-2xl text-xl font-medium transition-colors duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          :class="operator === '+' ? 'bg-white text-amber-500' : 'bg-amber-500 text-white hover:bg-amber-400'"
          @click="calc.setOperator('+')"
        >
          +
        </button>
      </div>
    </section>
  </main>
</template>
