import { defineStore } from 'pinia'

export const useCalculatorStore = defineStore('calculator', () => {
  // ---- state ----------------------------------------------------------
  const expr = ref('')                    // e.g. "5+3-2"
  const answer = ref<string | null>(null) // set once "=" is pressed

  // ---- pure helpers ----------------------------------------------------
  // these only work on their arguments, so they are NOT state
  //  {#06a,7}
  function calculate(a: number, b: number, op: string): number {
    if (op === '+') return a + b
    if (op === '-') return a - b
    if (op === '×') return a * b
    if (op === '÷') return a / b
    return b
  }

  function format(n: number): string {
    return Number.isFinite(n) ? String(Number(n.toPrecision(12))) : 'Error'
  }

  return { expr, answer }
})
