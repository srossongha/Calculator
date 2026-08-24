<script setup lang="ts">
// ^ the whole calculator on one page: state at the top, markup below.
// & the maths still lives in app/utils/ and the state in useCalculator() —
// & only the markup was brought back here, so this file stays readable.

// &these come from node_modules, and Nuxt only auto-imports your own app/
// &folder — so unlike useCalculator() below, they need real import lines
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { ChevronDownIcon, ArrowPathIcon, BeakerIcon } from '@heroicons/vue/20/solid'

const {
  expr, answer, history, displayParts,
  inputDigit, inputDot, inputSqrt, inputNthRoot, inputAns,
  chooseOperator, moveCursor, equals,
  restoreHistory, clearHistory, clearAll,
} = useCalculator()


const { counter } = useCounter()
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-amber-500 p-4">
    <!-- ================= state inspector link ================= -->
    <!-- &NuxtLink instead of <a>: it swaps the page in place, so useState survives -->
    <NuxtLink
      to="/calculus2"
      class="fixed top-4 left-4 z-50 inline-flex items-center gap-x-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm/6 font-semibold text-white backdrop-blur transition-colors hover:bg-white/25"
    >
      <BeakerIcon class="size-5" aria-hidden="true" />
      <span>Inspector</span>
    </NuxtLink>

    <!-- ================= history drop-down ================= -->
    <div class="fixed top-4 left-1/2 z-50 -translate-x-1/2">
      <Popover class="relative">
        <PopoverButton class="inline-flex items-center gap-x-1 text-sm/6 font-semibold text-white">
          <span>History</span>
          <ChevronDownIcon class="size-5" aria-hidden="true" />
        </PopoverButton>

        <transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="translate-y-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
        >
          <PopoverPanel class="absolute left-1/2 z-10 mt-5 flex w-screen max-w-max -translate-x-1/2 bg-transparent px-4">
            <div class="w-screen max-w-sm flex-auto overflow-hidden rounded-3xl bg-gray-800 text-sm/6 outline-1 -outline-offset-1 outline-white/10">
              <div class="max-h-72 overflow-y-auto p-2">
                <p v-if="history.length === 0" class="p-4 text-center text-gray-400">
                  Nothing calculated yet
                </p>

                <!-- &item.raw is the storable text, item.shown is the readable version -->
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
      <!-- ================= screen ================= -->
      <!-- &the typed line on top, the answer underneath -->
      <div class="mb-4 space-y-1 rounded-lg border-2 border-neutral-700 bg-lime-100 p-3 font-mono">
        <p class="overflow-x-auto whitespace-nowrap text-left text-xl text-neutral-600">
          <!-- &nothing typed yet, so show a resting 0 -->
          <template v-if="expr === ''">0</template>

          <!-- &one <span> per run. bar = a line over it (under a root),
               &level = how far it rides up as an exponent -->
          <span
            v-for="(part, i) in displayParts"
            :key="i"
            :class="part.bar ? 'border-t-2 border-current pt-px' : ''"
            :style="part.level > 0
              ? { fontSize: `${Math.pow(0.7, part.level)}em`, verticalAlign: 'super' }
              : {}"
          ><!--
            &chunks is the run split at the cursor, so a blinking bar can go
            &between them. the tags are jammed together on purpose: a newline
            &here would be rendered as a real space and push the digits apart.
          --><template v-for="(chunk, j) in part.chunks" :key="j"
            ><span v-if="j > 0" class="animate-pulse font-bold">|</span>{{ chunk }}</template
          ></span>
        </p>

        <!-- &nbsp keeps the row at full height even when there is no answer yet -->
        <p class="text-right text-2xl font-semibold text-neutral-900">{{ answer }}&nbsp;</p>
      </div>

      <!-- ================= cursor pad ================= -->
      <div class="flex justify-center py-1">
        <div class="grid h-24 w-24 grid-cols-3 grid-rows-3 rounded-full bg-neutral-700 shadow-inner">
          <button
            class="col-start-2 row-start-1 rounded-t-full text-white transition-colors hover:bg-neutral-600 active:bg-neutral-500"
            title="Jump to the start of the line"
            @click="moveCursor('start')"
          >&uarr;</button>
          <button
            class="col-start-1 row-start-2 rounded-l-full text-white transition-colors hover:bg-neutral-600 active:bg-neutral-500"
            title="Move left one step"
            @click="moveCursor('left')"
          >&larr;</button>

          <!-- &the dead centre of the cross: decoration, not a button -->
          <div class="col-start-2 row-start-2 m-0.5 rounded-full bg-neutral-900"></div>

          <button
            class="col-start-3 row-start-2 rounded-r-full text-white transition-colors hover:bg-neutral-600 active:bg-neutral-500"
            title="Move right one step"
            @click="moveCursor('right')"
          >&rarr;</button>
          <button
            class="col-start-2 row-start-3 rounded-b-full text-white transition-colors hover:bg-neutral-600 active:bg-neutral-500"
            title="Jump to the end of the line"
            @click="moveCursor('end')"
          >&darr;</button>
        </div>
      </div>

      <!-- ================= keypad ================= -->
      <div class="grid grid-cols-4 gap-2">
        <!-- &science row -->
        <button class="rounded-xl bg-neutral-600 py-3 text-xl text-white" @click="inputSqrt">&radic;</button>
        <button
          class="rounded-xl bg-neutral-600 py-3 text-xl text-white"
          title="Power: type a number, tap this, then type the exponent"
          @click="chooseOperator('^')"
        >&square;<span class="align-super text-[0.6em]">&square;</span></button>
        <button
          class="rounded-xl bg-neutral-600 py-3 text-xl text-white"
          title="Root: type which root you want, tap this, then the number (3 then this then 8 = 2)"
          @click="inputNthRoot"
        ><span class="align-super text-[0.6em]">&square;</span>&radic;&square;</button>
        <button class="rounded-xl bg-neutral-600 py-3 text-base text-white" @click="inputAns">Ans</button>

        <!-- &number rows, each ending in an operator -->
        <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="inputDigit('7')">7</button>
        <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="inputDigit('8')">8</button>
        <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="inputDigit('9')">9</button>
        <button class="aspect-square rounded-xl bg-amber-500 text-xl text-white" @click="chooseOperator('÷')">&divide;</button>

        <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="inputDigit('4')">4</button>
        <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="inputDigit('5')">5</button>
        <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="inputDigit('6')">6</button>
        <button class="aspect-square rounded-xl bg-amber-500 text-xl text-white" @click="chooseOperator('×')">&times;</button>

        <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="inputDigit('1')">1</button>
        <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="inputDigit('2')">2</button>
        <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="inputDigit('3')">3</button>
        <button class="aspect-square rounded-xl bg-amber-500 text-xl text-white" @click="chooseOperator('-')">&minus;</button>

        <button class="aspect-square rounded-xl bg-red-500 text-xl text-white" @click="clearAll">C</button>
        <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="inputDigit('0')">0</button>
        <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="inputDot">.</button>
        <button class="aspect-square rounded-xl bg-amber-500 text-xl text-white" @click="chooseOperator('+')">+</button>

        <button class="col-span-4 rounded-xl bg-amber-600 py-3 text-xl text-white" @click="equals">=</button>
      </div>
      <div>{{ counter }}</div>
    </section>
  </main>
</template>
