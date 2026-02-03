<script setup lang="ts">
import { computed, watch, onMounted, ref } from 'vue'
import MagicCursor from '~/components/shared/MagicCursor.vue'
import GuardiansOfSilence from '~/components/shared/GuardiansOfSilence.vue'

const config = useRuntimeConfig()
const tokenCookie = useCookie('auth_token')
const { calculateProgress } = useGlobalColorization()
const isMenuOpen = ref(false)

// We need user profile and enigmas to calculate totem progress
// Use useAsyncData to avoid blocking navigation too much, or useFetch with lazy: true
const { data: user, refresh: refreshUser } = useFetch<any>(`${config.public.apiBase}/user/profile`, {
  headers: computed(() => ({ 'Authorization': `Bearer ${tokenCookie.value}` })),
  lazy: true,
  server: false, // Client side mostly for visual effect updates
  watch: [tokenCookie],
  immediate: computed(() => !!tokenCookie.value && tokenCookie.value !== 'null' && tokenCookie.value !== 'undefined').value
})

const { data: enigmas } = useFetch<any[]>(`${config.public.apiBase}/enigmas`, {
    lazy: true,
    server: false
})

const progressRatio = computed(() => {
    // Default to 0 (Start of game) until data is loaded
    if (!user.value || !enigmas.value) return 0 
    return calculateProgress(user.value, enigmas.value)
})

// Interpolate between two colors
const interpolateColor = (color1: string, color2: string, factor: number) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color1);
    const result2 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color2);
    
    // Safety check for all captured groups
    if (!result || !result2 || !result[1] || !result[2] || !result[3] || !result2[1] || !result2[2] || !result2[3]) return color1

    const r1 = parseInt(result[1], 16)
    const g1 = parseInt(result[2], 16)
    const b1 = parseInt(result[3], 16)

    const r2 = parseInt(result2[1], 16)
    const g2 = parseInt(result2[2], 16)
    const b2 = parseInt(result2[3], 16)

    const r = Math.round(r1 + factor * (r2 - r1))
    const g = Math.round(g1 + factor * (g2 - g1))
    const b = Math.round(b1 + factor * (b2 - b1))

    return `rgb(${r}, ${g}, ${b})`
}

const dynamicColor = computed(() => {
    // Start: #2C3E50 (Dark Blue)
    // End: #93C5FD (Light Blue / Tailwind blue-300 approx)
    return interpolateColor('#2C3E50', '#93C5FD', progressRatio.value)
})
</script>

