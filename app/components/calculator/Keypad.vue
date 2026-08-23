<script setup lang="ts">
// ^ every button below the screen.
// & same idea as CursorPad, just more of it: this component knows how the keys
// & are ARRANGED, and nothing about what pressing one does. each key fires an
// & event and the page turns that into a change.
defineEmits<{
  digit: [d: string]
  operator: [op: Operator]
  dot: []
  sqrt: []
  nthRoot: []
  ans: []
  equals: []
  clear: []
}>()
</script>

<template>
  <div class="grid grid-cols-4 gap-2">
    <!-- &science row -->
    <button class="rounded-xl bg-neutral-600 py-3 text-xl text-white" @click="$emit('sqrt')">&radic;</button>
    <button
      class="rounded-xl bg-neutral-600 py-3 text-xl text-white"
      title="Power: type a number, tap this, then type the exponent"
      @click="$emit('operator', '^')"
    >&square;<span class="align-super text-[0.6em]">&square;</span></button>
    <button
      class="rounded-xl bg-neutral-600 py-3 text-xl text-white"
      title="Root: type which root you want, tap this, then the number (3 then this then 8 = 2)"
      @click="$emit('nthRoot')"
    ><span class="align-super text-[0.6em]">&square;</span>&radic;&square;</button>
    <button class="rounded-xl bg-neutral-600 py-3 text-base text-white" @click="$emit('ans')">Ans</button>

    <!-- &number rows, each ending in an operator -->
    <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="$emit('digit', '7')">7</button>
    <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="$emit('digit', '8')">8</button>
    <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="$emit('digit', '9')">9</button>
    <button class="aspect-square rounded-xl bg-amber-500 text-xl text-white" @click="$emit('operator', '÷')">&divide;</button>

    <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="$emit('digit', '4')">4</button>
    <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="$emit('digit', '5')">5</button>
    <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="$emit('digit', '6')">6</button>
    <button class="aspect-square rounded-xl bg-amber-500 text-xl text-white" @click="$emit('operator', '×')">&times;</button>

    <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="$emit('digit', '1')">1</button>
    <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="$emit('digit', '2')">2</button>
    <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="$emit('digit', '3')">3</button>
    <button class="aspect-square rounded-xl bg-amber-500 text-xl text-white" @click="$emit('operator', '-')">&minus;</button>

    <button class="aspect-square rounded-xl bg-red-500 text-xl text-white" @click="$emit('clear')">C</button>
    <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="$emit('digit', '0')">0</button>
    <button class="aspect-square rounded-xl bg-neutral-700 text-xl text-white" @click="$emit('dot')">.</button>
    <button class="aspect-square rounded-xl bg-amber-500 text-xl text-white" @click="$emit('operator', '+')">+</button>

    <button class="col-span-4 rounded-xl bg-amber-600 py-3 text-xl text-white" @click="$emit('equals')">=</button>
  </div>
</template>
