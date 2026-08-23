// app/composables/useCalculator.ts
// ^ the stateful half: refs, computeds, and the button handlers that change them.
// & the maths itself lives in app/utils/ (parser, math, display, history) —
// & this file only wires those pure functions up to Vue state.

export function useCalculator() {
  // ---- state ----
  const expr = ref('')                    // what you typed, e.g. "5+3-2"
  const answer = ref<string | null>(null) // the result, after "=" is pressed
  const lastAnswer = ref(0)               // memory: the last good "=" result
  const cursor = ref(0)                   // where the next button press goes

  // ^---- history: every finished sum, newest first, kept across refreshes ---
  // &raw = what to put back in the calculator, shown = what to read on screen.
  // &useLocalStorage does the saving and loading
  const history = useLocalStorage<HistoryItem[]>('calc-history', [])

  // &this runs after the composable above has loaded the saved list, because it
  // &registered its onMounted first
  onMounted(() => {
    history.value = sanitizeHistory(history.value)
    lastAnswer.value = lastAnswerFrom(history.value, lastAnswer.value)
  })

  // ---- derived ----
  const beforeCursor = computed(() => expr.value.slice(0, cursor.value))
  const afterCursor = computed(() => expr.value.slice(cursor.value))
  const displayParts = computed(() => buildDisplayParts(beforeCursor.value, afterCursor.value))

  // ---- editing the line ----

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
    const dot = dotToInsert(beforeCursor.value)
    if (dot) insertAtCursor(dot)
  }

  // ^ waits for a number to come after it, so it starts a new sum like a digit does
  function inputSqrt() {
    startNewLine()
    // &"2" then √ means 2×√…, the way 2√4 is written in maths.
    // &without this the √ has no operator to attach to and gets ignored.
    if (endsWithValue(beforeCursor.value)) insertAtCursor('×')
    insertAtCursor('√')
  }

  // ^---- ⁿ√ : the number you just typed becomes which root you want ---------
  function inputNthRoot() {
    startNewLine()
    // &needs a number in front of it to be the degree, so "3" then this = 3rd root
    if (!endsWithValue(beforeCursor.value)) return
    insertAtCursor('ⁿ')
  }

  // ^---- Ans: drop the last result into the sum ----------------------------
  function inputAns() {
    startNewLine()
    if (endsWithValue(beforeCursor.value)) insertAtCursor('×') // "2" then Ans means 2×Ans
    insertAtCursor('A')
  }

  function chooseOperator(op: Operator) {
    if (answer.value !== null) {
      // continue the next calculation from the previous answer
      expr.value = answer.value
      cursor.value = expr.value.length
      answer.value = null
    }
    insertAtCursor(op)
  }

  // ^---- arrows: walk the cursor along the line ----------------------------
  function moveCursor(where: CursorMove) {
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

    const result = evaluateExpression(expr.value, lastAnswer.value)
    answer.value = format(result)

    // &only remember usable results, so an "Error" doesn't poison Ans
    if (Number.isFinite(result)) lastAnswer.value = result

    // &keep a note of what was worked out, newest at the top
    history.value = pushHistory(history.value, expr.value, answer.value)
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


  // &what the component is allowed to touch. anything not listed here stays private
  return {
    // state the template reads
    expr,
    answer,
    cursor,
    lastAnswer,
    history,
    displayParts,
    // buttons
    inputDigit,
    inputDot,
    inputSqrt,
    inputNthRoot,
    inputAns,
    chooseOperator,
    moveCursor,
    equals,
    restoreHistory,
    clearHistory,
    clearAll,
  }
}