<template>
  <!-- Main Container: Locks scroll if not unlocked -->
  <div :class="['min-h-screen bg-stone-50 transition-all duration-1000', { 'h-screen overflow-hidden': !isUnlocked }]">
    
    <div v-if="pending" class="flex items-center justify-center h-screen">
      <p class="text-stone-500 animate-pulse">Chargement de la ville...</p>
    </div>
    
    <div v-else-if="error" class="flex flex-col items-center justify-center h-screen text-red-500">
      <p class="font-bold">Erreur de chargement</p>
      <p class="text-sm mt-2">{{ error.message }}</p>
    </div>
    
    <div v-else-if="places && places.length > 0">
       <!-- HERO SECTION (Full Viewport Height) -->
       <section class="relative w-full h-screen">
         <!-- Title Overlay -->
         <div class="absolute inset-0 z-20 flex items-center justify-center pointer-events-none mix-blend-difference">
            <h1 class="text-5xl md:text-7xl font-serif font-bold text-white tracking-wider text-center px-4">
               Réenchanter le monde
            </h1>
         </div>

         <ScratchReveal 
           :inkLayer="firstPlace.inkLayer" 
           :watercolorLayer="firstPlace.watercolorLayer" 
           class="w-full h-full"
           @complete="handleUnlock"
         />
         
         <!-- Instructions / Progress Overlay -->
         <div class="absolute bottom-12 left-0 w-full text-center pointer-events-none z-20 flex flex-col items-center gap-4 transition-opacity duration-500" :class="{ 'opacity-0': isUnlocked }">
            <div class="px-6 py-3 bg-black/40 backdrop-blur-md rounded-full text-white/90 font-medium text-lg shadow-sm border border-white/10">
               ✨ Coloriez pour découvrir
            </div>
         </div>
         
         <!-- Scroll Indicator (Visible only when unlocked) -->
         <div class="absolute bottom-12 left-0 w-full flex justify-center pointer-events-none z-30 transition-all duration-700 transform" 
              :class="isUnlocked ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'">
            <div class="animate-bounce p-2 bg-white/20 backdrop-blur-sm rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
            </div>
         </div>
       </section>

       <!-- CONTENT SECTION (Scroll to see) -->
       <section class="container mx-auto px-6 py-24 max-w-4xl" id="content-start">
          <article class="flex flex-col gap-8 text-center">
             <span class="text-sm font-bold uppercase tracking-widest text-emerald-600">Chapitre 1</span>
             <h2 class="text-5xl font-serif text-stone-900 leading-tight">{{ firstPlace.title }}</h2>
             
             <div class="w-24 h-1 bg-stone-200 mx-auto my-4"></div>
             
             <p class="text-xl text-stone-600 leading-loose font-light">
               {{ firstPlace.description }}
             </p>
          </article>

          <!-- Placeholder for following content -->
          <div class="mt-32 p-12 bg-white rounded-2xl shadow-sm border border-stone-100 text-center text-stone-400">
             (La suite de la visite arrive bientôt...)
          </div>
       </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const config = useRuntimeConfig()
const { data: places, pending, error } = await useFetch(`${config.public.apiBase}/places`)

// Use the first place for the Hero
const firstPlace = computed(() => places.value?.[0])

// Scroll Lock Logic
const isUnlocked = ref(false)

const handleUnlock = () => {
  if (!isUnlocked.value) {
    isUnlocked.value = true
    // Optional: Smooth scroll nudge to hint content?
  }
}
</script>
