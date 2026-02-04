import Lenis from 'lenis'

export default defineNuxtPlugin((nuxtApp) => {
    // Only run on client-side
    if (process.client) {
        const lenis = new Lenis({
            duration: 2.5, // Slower duration for "heavy" feel (default is usually 1.2)
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Default easing
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.8, // Reduce wheel sensitivity slightly
            touchMultiplier: 1.5, // Keep touch responsive
        })

        // Animation Frame Loop
        function raf(time: number) {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }

        requestAnimationFrame(raf)

        // Inject lenis instance if needed elsewhere
        nuxtApp.provide('lenis', lenis)

        // Optional: Reset scroll on page navigation if Nuxt doesn't handle it perfectly with Lenis
        nuxtApp.hook('page:finish', () => {
            lenis.scrollTo(0, { immediate: true })
        })
    }
})
