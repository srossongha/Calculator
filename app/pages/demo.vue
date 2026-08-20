<script setup lang="ts">
// ---- state -------------------------------------------------------------
const current = ref('0')                    // what's on screen right now
const previous = ref<number | null>(null)   // the number we stored before an operator
const operator = ref<string | null>(null)   // '+', '-', '×', '÷'
const overwrite = ref(false)                // next digit should replace the screen

// small line above the big number, e.g. "12 ×"
const expression = computed(() =>
  previous.value === null ? '' : `${previous.value} ${operator.value ?? ''}`
)

// ---- core math ---------------------------------------------------------
function compute(a: number, b: number, op: string): number {
  switch (op) {
    case '+': return a + b
    case '-': return a - b
    case '×': return a * b
    case '÷': return a / b
    default: return b
  }
}

// ---- actions -----------------------------------------------------------
function inputDigit(d: string) {
  if (overwrite.value || current.value === '0' || current.value === 'Error') {
    current.value = d
    overwrite.value = false
  } else {
    current.value += d
  }
}

function inputDot() {
  if (overwrite.value || current.value === 'Error') {
    current.value = '0.'
    overwrite.value = false
    return
  }
  if (!current.value.includes('.')) current.value += '.'
}

function chooseOperator(op: string) {
  if (current.value === 'Error') return
  const value = Number(current.value)

  // chaining: 2 + 3 + → evaluate the first part before storing the new operator
  if (previous.value !== null && operator.value && !overwrite.value) {
    const result = compute(previous.value, value, operator.value)
    previous.value = result
    current.value = format(result)
  } else {
    previous.value = value
  }

  operator.value = op
  overwrite.value = true
}

function equals() {
  if (previous.value === null || !operator.value) return
  const result = compute(previous.value, Number(current.value), operator.value)
  current.value = Number.isFinite(result) ? format(result) : 'Error'
  previous.value = null
  operator.value = null
  overwrite.value = true
}

function clearAll() {
  current.value = '0'
  previous.value = null
  operator.value = null
  overwrite.value = false
}

function backspace() {
  if (overwrite.value || current.value === 'Error') return clearAll()
  current.value = current.value.length > 1 ? current.value.slice(0, -1) : '0'
}

function toggleSign() {
  if (current.value === '0' || current.value === 'Error') return
  current.value = current.value.startsWith('-')
    ? current.value.slice(1)
    : '-' + current.value
}

function percent() {
  if (current.value === 'Error') return
  current.value = format(Number(current.value) / 100)
  overwrite.value = true
}

// avoid 0.30000000000000004 showing up on screen
function format(n: number) {
  return String(Number(n.toPrecision(12)))
}

// ---- keyboard ----------------------------------------------------------
const keyMap: Record<string, () => void> = {
  '+': () => chooseOperator('+'),
  '-': () => chooseOperator('-'),
  '*': () => chooseOperator('×'),
  '/': () => chooseOperator('÷'),
  'Enter': equals,
  '=': equals,
  'Backspace': backspace,
  'Escape': clearAll,
  '.': inputDot,
  ',': inputDot,
  '%': percent,
}

function onKey(e: KeyboardEvent) {
  if (/^[0-9]$/.test(e.key)) return inputDigit(e.key)
  const action = keyMap[e.key]
  if (action) {
    e.preventDefault()
    action()
  }
}

// window only exists in the browser — Nuxt renders on the server first
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

// ---- button layout -----------------------------------------------------
type Key = { label: string; run: () => void; kind?: 'op' | 'fn' | 'eq'; wide?: boolean }

const keys: Key[] = [
  { label: 'AC', run: clearAll, kind: 'fn' },
  { label: '+/-', run: toggleSign, kind: 'fn' },
  { label: '%', run: percent, kind: 'fn' },
  { label: '÷', run: () => chooseOperator('÷'), kind: 'op' },

  { label: '7', run: () => inputDigit('7') },
  { label: '8', run: () => inputDigit('8') },
  { label: '9', run: () => inputDigit('9') },
  { label: '×', run: () => chooseOperator('×'), kind: 'op' },

  { label: '4', run: () => inputDigit('4') },
  { label: '5', run: () => inputDigit('5') },
  { label: '6', run: () => inputDigit('6') },
  { label: '-', run: () => chooseOperator('-'), kind: 'op' },

  { label: '1', run: () => inputDigit('1') },
  { label: '2', run: () => inputDigit('2') },
  { label: '3', run: () => inputDigit('3') },
  { label: '+', run: () => chooseOperator('+'), kind: 'op' },

  { label: '0', run: () => inputDigit('0'), wide: true },
  { label: '.', run: inputDot },
  { label: '=', run: equals, kind: 'eq' },
]
</script>

<template>
  <main class="page">
    <section class="calc">
      <div class="screen">
        <p class="expression">{{ expression }}&nbsp;</p>
        <p class="current">{{ current }}</p>
      </div>

      <div class="pad">
        <button
          v-for="key in keys"
          :key="key.label"
          class="key"
          :class="[key.kind, { wide: key.wide }]"
          type="button"
          @click="key.run"
        >
          {{ key.label }}
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.page {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  background: #10151c;
  padding: 1.5rem;
}

.calc {
  width: min(360px, 100%);
  background: #171e27;
  border: 1px solid #232d3a;
  border-radius: 20px;
  padding: 1.25rem;
  box-shadow: 0 24px 60px rgb(0 0 0 / 0.45);
}

.screen {
  padding: 1.25rem 0.75rem 1.5rem;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.expression {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7a8d;
  min-height: 1.2em;
}

.current {
  margin: 0.25rem 0 0;
  font-size: clamp(2.25rem, 12vw, 3rem);
  font-weight: 300;
  color: #f2f6fb;
  overflow-wrap: anywhere;
}

.pad {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.6rem;
}

.key {
  aspect-ratio: 1;
  border: none;
  border-radius: 14px;
  background: #212b37;
  color: #e8eef6;
  font-size: 1.25rem;
  cursor: pointer;
  transition: background 120ms ease, transform 80ms ease;
}

.key:hover { background: #2a3542; }
.key:active { transform: scale(0.95); }
.key:focus-visible { outline: 2px solid #7dd3fc; outline-offset: 2px; }

.key.fn { background: #2c3846; color: #a9bccf; }
.key.fn:hover { background: #35424f; }

.key.op { background: #1e3a5f; color: #9ecbff; }
.key.op:hover { background: #244a78; }

.key.eq { background: #2563eb; color: #fff; }
.key.eq:hover { background: #1d4ed8; }

.key.wide {
  grid-column: span 2;
  aspect-ratio: auto;
}

@media (prefers-reduced-motion: reduce) {
  .key { transition: none; }
}
</style>