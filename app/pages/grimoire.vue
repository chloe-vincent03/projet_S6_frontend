<template>
  <!-- Main Container: Light Theme -->
  <div class="min-h-screen bg-[#f4f6fb] text-[#2C3E50] font-sans">
    
    <!-- No Header as requested -->
    <!-- But maybe a back button? User said "pas de header", assuming they want clean look. -->
    <div class="absolute top-6 left-6 z-50">
      <NuxtLink to="/" class="inline-flex items-center gap-2 text-[#2C3E50] opacity-60 hover:opacity-100 transition-opacity font-bold">
        ← Retour
      </NuxtLink>
    </div>

    <div class="container mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 items-start justify-center min-h-screen">
      
      <!-- Left Column: The Totem (Sticky) -->
      <div class="w-full lg:w-5/12 lg:sticky lg:top-12 h-auto z-10 flex flex-col items-center order-2 lg:order-1">
        <div class="bg-white p-6 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.05)] w-full flex flex-col items-center">
            <h2 class="font-serif text-3xl text-[#2C3E50] mb-6 font-bold">
               Totem Sacré
            </h2>
            <TotemCanvas ref="totemCanvas" :scale="3" :isCompleted="allSolved" />
            
            <p class="text-sm text-stone-500 mt-6 text-center italic max-w-xs">
               Assemblez les fragments pour réveiller l'esprit de la ville.
            </p>
        </div>
      </div>

      <!-- Right Column: The Enigmas (Scrollable) -->
      <div class="w-full lg:w-6/12 flex flex-col gap-8 order-1 lg:order-2">
        
        <div class="mb-4">
           <h1 class="text-4xl md:text-5xl font-serif font-bold text-[#2C3E50] mb-4">Le Grimoire</h1>
           <p class="text-lg text-stone-500 leading-relaxed border-l-4 border-[#2C3E50] pl-4 py-1">
             Les secrets de la ville ne se révèlent qu'à ceux qui savent regarder. Répondez aux énigmes.
           </p>
        </div>

        <!-- Enigma List -->
        <div class="flex flex-col gap-6">
           <EnigmaCard 
             v-for="enigma in enigmas" 
             :key="enigma.id"
             :enigmaId="enigma.id"
             :question="enigma.question"
             :initiallySolved="store.isUnlocked(enigma.id)"
             @unlocked="handleUnlock"
           />
        </div>

      </div>

    </div>
    <!-- Success Modal Overlay -->
    <Transition>
      <div v-if="showSuccessModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
         <div class="bg-white rounded-3xl p-12 max-w-lg w-full text-center shadow-2xl transform scale-100 animate-[bounce-in_0.5s_ease-out]">
            <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
               <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            
            <h2 class="text-3xl font-serif text-[#2C3E50] font-bold mb-4">Le Totem est Complet !</h2>
            <p class="text-stone-600 mb-8 leading-relaxed">
               Vous avez rassemblé tous les fragments. L'esprit de la ville est réveillé.
            </p>
            
            <div class="p-4 bg-stone-50 rounded-xl border border-stone-100 mb-8">
               <p class="text-[#2C3E50] font-bold flex items-center justify-center gap-2">
                 ✨ Le Totem a été ajouté à votre profil
               </p>
            </div>

            <div class="flex flex-col gap-3">
               <NuxtLink to="/profile" class="w-full py-4 bg-[#2C3E50] text-white rounded-xl font-bold hover:bg-[#34495E] hover:scale-105 transition-all shadow-lg">
                  Voir mon Profil
               </NuxtLink>
               <button @click="closeSuccessModal" class="text-stone-400 text-sm hover:text-stone-600 underline mt-2">
                  Rester sur le Grimoire
               </button>
            </div>
         </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useGrimoireStore } from '~/stores/grimoire'
// Use relative path to avoid alias issues if valid
import TotemCanvas from '../components/grimoire/TotemCanvas.vue'
import EnigmaCard from '../components/grimoire/EnigmaCard.vue'

const store = useGrimoireStore()

// Fetch Enigmas from Backend
const config = useRuntimeConfig()
const { data: enigmas } = await useFetch(`${config.public.apiBase}/enigmas`)
const tokenCookie = useCookie('auth_token')

onMounted(async () => {
  if (tokenCookie.value) {
    try {
      const res = await fetch(`${config.public.apiBase}/user/profile`, {
        headers: { 'Authorization': `Bearer ${tokenCookie.value}` }
      })
      if (res.ok) {
        const user = await res.json()
        if (user.unlockedFragments) {
            // Restore state in store
            // We need to match fragmentId from user with enigma details to get the URL/Positions
            // Since User only stores fragmentId, we need to lookup the Enigma details.
            // Ideally we should store full fragment data or lookup from enigmas list.
            
            if (enigmas.value) {
               user.unlockedFragments.forEach(pf => {
                  const enigma = enigmas.value.find(e => e.reward.fragment_id === pf.fragmentId)
                  if (enigma) {
                      store.unlockFragment({
                          id: enigma.id,
                          url: enigma.reward.fragment_svg_path,
                          x: enigma.reward.x, 
                          y: enigma.reward.y,
                          width: enigma.reward.width,
                          zIndex: enigma.reward.zIndex
                      })
                  }
               })
            }
        }
      }
    } catch (e) {
      console.error('Failed to restore grimoire progress', e)
    }
  }
})

// Check if all enigmas are solved
const allSolved = computed(() => {
  if (!enigmas.value || enigmas.value.length === 0) return false
  return enigmas.value.every(e => store.isUnlocked(e.id))
})

const showSuccessModal = ref(false)

// Watch for completion to show modal (Only once)
watch(allSolved, (newVal) => {
  if (newVal) {
    if (process.client) {
       const hasSeen = localStorage.getItem('totem_completion_seen_v1')
       if (!hasSeen) {
           showSuccessModal.value = true
           localStorage.setItem('totem_completion_seen_v1', 'true')
       }
    }
  }
}, { immediate: true })

const closeSuccessModal = () => {
    showSuccessModal.value = false
}

const handleUnlock = (fragment) => {
  store.unlockFragment(fragment)
}
</script>

<style scoped>
/* Simple fade transition for the modal */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
