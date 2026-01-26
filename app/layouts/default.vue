<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import MagicCursor from '~/components/shared/MagicCursor.vue'
import GuardiansOfSilence from '~/components/shared/GuardiansOfSilence.vue'

const config = useRuntimeConfig()
const tokenCookie = useCookie('auth_token')
const { calculateProgress } = useGlobalColorization()

// We need user profile and enigmas to calculate totem progress
// Use useAsyncData to avoid blocking navigation too much, or useFetch with lazy: true
const { data: user, refresh: refreshUser } = useFetch<any>(`${config.public.apiBase}/user/profile`, {
  headers: computed(() => ({ 'Authorization': `Bearer ${tokenCookie.value}` })),
  lazy: true,
  server: false, // Client side mostly for visual effect updates
  watch: [tokenCookie]
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
      class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/50 px-6 py-4 flex items-center justify-between transition-all"
    >
      <!-- Logo / Home -->
      <NuxtLink to="/" class="flex items-center gap-2 hover:scale-105 transition-transform text-dynamic">
        <span class="text-2xl font-bold tracking-widest" style="font-family: 'Cinzel', serif;">La Ville Lente</span>
      </NuxtLink>

      <!-- Navigation -->
      <nav class="flex items-center gap-6">
        <NuxtLink 
          to="/grimoire" 
          class="font-medium text-stone-600 hover:text-stone-900 transition-colors"
          active-class="!text-stone-900 font-bold"
        >
          Grimoire
        </NuxtLink>

        <NuxtLink 
          to="/map" 
          class="font-medium text-stone-600 hover:text-stone-900 transition-colors"
          active-class="!text-stone-900 font-bold"
        >
          Carte
        </NuxtLink>

        <NuxtLink 
          to="/profile" 
          class="px-4 py-2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 transition-all shadow-sm hover:shadow-md text-sm font-bold text-stone-700"
          active-class="border-stone-400"
        >
          Mon Profil
        </NuxtLink>
      </nav>
    </header>

    <!-- Add padding to main content if header is present to avoid overlap -->
    <main :class="{ 'pt-20': tokenCookie }" class="flex-grow min-h-[calc(100vh-80px)]">
      <slot />
    </main>

    <!-- FOOTER -->
    <footer class="w-full py-8 mt-auto bg-white/50 border-t border-stone-100 backdrop-blur-sm">
      <div class="container mx-auto px-6 text-center">
        
        <div class="flex flex-wrap justify-center gap-6 mb-4 text-sm font-medium">
          <NuxtLink to="/mentions-legales" class="text-stone-500 hover:text-dynamic transition-colors">
            Mentions Légales
          </NuxtLink>
          <NuxtLink to="/cgu" class="text-stone-500 hover:text-dynamic transition-colors">
            CGU
          </NuxtLink>
          <NuxtLink to="/politique-confidentialite" class="text-stone-500 hover:text-dynamic transition-colors">
            Politique de Confidentialité
          </NuxtLink>
          <NuxtLink to="/contact" class="text-stone-500 hover:text-dynamic transition-colors">
            Contact
          </NuxtLink>
        </div>

        <p class="text-xs text-stone-400">
          © 2026 La Ville Lente. Tous droits réservés.
        </p>
      </div>
    </footer>
  </div>
</template>

<style>
/* Global Transition for Theme Colors */
:root {
  --theme-dynamic: #2C3E50; /* Default Fallback */
}

h1, h2, h3, h4, 
.text-dynamic {
  color: var(--theme-dynamic) !important;
  transition: color 1.5s ease-out;
}

/* Apply to buttons, but avoid specifically destructive ones if possible */
button:not(.no-color-transition):not(.bg-red-500):not(.text-red-500), 
.btn-dynamic {
  transition: all 1.5s ease-out;
}

/* 
   Specific override for elements that usually use the dark blue 
   We target arbitrary classes that likely use the specific dark blue hex #2C3E50
   or we force common elements.
*/

/* Target headers explicitly inside components if needed, globally set above */

/* Target common button styles used in the app */
/* Example: 'bg-[#2C3E50]' is used often. We can try to override it globally if it's a class? 
   No, cannot override utility class easily without !important or specific target.
   
   Better strategy: Target specific semantic elements or classes you want to change.
   User asked "Titles and Buttons".
*/

/* Force Titles */
h1, h2, h3, .font-serif {
    color: var(--theme-dynamic) !important;
}

/* Force Primary Buttons (often bg-[#2C3E50]) */
/* We target elements with that specific background class if possible, or just all generic buttons */
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
</style>
