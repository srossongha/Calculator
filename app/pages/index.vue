<script setup lang="ts">
// ---- state ----
const expr = ref('')                    // what you typed, e.g. "5+3-2"
const answer = ref<string | null>(null) // the result, after "=" is pressed
const lastAnswer = ref(0)               // memory: the last good "=" result
const cursor = ref(0)                   // where the next button press goes

// ^---- history: every finished sum, newest first, kept across refreshes ---
// &raw = what to put back in the calculator, shown = what to read on screen.
// &useLocalStorage does the saving and loading — see app/composables
type HistoryItem = { raw: string; shown: string; result: string }
const MAX_HISTORY = 20
const history = useLocalStorage<HistoryItem[]>('calc-history', [])

// &this runs after the composable has loaded the saved list, because the
// &composable registered its onMounted first
onMounted(() => {
  // &drop anything that isn't a proper entry, in case the saved data is old
  history.value = history.value
    .filter((item) =>
      item &&
      typeof item.raw === 'string' &&
      typeof item.shown === 'string' &&
      typeof item.result === 'string')
    .slice(0, MAX_HISTORY)

  // &Ans should survive a refresh too — the newest saved result IS the last answer
  const newest = history.value[0]
  if (newest && Number.isFinite(Number(newest.result))) {
    lastAnswer.value = Number(newest.result)
  }
})


// &the stored text uses short codes, so swap them for what they mean
function prettify(text: string) {
  return text.replace(/A/g, 'Ans').replace(/ⁿ/g, '√')
}

const beforeCursor = computed(() => expr.value.slice(0, cursor.value))
const afterCursor = computed(() => expr.value.slice(cursor.value))

// &drops text in at the cursor and steps the cursor past it
function insertAtCursor(text: string) {
  expr.value = beforeCursor.value + text + afterCursor.value
  cursor.value += text.length
}

// &wipes the line when a result is on screen, so typing starts fresh
function startNewLine() {
  if (answer.value === null) return
  expr.value = ''
  cursor.value = 0
  answer.value = null
}

// does one piece of math
function calculate(a: number, b: number, op: string): number {
  if (op === '+') return a + b
  if (op === '-') return a - b
  if (op === '×') return a * b
  if (op === '÷') return a / b
  if (op === '^') return Math.pow(a, b)
  // &ⁿ: a says which root, b is the number under the sign — "3ⁿ8" is the 3rd root of 8
  if (op === 'ⁿ') {
    // &odd roots of negatives are real (3rd root of -8 is -2), but Math.pow says NaN
    if (b < 0 && Number.isInteger(a) && Math.abs(a % 2) === 1) return -Math.pow(-b, 1 / a)
    return Math.pow(b, 1 / a)
  }
  return b
}

// tidies the result: hides float noise (0.1+0.2), shows ÷0 as "Error"
function format(n: number): string {
  return Number.isFinite(n) ? String(Number(n.toPrecision(12))) : 'Error'
}


//*logic scincetist
// splits the text into pieces:  "5+3×2"  ->  ["5", "+", "3", "×", "2"]
function tokenize(text: string): string[] {
  const tokens: string[] = []
  let i = 0
  while (i < text.length) {
    const char = text[i]!
    if (/[0-9.]/.test(char)) {
      let number = char
      i++
      while (i < text.length && /[0-9.]/.test(text[i]!)) {
        number += text[i]!
        i++
      }
      tokens.push(number)
    } else {
      tokens.push(char) // +, -, ×, ÷
      i++
    }
  }
  return tokens
}

// reads the pieces and works out the answer.
// each function below handles one priority level, weakest first.
function evaluate(tokens: string[]): number {
  let pos = 0 // which piece we're looking at

  // ^ + and -  (weakest, so it splits the expression last)
  function readExpr(): number {
    let value = readTerm()
    while (tokens[pos] === '+' || tokens[pos] === '-') {
      const op = tokens[pos]!
      pos++
      value = calculate(value, readTerm(), op)
    }
    return value
  }

  // ^ × and ÷  (stronger, so they get done first)
  function readTerm(): number {
    let value = readPower()
    while (tokens[pos] === '×' || tokens[pos] === '÷') {
      const op = tokens[pos]!
      pos++
      value = calculate(value, readPower(), op)
    }
    return value
  }

  // ^  (stronger than × ÷, so 2×3^2 is 2×9)
  // note the "if" and the call to itself: that makes 2^3^2 mean 2^(3^2),
  // because the right side scoops up all the rest before anything is worked out
  function readPower(): number {
    const base = readUnary()
    if (tokens[pos] === '^' || tokens[pos] === 'ⁿ') {
      const op = tokens[pos]!
      pos++
      return calculate(base, readPower(), op)
    }
    return base
  }

  // ^ strongest: a sign stuck in front of a value ("-5", "√9"), or just a number
  function readUnary(): number {
    if (tokens[pos] === '-') { //! ignore the minus if in the front expr
      pos++
      return -readUnary()
    }
    if (tokens[pos] === '√') { //! root first
      pos++
      return Math.sqrt(readUnary())
    }
    if (tokens[pos] === 'A') { //! Ans is a value, just like a number is
      pos++
      return lastAnswer.value
    }
    const value = parseFloat(tokens[pos]!)
    pos++
    return value
  }

  return readExpr()
}





