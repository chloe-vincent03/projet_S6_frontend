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
         <div class="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <h1 class="text-5xl md:text-7xl font-serif font-bold tracking-wider text-center px-4 drop-shadow-md" style="color: white !important;">
               Réenchanter le Monde
            </h1>
         </div>



         <div v-if="!isUnlocked" class="w-full h-full relative z-10">
           <ScratchReveal 
             :inkLayer="firstPlace.inkLayer" 
             :watercolorLayer="firstPlace.watercolorLayer" 
             :brushSize="100"
             class="w-full h-full"
             @complete="handleUnlock"
           />
         </div>
         <img 
           v-else
           :src="optimizeImage(firstPlace.watercolorLayer, 1200)" 
           alt="Révélé"
           class="absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-1000 ease-in-out"
           fetchpriority="high"
           decoding="async"
         />
         
         <!-- Instructions / Progress Overlay -->
         <div class="absolute bottom-12 left-0 w-full text-center pointer-events-none z-20 flex flex-col items-center gap-4 transition-opacity duration-500" :class="{ 'opacity-0': isUnlocked }">
            <div class="px-6 py-3 bg-black/40 backdrop-blur-md rounded-full text-white/90 font-medium text-lg shadow-sm border border-white/10">
               Coloriez pour découvrir
            </div>
            
            <NuxtLink v-if="!tokenCookie" to="/login" class="pointer-events-auto text-white/80 text-sm hover:text-white hover:underline transition-colors font-medium shadow-black drop-shadow-md">
              Déjà un compte ? Se connecter
            </NuxtLink>
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
             <span class="text-sm font-bold uppercase tracking-widest text-stone-500">Chapitre 1</span>
             <h2 class="text-5xl font-serif text-[#2C3E50] leading-tight">{{ firstPlace.title }}</h2>
             
             <div class="w-24 h-1 bg-stone-200 mx-auto my-4"></div>
             
             <p class="text-xl text-stone-600 leading-loose font-light">
               {{ firstPlace.description }}
             </p>
          </article>

          <!-- MAP / ENIGMA SECTION -->
          <div class="mt-24 mb-12 w-full max-w-4xl mx-auto flex flex-col items-center gap-12 relative z-40">

            <!-- NAVIGATION / DASHBOARD -->
            <div class="p-10 glass-panel rounded-[3rem] text-center max-w-4xl w-full">
              
              <!-- Narrative Intro -->
              <div class="mb-10 max-w-2xl mx-auto">
                <h3 class="text-2xl font-serif text-[#2C3E50] font-bold mb-4">La Ville Lente</h3>
                <p class="text-stone-600 text-lg leading-relaxed">
                  En découvrant les lieux de la ville, vous dévoilez son histoire et participez à sa création. Chaque secret révélé ajoute une pierre à l'édifice.
                </p>
              </div>

              <!-- Action Grid -->
              <div v-if="tokenCookie" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <!-- Card 1: Map -->
                <NuxtLink to="/map" class="group relative overflow-hidden p-8 rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center gap-6 text-center h-72" :style="{ backgroundColor: 'var(--theme-dynamic)' }">
                   <div>
                       <h4 class="text-2xl font-serif font-bold text-white mb-2" style="color: white !important;">La Carte</h4>
                       <p class="text-white/80 font-light">Explorez les lieux et suivez votre progression.</p>
                   </div>
                </NuxtLink>

                <!-- Card 2: Grimoire -->
                <NuxtLink to="/grimoire" class="group relative overflow-hidden p-8 rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center gap-6 text-center h-72" :style="{ backgroundColor: 'var(--theme-dynamic)' }">
                   <div>
                       <h4 class="text-2xl font-serif font-bold text-white mb-2" style="color: white !important;">Le Grimoire</h4>
                       <p class="text-white/80 font-light">Résolvez les énigmes et trouvez les totems.</p>
                   </div>
                </NuxtLink>

              </div>

              <!-- Guest State -->
              <div v-else class="flex flex-col gap-4 items-center mt-6">
                 <p class="text-sm text-stone-500 italic">Connectez-vous pour sauvegarder votre progression.</p>
                 <div class="flex gap-4">
                   <NuxtLink to="/login" class="px-6 py-2 border border-[#2C3E50] text-[#2C3E50] rounded-full font-bold hover:bg-stone-50 transition-colors">
                     Connexion
                   </NuxtLink>
                   <NuxtLink to="/register" class="px-6 py-2 bg-[#2C3E50] text-white rounded-full font-bold hover:bg-[#34495E] transition-colors">
                     Inscription
                   </NuxtLink>
                 </div>
              </div>
            </div>

          </div>
       </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import EnigmaCard from '~/components/grimoire/EnigmaCard.vue'

