<script setup lang="ts">
// ^ the round arrow cross that walks the cursor along the line.
// & it owns no state. it cannot move the cursor itself — it only ANNOUNCES
// & that an arrow was pressed, and the page decides what that means.
defineEmits<{
  move: [where: CursorMove]
}>()
</script>

<template>
  <div class="flex justify-center py-1">
    <div class="grid h-24 w-24 grid-cols-3 grid-rows-3 rounded-full bg-neutral-700 shadow-inner">
      <button
        class="col-start-2 row-start-1 rounded-t-full text-white transition-colors hover:bg-neutral-600 active:bg-neutral-500"
        title="Jump to the start of the line"
        @click="$emit('move', 'start')"
      >&uarr;</button>
      <button
        class="col-start-1 row-start-2 rounded-l-full text-white transition-colors hover:bg-neutral-600 active:bg-neutral-500"
        title="Move left one step"
        @click="$emit('move', 'left')"
      >&larr;</button>

      <!-- &the dead centre of the cross: decoration, not a button -->
      <div class="col-start-2 row-start-2 m-0.5 rounded-full bg-neutral-900"></div>

      <button
        class="col-start-3 row-start-2 rounded-r-full text-white transition-colors hover:bg-neutral-600 active:bg-neutral-500"
        title="Move right one step"
        @click="$emit('move', 'right')"
      >&rarr;</button>
      <button
        class="col-start-2 row-start-3 rounded-b-full text-white transition-colors hover:bg-neutral-600 active:bg-neutral-500"
        title="Jump to the end of the line"
        @click="$emit('move', 'end')"
      >&darr;</button>
    </div>
  </div>
</template>