// ! For logic Oparator

// ^---- typing numbers and operators -----------------------------------
function inputDigit(digit: string) {
  startNewLine()
  // &a line can't start with 0: "05" is not how you write a number, so the
  // &first digit has to be 1-9. (a leading "0." still works via the . button)
  if (digit === '0' && beforeCursor.value === '') return
  if (beforeCursor.value.endsWith('A')) insertAtCursor('×') // Ans then "5" means Ans×5
  insertAtCursor(digit)
}
function inputDot() {
  startNewLine()
  if (beforeCursor.value.endsWith('A')) insertAtCursor('×')
  // &the number you're typing right now = whatever comes after the last operator
  const current = beforeCursor.value.split(/[+\-×÷]/).pop() ?? ''
  // &the logic of dots
  if (current.includes('.')) return             // it already has a dot, ignore
  insertAtCursor(current === '' ? '0.' : '.')   // no digits yet? start it with "0."
}

// ^ waits for a number to come after it, so it starts a new sum like a digit does
function inputSqrt() {
  startNewLine()
  // &"2" then √ means 2×√…, the way 2√4 is written in maths.
  // &without this the √ has no operator to attach to and gets ignored.
  if (endsWithValue()) insertAtCursor('×')

  insertAtCursor('√')
}

// &true if a whole value just finished before the cursor: a number, or Ans
function endsWithValue() {
  return /[0-9.A]$/.test(beforeCursor.value)
}

// ^---- ⁿ√ : the number you just typed becomes which root you want ---------
function inputNthRoot() {
  startNewLine()
  // &needs a number in front of it to be the degree, so "3" then this = 3rd root
  if (!endsWithValue()) return
  insertAtCursor('ⁿ')
}

// ^---- Ans: drop the last result into the sum ----------------------------
function inputAns() {
  startNewLine()
  if (endsWithValue()) insertAtCursor('×') // "2" then Ans means 2×Ans
  insertAtCursor('A')
}

function chooseOperator(op: string) {
  if (answer.value !== null) {
    // continue the next calculation from the previous answer
    expr.value = answer.value
    cursor.value = expr.value.length
    answer.value = null
  }
  insertAtCursor(op)
}

// ^---- arrows: walk the cursor along the line ----------------------------
function moveCursor(where: 'left' | 'right' | 'start' | 'end') {
  // &an arrow after "=" goes back to editing that line instead of wiping it
  answer.value = null

  if (where === 'left') cursor.value = Math.max(0, cursor.value - 1)
  else if (where === 'right') cursor.value = Math.min(expr.value.length, cursor.value + 1)
  else if (where === 'start') cursor.value = 0
  else cursor.value = expr.value.length
}

// ^---- equals: run the calculation and show the result -------------------
function equals() {
  if (expr.value === '') return
  cursor.value = expr.value.length // park it at the end, ready to carry on
  const result = evaluate(tokenize(expr.value))
  answer.value = format(result)
  // &only remember usable results, so an "Error" doesn't poison Ans
  if (Number.isFinite(result)) lastAnswer.value = result

  // &keep a note of what was worked out, newest at the top
  history.value.unshift({
    raw: expr.value,
    shown: prettify(expr.value),
    result: answer.value,
  })
  if (history.value.length > MAX_HISTORY) history.value.length = MAX_HISTORY
}

// ^---- tapping a history line puts that sum back on the screen -----------
function restoreHistory(raw: string) {
  expr.value = raw
  cursor.value = raw.length
  answer.value = null
}

function clearHistory() {
  history.value = []
}

// ^---- clear: reset back to a blank calculator ---------------------------
function clearAll() {
  expr.value = ''
  cursor.value = 0
  answer.value = null
}




