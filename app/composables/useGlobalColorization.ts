import { computed } from 'vue'

export const useGlobalColorization = () => {
    const config = useRuntimeConfig()
    const tokenCookie = useCookie('auth_token')

    // Use stored state if available, or fetch
    // We assume user profile is often fetched by other components, 
    // but to be safe we can use useAsyncData locally or rely on a shared store if it existed.
    // For now, we'll fetch profile if needed or allow passing it in.

    // We can define a simplified way to get the saturation
    const calculateSaturation = (user: any, enigmas: any[]) => {
        if (!user || !user.unlockedFragments || !enigmas) return 0 // Default B&W

        // Same logic as profile.vue to count totems
        const totems: Record<number, string[]> = {}
        enigmas.forEach(e => {
            const tId = e.totem_id || 1
            if (!totems[tId]) totems[tId] = []

            if (e.reward && e.reward.fragment_id) {
                totems[tId].push(e.reward.fragment_id)
            }
        })

        let completedCount = 0
        const totalTotems = Object.keys(totems).length // Dynamically count how many distinct totems exist

        Object.keys(totems).forEach(tIdKey => {
            const tId = Number(tIdKey)
            const totemEnigmas = totems[tId] || []
            if (totemEnigmas.length === 0) return

            const isComplete = totemEnigmas.every((eId: string) =>
                user.unlockedFragments.some((uf: any) => String(uf.fragmentId) === String(eId))
            )

            if (isComplete) completedCount++
        })

        if (totalTotems === 0) return 0

        // Return ratio 0 to 1
        return Math.min(completedCount / totalTotems, 1)
    }

    return {
        calculateProgress: calculateSaturation
    }
}
