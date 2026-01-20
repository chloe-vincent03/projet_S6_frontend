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
            </h1>
         </div>



         <div v-if="!isUnlocked" class="w-full h-full relative z-10">
           <ScratchReveal 
             :inkLayer="firstPlace.inkLayer" 
             :watercolorLayer="firstPlace.watercolorLayer" 
             class="w-full h-full"
             @complete="handleUnlock"
           />
         </div>
         <img 
           v-else
           :src="firstPlace.watercolorLayer" 
           alt="Révélé"
           class="absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-1000 ease-in-out"
         />
         
         <!-- Instructions / Progress Overlay -->
         <div class="absolute bottom-12 left-0 w-full text-center pointer-events-none z-20 flex flex-col items-center gap-4 transition-opacity duration-500" :class="{ 'opacity-0': isUnlocked }">
            <div class="px-6 py-3 bg-black/40 backdrop-blur-md rounded-full text-white/90 font-medium text-lg shadow-sm border border-white/10">
               ✨ Coloriez pour découvrir ✨
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
          <div class="mt-24 mb-12 w-full max-w-4xl mx-auto flex flex-col items-center gap-12 relative z-50">

            <!-- NAVIGATION BUTTONS (Always visible) -->
            <div class="p-8 bg-white/60 backdrop-blur rounded-2xl border border-stone-100/50 text-center max-w-2xl w-full">
              <h3 class="text-xl font-serif text-[#2C3E50] font-bold mb-4">La Ville Lente</h3>
              <p class="text-stone-500 mb-8">Continuez votre exploration de la ville et découvrez ses secrets.</p>

              <div v-if="tokenCookie" class="flex flex-wrap gap-4 justify-center">
                <NuxtLink to="/map" class="inline-flex items-center gap-2 px-8 py-4 bg-[#2C3E50] text-white rounded-full font-bold shadow-lg hover:bg-[#34495E] hover:scale-105 transition-all">
                  <span>Accéder à la Carte</span>
                </NuxtLink>
                <NuxtLink to="/profile" class="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#2C3E50] border border-[#2C3E50] rounded-full font-bold shadow-lg hover:bg-stone-50 hover:scale-105 transition-all">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                   <span>Mon Profil</span>
                </NuxtLink>
              </div>
              <div v-else class="flex flex-col gap-4 items-center">
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
            
            <!-- ENIGMA CARD (Visible only if NOT solved) -->
            <div v-if="!isGrimoireUnlocked" class="w-full max-w-lg"> 
               <div class="bg-white p-8 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.05)] text-center">
                  <h3 class="font-serif text-2xl text-[#2C3E50] font-bold mb-4">Le Premier Fragment</h3>
                  
                  <p class="text-stone-500 mb-6">Un gardien protège l'accès au Grimoire. Répondez à son énigme pour continuer.</p>
                  
                  <div v-if="firstEnigma">
                    
                    <!-- Authenticated: Show Enigma -->
                    <div v-if="tokenCookie">
                        <EnigmaCard 
                          :enigmaId="firstEnigma.id"
                          :question="firstEnigma.question"
                          :initiallySolved="false"
                          @unlocked="onEnigmaUnlocked"
                        />
                    </div>

                    <!-- Not Authenticated: Show Login Prompt -->
                    <div v-else class="py-6 px-4 bg-stone-50 rounded-xl border border-stone-200">
                        <p class="text-stone-600 mb-4 font-medium">✨ Connectez-vous pour défier le gardien</p>
                        <div class="flex gap-4 justify-center text-sm">
                           <NuxtLink to="/login" class="px-4 py-2 border border-[#2C3E50] text-[#2C3E50] rounded-lg font-bold hover:bg-white transition-colors">
                             Connexion
                           </NuxtLink>
                           <NuxtLink to="/register" class="px-4 py-2 bg-[#2C3E50] text-white rounded-lg font-bold hover:bg-[#34495E] transition-colors">
                             Inscription
                           </NuxtLink>
                        </div>
                    </div>

                  </div>
                  <p v-else class="text-stone-400 italic">Le gardien dort...</p>
               </div>
            </div>

            <!-- SUCCESS SECTION (Visible only if solved) -->
            <div v-else class="w-full max-w-lg bg-white p-8 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.05)] text-center animate-fade-in-up">
               <h3 class="font-serif text-2xl text-[#2C3E50] font-bold mb-4">Le Grimoire est Ouvert</h3>
               <p class="text-stone-600 mb-8 italic">Le chemin est ouvert.</p>
               <NuxtLink to="/grimoire" class="inline-flex items-center gap-2 px-8 py-4 bg-[#2C3E50] text-white rounded-full font-bold shadow-lg hover:bg-[#34495E] hover:scale-105 transition-all">
                  <span>🔮 Entrer dans le Grimoire</span>
               </NuxtLink>
            </div>

          </div>
       </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import EnigmaCard from '~/components/grimoire/EnigmaCard.vue'

const config = useRuntimeConfig()
const tokenCookie = useCookie('auth_token')

const { data: places, pending, error } = await useFetch(`${config.public.apiBase}/places`)
const { data: enigmas } = await useFetch(`${config.public.apiBase}/enigmas`) // Fetch enigmas for homepage

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
    if (tokenCookie.value) {
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
  if (tokenCookie.value && firstPlace.value) {
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

onMounted(() => {
  checkProgress()
  checkGrimoireStatus()
})

const handleUnlock = async () => {
  if (!isUnlocked.value) {
    isUnlocked.value = true
    
    // Si connecté, on sauvegarde la progression
    if (tokenCookie.value && firstPlace.value) {
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