// ! function for the root have root for num till the end
// ^---- display only: cut the text so √ can get a bar over what it covers ---
// &a marker for where the cursor is. it is slipped into the text just for
// &drawing, so it travels inside whichever run it lands in and comes out at
// &the right size and height — even inside an exponent or under a root bar.
const CURSOR = '\u0001'

const displayParts = computed(() => {
  const text = beforeCursor.value + CURSOR + afterCursor.value
  const parts: { text: string; bar: boolean; level: number }[] = []
  let i = 0

  // &reads one value the same way readUnary does: signs, then √… or a number.
  // &level = how high it sits (0 normal, 1 exponent, 2 exponent of an exponent)
  function readValue(level: number, bar: boolean) {
    let signs = ''
    while (i < text.length && text[i] === '-') { signs += text[i]!; i++ }

    if (text[i] === '√') {
      i++
      parts.push({ text: signs + '√', bar, level }) // the hook has no bar itself
      readValue(level, true)                        // what it covers does
    } else {
      let num = ''
      while (i < text.length && /[0-9.A\u0001]/.test(text[i]!)) { num += text[i]!; i++ }
      const bare = num.split(CURSOR).join('')
      parts.push({ text: bare === '' && level > 0 ? num + '□' : signs + num, bar, level })
    }

    // &a root's degree: the value we just pushed jumps up to the TOP LEFT of the √
    if (text[i] === 'ⁿ') {
      parts[parts.length - 1]!.level = level + 1
      i++
      parts.push({ text: '√', bar, level })
      readValue(level, true) // what sits under the sign gets the bar
      return
    }

    // &an exponent rides one level higher, and the "^" itself is not drawn
    if (text[i] === '^') { i++; readValue(level + 1, false) }
  }

  while (i < text.length) {
    if (/[-0-9.A√\u0001]/.test(text[i]!)) readValue(0, false)
    else { parts.push({ text: text[i]!, bar: false, level: 0 }); i++ } // + - × ÷
  }
  // &"A" is only short for storing — on screen it reads as "Ans".
  // &chunks = the part split at the cursor, so the template can draw a bar between them
  return parts.map((p) => ({
    ...p,
    chunks: p.text.replace(/A/g, 'Ans').split(CURSOR),
  }))
})


// !this for history dropbar

import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { ChevronDownIcon } from '@heroicons/vue/20/solid'
import { ArrowPathIcon } from '@heroicons/vue/24/outline'



</script>

