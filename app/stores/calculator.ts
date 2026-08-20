import { defineStore } from 'pinia'

export const useCalculatorStore = defineStore('calculator', () => {
  const Result = ref('0')
  const previous = ref<number | null>(null)
  const operator = ref<string | null>(null)
  const waitingForNewInput = ref(false)
  // log of past calculations, newest first — grows on equals(), separate from
  // Result (which keeps acting as the live input line so you can chain calculations)
  const history = ref<string[]>([])
  const MAX_HISTORY = 20

  // small trail above the main number, e.g. "12 +"
  const expression = computed(() =>
    previous.value === null ? '' : `${previous.value} ${operator.value ?? ''}`
  )

  // avoid floating point noise (0.1 + 0.2 → 0.30000000000000004) and flag bad math
  function format(n: number) {
    return Number.isFinite(n) ? String(Number(n.toPrecision(12))) : 'Error'
  }

  const toRad = (deg: number) => (deg * Math.PI) / 180

  function inputNum(d: string) {
    if (waitingForNewInput.value) {
      Result.value = d
      waitingForNewInput.value = false
    } else if (Result.value === '0') {
      Result.value = d
    } else {
      Result.value = Result.value + d
    }
  }

  function clear() {
    Result.value = '0'
    previous.value = null
    operator.value = null
    waitingForNewInput.value = false
  }

  function setOperator(op: string) {
    previous.value = parseFloat(Result.value)
    operator.value = op
    waitingForNewInput.value = true
  }

  function equals() {
    if (previous.value === null || operator.value === null) return

    const current = parseFloat(Result.value)
    const prevUsed = previous.value
    const opUsed = operator.value

    if (opUsed === '+') {
      Result.value = format(prevUsed + current)
    } else if (opUsed === '-') {
      Result.value = format(prevUsed - current)
    } else if (opUsed === '×') {
      Result.value = format(prevUsed * current)
    } else if (opUsed === '÷') {
      Result.value = format(prevUsed / current)
    } else if (opUsed === '√') {
      // nth root: previous √ n  →  previous ^ (1 / n)
      Result.value = format(Math.pow(prevUsed, 1 / current))
    } else if (opUsed === '^') {
      // power: previous ^ current
      Result.value = format(Math.pow(prevUsed, current))
    }

    history.value.unshift(`${prevUsed} ${opUsed} ${current} = ${Result.value}`)
    if (history.value.length > MAX_HISTORY) history.value.length = MAX_HISTORY

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

  return {
    Result,
    previous,
    operator,
    waitingForNewInput,
    history,
    expression,
    inputNum,
    clear,
    setOperator,
    equals,
    applyUnary,
    insertConstant,
    toRad,
  }
})
