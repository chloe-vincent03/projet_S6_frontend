<template>
  <div ref="cardRef" class="relative w-full max-w-4xl mx-auto my-24 h-[60vh] flex items-center justify-center">
    <!-- Container for images -->
    <div class="relative w-full h-full">
      <!-- Ink Layer (Base) -->
      <img 
        :src="place.inkLayer" 
        :alt="place.title + ' ink'"
        class="absolute top-0 left-0 w-full h-full object-contain" 
      />
      
      <!-- Watercolor Layer (Animated) -->
      <img 
        ref="watercolorRef"
        :src="place.watercolorLayer" 
        :alt="place.title + ' watercolor'"
        class="absolute top-0 left-0 w-full h-full object-contain opacity-0"
      />
    </div>

    <!-- Content Overlay (Optional, if needed based on title/desc) -->
    <div class="absolute bottom-[-2rem] left-0 w-full text-center">
      <h2 class="text-2xl font-serif text-stone-800">{{ place.title }}</h2>
      <p class="text-stone-600 mt-2">{{ place.description }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const props = defineProps({
  place: {
    type: Object,
    required: true
  }
})

const cardRef = ref(null)
const watercolorRef = ref(null)
let ctx

if (process.client) {
  gsap.registerPlugin(ScrollTrigger)
}

onMounted(() => {
  if (process.client) {
    ctx = gsap.context(() => {
      gsap.to(watercolorRef.value, {
        opacity: 1,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: cardRef.value,
          start: 'top center', // Animation starts when top of card hits center of viewport
          end: 'center center', // Fully visible when center of card hits center
          scrub: true, // Smooth scrubbing
        }
      })
    }, cardRef.value)
  }
})

onUnmounted(() => {
  if (ctx) ctx.revert()
})
</script>
