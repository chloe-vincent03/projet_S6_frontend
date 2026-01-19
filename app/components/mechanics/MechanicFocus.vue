<template>
  <div class="relative w-full h-full">
    <!-- Image with dynamic filters -->
    <img 
      :src="image" 
      class="absolute inset-0 w-full h-full object-cover transition-all duration-100 ease-out will-change-[filter]"
      :style="{ 
        filter: `blur(${blurAmount}px) grayscale(${grayscaleAmount}%) contrast(${contrastAmount}%) brightness(${brightnessAmount}%)`
      }"
    />

    <!-- Overlay UI -->
    <div class="absolute inset-0 z-20 flex flex-col items-center justify-end pb-20 pointer-events-none">
      
      <!-- Instruction Text -->
      <div class="mb-8 text-center transition-opacity duration-500 px-6" :class="{ 'opacity-0': isCompleted }">
        <h2 class="text-white font-serif text-2xl md:text-3xl mb-2 text-shadow-lg drop-shadow-md">
           Ajustez la netteté...
        </h2>
        <p class="text-white/80 text-sm max-w-md mx-auto drop-shadow">
           Glissez pour faire la mise au point sur ce lieu.
        </p>
      </div>

      <!-- Completion Title (Only when done) -->
      <div class="mb-20 text-center transition-all duration-1000 transform px-6 absolute top-1/2 -translate-y-1/2" 
           :class="isCompleted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10'">
         <h1 class="text-white font-serif text-5xl md:text-7xl font-bold text-shadow-lg tracking-wider">{{ title }}</h1>
      </div>

      <!-- Slider Control -->
      <div class="w-full max-w-md px-8 pointer-events-auto transition-all duration-700 transform" 
           :class="{ 'translate-y-32 opacity-0': isCompleted }">
        <div class="relative h-12 bg-black/30 backdrop-blur-md rounded-full border border-white/20 flex items-center px-2">
          
          <!-- Focus Guide Visuals -->
          <div class="absolute left-4 text-white/50 text-xs">Flou</div>
          <div class="absolute right-4 text-white/50 text-xs">Net</div>

          <input 
            type="range" 
            min="0" 
            max="100" 
            v-model.number="focusLevel"
            @input="checkCompletion"
            :disabled="isCompleted"
            class="w-full h-full opacity-0 absolute inset-0 z-20 cursor-pointer"
          />
          
          <!-- Custom Handle/Thumb Visualization -->
          <div 
            class="absolute top-1 bottom-1 w-10 bg-white rounded-full shadow-lg transition-all duration-75 ease-out flex items-center justify-center"
            :style="{ left: `calc(${focusLevel}% - 20px + ${(50 - focusLevel) * 0.4}px)` }" 
          >
             <div class="w-1.5 h-4 border-l border-r border-stone-300"></div>
          </div>
          
          <!-- Progress Track -->
           <div class="absolute top-1/2 left-2 right-2 h-0.5 bg-white/20 -z-10"></div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  image: string
  title: string
}>()

const emit = defineEmits(['complete'])

const focusLevel = ref(0)
const isCompleted = ref(false)

// Computed visual styles
const blurAmount = computed(() => Math.max(0, 20 - (focusLevel.value / 100) * 20))
const grayscaleAmount = computed(() => Math.max(0, 100 - focusLevel.value))
const contrastAmount = computed(() => 80 + (focusLevel.value / 100) * 20)
const brightnessAmount = computed(() => 80 + (focusLevel.value / 100) * 20)

const checkCompletion = () => {
  if (focusLevel.value >= 98 && !isCompleted.value) {
    focusLevel.value = 100
    isCompleted.value = true
    emit('complete')
  }
}
</script>

<style scoped>
.text-shadow-lg {
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
}
</style>
