<script setup lang="ts">
// ^ the History drop-down pinned to the top of the page.
// & NOTE the imports below. everything in app/utils and app/components is
// & auto-imported by Nuxt, but these come from node_modules — Nuxt does not
// & auto-import other people's packages, so they need real import lines.
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { ChevronDownIcon, ArrowPathIcon } from '@heroicons/vue/20/solid'

defineProps<{
  history: HistoryItem[]
}>()

defineEmits<{
  restore: [raw: string]   // &put this sum back on the screen
  clear: []                // &throw the whole list away
}>()
</script>

<template>
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
                @click="$emit('restore', item.raw)"
              >
                <span class="block truncate text-gray-400">{{ item.shown }}</span>
                <span class="block truncate text-lg font-semibold text-white">= {{ item.result }}</span>
              </button>
            </div>

            <div v-if="history.length" class="border-t border-white/10 bg-gray-700/50">
              <button
                type="button"
                class="flex w-full items-center justify-center gap-x-2.5 p-3 font-semibold text-white hover:bg-gray-700/50"
                @click="$emit('clear')"
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
</template>
