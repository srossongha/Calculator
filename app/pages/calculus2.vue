<script setup lang="ts">
const {counter, incresment, decrement} = useCounter()
const { answer, history } = useCalculator()
</script>

<template>
  <main class="min-h-screen bg-neutral-900 p-6 text-white">
    <div class="mx-auto max-w-md space-y-5">
      <!-- ================= header ================= -->
      <header>
        <h1 class="text-2xl font-bold">State inspector</h1>
        <p class="mt-1 text-sm text-neutral-400">
          Open <NuxtLink to="/" class="text-amber-400 underline">the calculator</NuxtLink>
          in a second tab and watch which boxes follow along.
        </p>
      </header>

      <!-- ================= counter ================= -->
      <!-- &useCounter() holds this in useState, so both tabs share one box -->
      <section class="rounded-2xl border border-white/10 bg-neutral-800 p-5">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="font-semibold">counter</h2>
            <span class="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-xs text-emerald-400">useState → shared</span>
          </div>
          <span class="font-mono text-4xl font-bold tabular-nums">{{ counter }}</span>
        </div>

        <div class="mt-4 flex gap-2">
          <button class="flex-1 rounded-lg bg-neutral-700 py-2 text-xl transition-colors hover:bg-neutral-600" @click="decrement">&minus;</button>
          <button class="flex-1 rounded-lg bg-amber-500 py-2 text-xl font-semibold transition-colors hover:bg-amber-400" @click="incresment">+</button>
        </div>
      </section>

      <!-- ================= answer ================= -->
      <!-- &useCalculator() still holds this in a plain ref(), so this page got
           &handed its own separate box and will sit on the dash forever -->
      <section class="rounded-2xl border border-white/10 bg-neutral-800 p-5">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="font-semibold">answer</h2>
            <span class="rounded-full bg-rose-500/15 px-2 py-0.5 font-mono text-xs text-rose-400">ref &rarr; local</span>
          </div>
          <span
            class="font-mono text-4xl font-bold tabular-nums"
            :class="answer === null ? 'text-neutral-600' : 'text-white'"
          >{{ answer ?? '—' }}</span>
        </div>

        <p class="mt-4 rounded-lg bg-neutral-900/60 p-3 text-xs leading-relaxed text-neutral-400">
          Work a sum out on the calculator and press
          <span class="font-mono text-neutral-200">=</span>. This box stays empty, because
          <span class="font-mono text-neutral-200">ref()</span> handed this page a different one.
          Swap it for <span class="font-mono text-neutral-200">useState()</span> and it will follow.
        </p>
      </section>
    </div>
  </main>
</template>