const { optimizeImage } = useImageOptimization()

const config = useRuntimeConfig()

useHead({
  title: 'Accueil',
  meta: [
    { name: 'description', content: 'Plongez dans l\'expérience immersive de La Ville Lente. Une aventure urbaine mêlant exploration réelle et mystères numériques.' },
    { property: 'og:title', content: 'Accueil - La Ville Lente' },
    { property: 'og:description', content: 'Une aventure urbaine mêlant exploration réelle et mystères numériques.' }
  ]
})

const tokenCookie = useCookie('auth_token')

const { data: places, pending, error } = useFetch(`${config.public.apiBase}/places`, { lazy: true })
const { data: enigmas } = useFetch(`${config.public.apiBase}/enigmas`, { lazy: true }) // Fetch enigmas for homepage

// Use the first place for the Hero
const firstPlace = computed(() => places.value?.[0])

// Specific logic for Homepage Enigma
const firstEnigma = computed(() => {
  // Try to find 'enigma_001' (new seed) OR '1' (old mock/seed) OR just take the first one
  return enigmas.value?.find(e => e.id === 'enigma_001') || enigmas.value?.find(e => e.id === '1') || enigmas.value?.[0]
})
const isGrimoireUnlocked = ref(false)

// Check if user has already unlocked this enigma
const checkGrimoireStatus = async () => {
    if (tokenCookie.value && tokenCookie.value !== 'null' && tokenCookie.value !== 'undefined') {
        try {
            const res = await fetch(`${config.public.apiBase}/user/profile`, {
                 headers: { 'Authorization': `Bearer ${tokenCookie.value}` }
            })
            if (res.ok) {
                const user = await res.json()
                if (user.unlockedFragments && firstEnigma.value) {
                    const hasFragment = user.unlockedFragments.some(f => f.fragmentId === firstEnigma.value.reward.fragment_id)
                    if (hasFragment) {
                        isGrimoireUnlocked.value = true
                    }
                }
            }
        } catch (e) { console.error(e) }
    }
}

const onEnigmaUnlocked = () => {
    // When EnigmaCard emits success
    isGrimoireUnlocked.value = true
}


// Scroll Lock Logic
const isUnlocked = ref(false)

const checkProgress = async () => {
  if (tokenCookie.value && tokenCookie.value !== 'null' && tokenCookie.value !== 'undefined' && firstPlace.value) {
    try {
      const userRes = await fetch(`${config.public.apiBase}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${tokenCookie.value}`
        }
      })
      if (userRes.ok) {
        const user = await userRes.json()
        const isDiscovered = user.progress?.some(p => p.placeId === firstPlace.value._id && p.isCompleted)
        
        if (isDiscovered) {
          console.log('Place already discovered, auto-unlocking.')
          isUnlocked.value = true
        }
      }
    } catch (err) {
      console.error('Error checking progress:', err)
    }
  }
}

// Watchers to trigger checks when data arrives
watch(firstPlace, (newVal) => {
  if (newVal) checkProgress()
})

watch(firstEnigma, (newVal) => {
  if (newVal) checkGrimoireStatus()
})

onMounted(() => {
  // Check immediately in case data is already there (e.g. navigation from another page)
  if (firstPlace.value) checkProgress()
  if (firstEnigma.value) checkGrimoireStatus()
})

const handleUnlock = async () => {
  if (!isUnlocked.value) {
    isUnlocked.value = true
    
    // Si connecté, on sauvegarde la progression
    if (tokenCookie.value && tokenCookie.value !== 'null' && tokenCookie.value !== 'undefined' && firstPlace.value) {
      console.log('Attempting to save progress for place:', firstPlace.value._id)
      try {
        const response = await fetch(`${config.public.apiBase}/user/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenCookie.value}`
          },
          body: JSON.stringify({ placeId: firstPlace.value._id })
        })

        if (response.ok) {
           console.log('Progress saved successfully!')
           // Optional: You could use a toast library here if available, for now console + simple alert if critical
        } else {
           console.error('Failed to save progress:', await response.text())
        }
      } catch (err) {
        console.error('Erreur sauvegarde progression', err)
      }
    } else {
        console.warn('User not logged in, progress will not be saved permanently.')
    }
  }
}
</script>
