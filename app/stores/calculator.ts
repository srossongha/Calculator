import { defineStore } from 'pinia'

export const useCalculatorStore = defineStore('calculator', () => {

const Result = ref('0')
const previous = ref<number | null>(null)
const operator = ref<string | null>(null)
const waitingForNewInput = ref(false)

// small trail above the main number, e.g. "12 +"
const expression = computed(() =>
  previous.value === null ? '' : `${previous.value} ${operator.value ?? ''}`
)

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
    Result.value = String(previous.value + current)
  } else if (operator.value === '-') {
    Result.value = String(previous.value - current)
  } else if (operator.value === '×') {
    Result.value = String(previous.value * current)
  } else if (operator.value === '÷') {
    Result.value = String(previous.value / current)
  }

  previous.value = null
  operator.value = null
  waitingForNewInput.value = true
}

  return { Result, inputNum, setOperator, equals, clear }
})
