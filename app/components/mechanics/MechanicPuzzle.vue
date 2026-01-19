<template>
  <div class="relative w-full h-full flex flex-col items-center justify-center bg-black/90 p-4">
    
    <!-- Puzzle Container -->
    <div 
      class="relative aspect-square w-full max-w-md grid grid-cols-3 gap-1 bg-stone-800 p-1 shadow-2xl rounded-lg overflow-hidden transition-all duration-1000"
      :class="{ 'gap-0 p-0 scale-105 shadow-inner': isCompleted }"
    >
      <div 
        v-for="(tile, index) in tiles" 
        :key="tile.id"
        class="relative w-full h-full cursor-pointer transition-all duration-300 ease-in-out border-2"
        :class="[
          selectedIdx === index ? 'border-yellow-400 z-10 scale-95 brightness-110' : 'border-transparent',
          isCompleted ? 'border-none' : 'hover:brightness-110'
        ]"
        :style="{
          backgroundImage: `url(${image})`,
          backgroundSize: '300% 300%',
          backgroundPosition: `${(tile.correctPos % 3) * 50}% ${Math.floor(tile.correctPos / 3) * 50}%`
        }"
        @click="handleTileClick(index)"
      >
        <!-- Tile Number Hint (Optional, maybe for debugging or ease) -->
        <!-- <span class="absolute top-1 left-1 text-xs text-white bg-black/50 px-1">{{ tile.correctPos + 1 }}</span> -->
      </div>
    </div>

    <!-- UI Overlay -->
    <div class="absolute inset-0 z-20 flex flex-col items-center justify-end pb-20 pointer-events-none">
       <!-- Instruction Text -->
      <div class="mb-8 text-center transition-opacity duration-500 px-6" :class="{ 'opacity-0': isCompleted }">
        <h2 class="text-white font-serif text-2xl md:text-3xl mb-2 text-shadow-lg drop-shadow-md">
           Recomposez le souvenir...
        </h2>
        <p class="text-white/80 text-sm max-w-md mx-auto drop-shadow font-medium">
           Touchez deux cases pour les échanger.
        </p>
      </div>

       <!-- Completion Title -->
      <div class="mb-20 text-center transition-all duration-1000 transform px-6 absolute top-1/2 -translate-y-1/2" 
           :class="isCompleted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10'">
         <h1 class="text-white font-serif text-5xl md:text-7xl font-bold text-shadow-lg tracking-wider">{{ title }}</h1>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  image: string
  title: string
}>()

const emit = defineEmits(['complete'])

interface Tile {
  id: number
  correctPos: number
}

const tiles = ref<Tile[]>([])
const selectedIdx = ref<number | null>(null)
const isCompleted = ref(false)

// Initialize Puzzle
const initPuzzle = () => {
  // Create 9 tiles
  const newTiles = Array.from({ length: 9 }, (_, i) => ({
    id: i,
    correctPos: i
  }))

  // Shuffle (Fisher-Yates) - Ensure it's not already solved
  do {
    for (let i = newTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tempI = newTiles[i]
      const tempJ = newTiles[j]
      if (tempI && tempJ) {
         newTiles[i] = tempJ
         newTiles[j] = tempI
      }
    }
  } while (checkWin(newTiles)) // Retry if coincidentally solved

  tiles.value = newTiles
}

const handleTileClick = (index: number) => {
  if (isCompleted.value) return

  if (selectedIdx.value === null) {
    // Select first tile
    selectedIdx.value = index
  } else if (selectedIdx.value === index) {
    // Deselect if clicking same
    selectedIdx.value = null
  } else {
    // Swap
    swapTiles(selectedIdx.value, index)
    selectedIdx.value = null
    
    if (checkWin(tiles.value)) {
      complete()
    }
  }
}

const swapTiles = (idx1: number, idx2: number) => {
  const tile1 = tiles.value[idx1]
  const tile2 = tiles.value[idx2]
  if (tile1 && tile2) {
    tiles.value[idx1] = tile2
    tiles.value[idx2] = tile1
  }
}

const checkWin = (currentTiles: Tile[]) => {
  return currentTiles.every((tile, index) => tile.correctPos === index)
}

const complete = () => {
  isCompleted.value = true
  setTimeout(() => {
    emit('complete')
  }, 1000)
}

onMounted(() => {
  initPuzzle()
})
</script>

<style scoped>
.text-shadow-lg {
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
}
</style>
