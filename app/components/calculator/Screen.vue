<script setup lang="ts">
// ^ the lime screen: the typed line on top, the answer underneath.
// & display-only. it receives everything it draws and sends nothing back,
// & so there are props here but no emits.
defineProps<{
  expr: string                  // &only used to know whether the line is empty
  answer: string | null         // &null means "=" hasn't been pressed yet
  displayParts: DisplayPart[]   // &the runs to draw, already measured by display.ts
}>()
</script>

<template>
  <div class="mb-4 space-y-1 rounded-lg border-2 border-neutral-700 bg-lime-100 p-3 font-mono">
    <p class="overflow-x-auto whitespace-nowrap text-left text-xl text-neutral-600">
      <!-- &nothing typed yet, so show a resting 0 -->
      <template v-if="expr === ''">0</template>

      <!-- &one <span> per run. bar = a line over it (under a √),
           &level = how far it rides up as an exponent -->
      <span
        v-for="(part, i) in displayParts"
        :key="i"
        :class="part.bar ? 'border-t-2 border-current pt-px' : ''"
        :style="part.level > 0
          ? { fontSize: `${Math.pow(0.7, part.level)}em`, verticalAlign: 'super' }
          : {}"
      ><!--
        &chunks is the run split at the cursor, so a blinking bar can go between
        &them. the tags are jammed together on purpose: a newline here would be
        &rendered as a real space and push the digits apart.
      --><template v-for="(chunk, j) in part.chunks" :key="j"
        ><span v-if="j > 0" class="animate-pulse font-bold">|</span>{{ chunk }}</template
      ></span>
    </p>

    <!-- &nbsp keeps the row at full height even when there is no answer yet -->
    <p class="text-right text-2xl font-semibold text-neutral-900">{{ answer }}&nbsp;</p>
  </div>
</template>