<template>
  <div :style="{ '--theme-dynamic': dynamicColor }">

    <!-- Magic Cursor Overlay (Client Only) -->
    <ClientOnly>
      <MagicCursor />
      <GuardiansOfSilence />
    </ClientOnly>
    
    <!-- AUTHENTICATED HEADER -->
    <header 
      v-if="tokenCookie" 
      class="fixed top-0 left-0 right-0 z-50 h-20 backdrop-blur-md shadow-sm border-b border-white/20 px-6 py-4 flex items-center justify-between transition-colors duration-1000"
      :style="{ backgroundColor: 'var(--theme-dynamic)' }"
    >
      <!-- Logo / Home -->
      <NuxtLink to="/" class="flex items-center gap-2 hover:scale-105 transition-transform text-white z-50 relative">
        <span class="text-2xl font-bold tracking-widest" style="font-family: 'Cinzel', serif;">La Ville Lente</span>
      </NuxtLink>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex items-center gap-6">
        <NuxtLink 
          to="/grimoire" 
          class="font-medium text-white/80 hover:text-white transition-colors"
          active-class="!text-white font-bold"
        >
          Grimoire
        </NuxtLink>

        <NuxtLink 
          to="/map" 
          class="font-medium text-white/80 hover:text-white transition-colors"
          active-class="!text-white font-bold"
        >
          Carte
        </NuxtLink>

        <NuxtLink 
          to="/profile" 
          class="px-4 py-2 rounded-full border border-white/20 bg-white hover:bg-white/90 transition-all shadow-sm hover:shadow-md text-sm font-bold"
          :style="{ color: 'var(--theme-dynamic)' }"
          active-class="border-white"
        >
          Mon Profil
        </NuxtLink>
      </nav>

      <!-- Mobile Hamburger Button -->
      <button 
        @click="isMenuOpen = !isMenuOpen" 
        class="md:hidden z-50 relative p-2 text-white focus:outline-none"
      >
        <div class="w-6 h-5 flex flex-col justify-between transition-all duration-300">
           <span :class="['w-full h-0.5 bg-current transition-all duration-300', isMenuOpen ? 'rotate-45 translate-y-2.5' : '']"></span>
           <span :class="['w-full h-0.5 bg-current transition-all duration-300', isMenuOpen ? 'opacity-0' : 'opacity-100']"></span>
           <span :class="['w-full h-0.5 bg-current transition-all duration-300', isMenuOpen ? '-rotate-45 -translate-y-2' : '']"></span>
        </div>
      </button>
    </header>

    <!-- Mobile Menu Overlay (Moved outside header to avoid backdrop-filter containing block issues) -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-[-10px]"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-[-10px]"
    >
      <div v-if="isMenuOpen" class="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center gap-8 md:hidden pt-20">
          
          <NuxtLink 
            to="/grimoire" 
            @click="isMenuOpen = false"
            class="text-3xl font-serif text-[#2C3E50] hover:text-[#34495E] transition-colors"
          >
            Grimoire
          </NuxtLink>

          <NuxtLink 
            to="/map" 
            @click="isMenuOpen = false"
            class="text-3xl font-serif text-[#2C3E50] hover:text-[#34495E] transition-colors"
          >
            Carte
          </NuxtLink>

          <NuxtLink 
            to="/profile" 
            @click="isMenuOpen = false"
            class="px-8 py-3 rounded-full border-2 border-[#2C3E50] text-[#2C3E50] font-bold text-xl hover:bg-[#2C3E50] hover:text-white transition-all shadow-md mt-4"
          >
            Mon Profil
          </NuxtLink>

      </div>
    </Transition>

    <!-- Add padding to main content if header is present to avoid overlap -->
    <main :class="{ 'pt-20': tokenCookie }" class="flex-grow min-h-[calc(100vh-80px)]">
      <slot />
    </main>

    <!-- FOOTER -->
    <footer class="w-full py-8 mt-auto border-t border-white/20 backdrop-blur-sm transition-colors duration-1000"
            :style="{ backgroundColor: 'var(--theme-dynamic)' }">
      <div class="container mx-auto px-6 text-center">
        
        <div class="flex flex-wrap justify-center gap-6 mb-4 text-sm font-medium">
          <NuxtLink to="/mentions-legales" class="text-white/80 hover:text-white transition-colors">
            Mentions Légales
          </NuxtLink>
          <NuxtLink to="/cgu" class="text-white/80 hover:text-white transition-colors">
            CGU
          </NuxtLink>
          <NuxtLink to="/politique-confidentialite" class="text-white/80 hover:text-white transition-colors">
            Politique de Confidentialité
          </NuxtLink>
          <NuxtLink to="/contact" class="text-white/80 hover:text-white transition-colors">
            Contact
          </NuxtLink>
        </div>

        <p class="text-xs text-white/50">
          © 2026 La Ville Lente. Tous droits réservés.
        </p>
      </div>
    </footer>
  </div>
</template>

/* Global Transition for Theme Colors */
:root {
  --theme-dynamic: #2C3E50; /* Default Fallback */
}

h1, h2, h3, h4, 
.text-dynamic {
  color: var(--theme-dynamic) !important;
  transition: color 1.5s ease-out;
}

/* Apply to buttons */
button:not(.no-color-transition):not(.bg-red-500):not(.text-red-500), 
.btn-dynamic {
  transition: all 1.5s ease-out;
}

/* Force Titles and Serif Fonts */
h1, h2, h3, h4, h5, h6, .font-serif {
    color: var(--theme-dynamic) !important;
    font-weight: bold !important;
}

/* Force Primary Buttons (often bg-[#2C3E50]) */
button.bg-\[\#2C3E50\], 
a.bg-\[\#2C3E50\],
.bg-\[\#2C3E50\] {
    background-color: var(--theme-dynamic) !important;
    transition: background-color 1.5s ease-out;
}

/* Also Text colors that are dark blue */
.text-\[\#2C3E50\] {
    color: var(--theme-dynamic) !important;
    transition: color 1.5s ease-out;
}

/* Custom Utility for Hover */
.hover\:text-dynamic:hover {
    color: var(--theme-dynamic) !important;
}