<template>
  <main class="min-h-screen bg-amber-500 flex items-center justify-center p-4 ">
      <div class="fixed top-4 left-1/2 z-50 -translate-x-1/2">
        <Popover class="relative">
            <PopoverButton class="inline-flex items-center gap-x-1 text-sm/6 font-semibold text-white">
              <span>History</span>
              <ChevronDownIcon class="size-5" aria-hidden="true" />
            </PopoverButton>
            <transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 translate-y-1" enter-to-class="translate-y-0" leave-active-class="transition ease-in duration-150" leave-from-class="translate-y-0" leave-to-class="opacity-0 translate-y-1">
              <PopoverPanel class="absolute left-1/2 z-10 mt-5 flex w-screen max-w-max -translate-x-1/2 bg-transparent px-4">
                <div class="w-screen max-w-sm flex-auto overflow-hidden rounded-3xl bg-gray-800 text-sm/6 outline-1 -outline-offset-1 outline-white/10">
                  <div class="max-h-72 overflow-y-auto p-2">
                    <p v-if="history.length === 0" class="p-4 text-center text-gray-400">
                      Nothing calculated yet
                    </p>
                    <button
                      v-for="(item, i) in history"
                      :key="i"
                      type="button"
                      class="block w-full rounded-lg p-3 text-right font-mono hover:bg-white/5"
                      title="Tap to put this sum back on the screen"
                      @click="restoreHistory(item.raw)"
                    >
                      <span class="block truncate text-gray-400">{{ item.shown }}</span>
                      <span class="block truncate text-lg font-semibold text-white">= {{ item.result }}</span>
                    </button>
                  </div>
                  <div v-if="history.length" class="border-t border-white/10 bg-gray-700/50">
                    <button
                      type="button"
                      class="flex w-full items-center justify-center gap-x-2.5 p-3 font-semibold text-white hover:bg-gray-700/50"
                      @click="clearHistory"
                    >
                      <ArrowPathIcon class="size-5 flex-none text-gray-500" aria-hidden="true" />
                      Clear history
                    </button>
                  </div>
                </div>
              </PopoverPanel>
            </transition>
        </Popover>
      </div>
    <section class="w-full max-w-xs rounded-2xl bg-neutral-900 p-4 shadow-lg">

      <!-- screen: one line for the expression, answer bottom-right -->
      <div class="mb-4 space-y-1 rounded-lg border-2 border-neutral-700 bg-lime-100 p-3 font-mono">
        <p class="overflow-x-auto whitespace-nowrap text-left text-xl text-neutral-600">
          <template v-if="expr === ''">0</template>
          <span
            v-for="(part, i) in displayParts"
            :key="i"
            :class="part.bar ? 'border-t-2 border-current pt-px' : ''"
            :style="part.level > 0
              ? { fontSize: `${Math.pow(0.7, part.level)}em`, verticalAlign: 'super' }
              : {}"
          ><template v-for="(chunk, j) in part.chunks" :key="j"
            ><span v-if="j > 0" class="animate-pulse font-bold">|</span>{{ chunk }}</template
          ></span>
        </p>
        <p class="text-right text-2xl font-semibold text-neutral-900">{{ answer }}&nbsp;</p>
      </div>

        <!-- replay pad: one round control with the arrows in a cross, like a real calculator -->
        <div class="col-span-4 flex justify-center py-1">
          <div class="grid h-24 w-24 grid-cols-3 grid-rows-3 rounded-full bg-neutral-700 shadow-inner">
            <button
              class="col-start-2 row-start-1 rounded-t-full text-white transition-colors hover:bg-neutral-600 active:bg-neutral-500"
              title="Jump to the start of the line"
              @click="moveCursor('start')"
            >↑</button>
            <button
              class="col-start-1 row-start-2 rounded-l-full text-white transition-colors hover:bg-neutral-600 active:bg-neutral-500"
              title="Move left one step"
              @click="moveCursor('left')"
            >←</button>
            <div class="col-start-2 row-start-2 m-0.5 rounded-full bg-neutral-900"></div>
            <button
              class="col-start-3 row-start-2 rounded-r-full text-white transition-colors hover:bg-neutral-600 active:bg-neutral-500"
              title="Move right one step"
              @click="moveCursor('right')"
            >→</button>
            <button
              class="col-start-2 row-start-3 rounded-b-full text-white transition-colors hover:bg-neutral-600 active:bg-neutral-500"
              title="Jump to the end of the line"
              @click="moveCursor('end')"
            >↓</button>
          </div>
        </div>
              <!-- buttons -->
      <div class="grid grid-cols-4 gap-2">
        <!-- science row -->
        <button class="rounded-xl bg-neutral-600 py-3 text-xl text-white" @click="inputSqrt">√</button>
        <button
          class="rounded-xl bg-neutral-600 py-3 text-xl text-white"
          title="Power: type a number, tap this, then type the exponent"
          @click="chooseOperator('^')"
        >□<span class="align-super text-[0.6em]">□</span></button>
        <button
          class="rounded-xl bg-neutral-600 py-3 text-xl text-white"
          title="Root: type which root you want, tap this, then the number (3 then this then 8 = 2)"
          @click="inputNthRoot"
        ><span class="align-super text-[0.6em]">□</span>√□</button>
        <button class="rounded-xl bg-neutral-600 py-3 text-base text-white" @click="inputAns">Ans</button>


        <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="inputDigit('7')">7</button>
        <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="inputDigit('8')">8</button>
        <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="inputDigit('9')">9</button>
        <button class="aspect-square rounded-xl bg-amber-500 text-xl text-white" @click="chooseOperator('÷')">÷</button>

        <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="inputDigit('4')">4</button>
        <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="inputDigit('5')">5</button>
        <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="inputDigit('6')">6</button>
        <button class="aspect-square rounded-xl bg-amber-500 text-xl text-white" @click="chooseOperator('×')">×</button>

        <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="inputDigit('1')">1</button>
        <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="inputDigit('2')">2</button>
        <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="inputDigit('3')">3</button>
        <button class="aspect-square rounded-xl bg-amber-500 text-xl text-white" @click="chooseOperator('-')">−</button>

        <button class="aspect-square rounded-xl bg-red-500 text-xl text-white" @click="clearAll">C</button>
        <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="inputDigit('0')">0</button>
        <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="inputDot">.</button>
        <button class="aspect-square rounded-xl bg-amber-500 text-xl text-white" @click="chooseOperator('+')">+</button>
        <button class="col-span-4 rounded-xl bg-amber-600 py-3 text-xl text-white" @click="equals">=</button>
      </div>
    </section>
  </main>
</template>
