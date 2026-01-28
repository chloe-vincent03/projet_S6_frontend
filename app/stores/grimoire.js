import { defineStore } from 'pinia'

export const useGrimoireStore = defineStore('grimoire', {
    state: () => ({
        unlockedFragments: [], // Array of objects containing fragment data
    }),

    actions: {
        /**
         * Unlock a new totem fragment
         * @param {Object} fragment - Fragment data { id, url, x, y, zIndex }
         */
        unlockFragment(fragment) {
            // Avoid duplicates
            if (!this.unlockedFragments.find(f => f.id === fragment.id)) {
                this.unlockedFragments.push(fragment)
            }
        },

        /**
         * Check if a fragment is already unlocked
         * @param {String} id 
         */
        isUnlocked(id) {
            return !!this.unlockedFragments.find(f => f.id === id)
        },

        /**
         * Reset the store state (e.g. on logout)
         */
        resetStore() {
            this.unlockedFragments = []
        }
    }
})
