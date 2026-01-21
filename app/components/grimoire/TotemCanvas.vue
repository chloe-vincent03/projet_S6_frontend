<template>
  <div class="relative w-full flex items-center justify-center bg-stone-50/50 rounded-2xl border border-stone-100 overflow-hidden" :class="heightClass">
    
    <!-- Full Totem (Completed State) -->
    <div v-if="isCompleted" class="w-full h-full p-8 animate-fade-in duration-1000">
       <img 
         :src="completedImage"
         alt="Totem Complet"
         class="w-full h-full object-contain drop-shadow-2xl"
       />
    </div>

    <!-- Empty State (No fragments yet) -->
    <div v-else-if="currentFragments.length === 0" class="text-center opacity-40 select-none pointer-events-none">
      <div class="text-6xl mb-4 grayscale opacity-50">🔮</div>
      <p class="font-serif text-stone-400">Totem endormi...</p>
    </div>

    <!-- Fragments Layer (Building State) -->
    <div v-else class="relative w-full h-full flex justify-center items-center p-4">
       <!-- Centered Totem Frame -->
       <div class="relative h-full aspect-[2/3]">
           <TransitionGroup name="totem">
              <div 
                v-for="fragment in currentFragments" 
                :key="fragment.id"
                class="absolute transition-all duration-1000 ease-out flex justify-center"
                :style="{
                  top: `${fragment.y}%`,
                  left: '50%',
                  transform: 'translate(-50%, 0)', 
                  zIndex: fragment.zIndex,
                  width: fragment.width ? `${fragment.width * scale}px` : `${100 * scale}px`
                }"
              >
                <img 
                  :src="fragment.url"
                  class="w-full h-auto"
                  :style="{
                    filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                  }"
                  alt="Totem Fragment"
                />
              </div>
           </TransitionGroup>
       </div>
    </div>

    <!-- Light Atmosphere Overlay (Optional) -->
    <!-- <div class="absolute inset-0 pointer-events-none bg-gradient-to-t from-white/20 to-transparent"></div> -->
    
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGrimoireStore } from '~/stores/grimoire'

const props = defineProps({
  scale: {
    type: Number,
    default: 1
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  totemId: {
    type: Number,
    required: true
  },
  completedImage: {
    type: String,
    required: true
  },
  heightClass: {
    type: String,
    default: 'h-[600px]'
  }
})

const store = useGrimoireStore()

const currentFragments = computed(() => {
  return store.unlockedFragments.filter(f => f.totemId === props.totemId)
})
</script>

<style scoped>
.totem-enter-active,
.totem-leave-active {
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.totem-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.totem-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
