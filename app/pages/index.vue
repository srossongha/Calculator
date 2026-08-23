<script setup lang="ts">
// ^ the page: it holds the state and hands it out. no maths, no markup detail.
// & useCalculator() is called ONCE, here. the four components below own no
// & state of their own — they receive what they draw and report what was
// & pressed, and every change happens in this one place.
const {
  expr, answer, history, displayParts,
  inputDigit, inputDot, inputSqrt, inputNthRoot, inputAns,
  chooseOperator, moveCursor, equals,
  restoreHistory, clearHistory, clearAll,
} = useCalculator()
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-amber-500 p-4">
    <CalculatorHistory
      :history="history"
      @restore="restoreHistory"
      @clear="clearHistory"
    />

    <section class="w-full max-w-xs rounded-2xl bg-neutral-900 p-4 shadow-lg">
      <CalculatorScreen
        :expr="expr"
        :answer="answer"
        :display-parts="displayParts"
      />

      <CalculatorCursorPad @move="moveCursor" />

      <CalculatorKeypad
        @digit="inputDigit"
        @operator="chooseOperator"
        @dot="inputDot"
        @sqrt="inputSqrt"
        @nth-root="inputNthRoot"
        @ans="inputAns"
        @equals="equals"
        @clear="clearAll"
      />
    </section>
  </main>
</template>
