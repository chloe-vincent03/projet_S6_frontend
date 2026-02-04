import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null,
        loading: false,
        error: null
    }),

    getters: {
        isAuthenticated: (state) => !!state.user,
        unlockedFragments: (state) => state.user?.unlockedFragments || [],
        avatar: (state) => state.user?.avatar,
        username: (state) => state.user?.username
    },

    actions: {
        async fetchUser() {
            const config = useRuntimeConfig()
            const token = useCookie('auth_token').value

            if (!token) {
                this.user = null
                return
            }

            this.loading = true
            try {
                const res = await fetch(`${config.public.apiBase}/user/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                if (res.ok) {
                    const data = await res.json()
                    this.user = data.user || data // Handle potential wrapper
                } else {
                    this.error = 'Failed to fetch user'
                    if (res.status === 401) this.user = null
                }
            } catch (e) {
                this.error = e.message
            } finally {
                this.loading = false
            }
        },

        setUser(userData) {
            this.user = userData
        },

        /**
         * Update progress locally to avoid full refetch
         */
        addUnlockedFragment(fragmentId) {
            if (!this.user) return

            if (!this.user.unlockedFragments) {
                this.user.unlockedFragments = []
            }

            // Check if already exists (loose comparison for safety)
            const exists = this.user.unlockedFragments.some(f => String(f.fragmentId) === String(fragmentId))

            if (!exists) {
                // We add it to the local state. 
                // Note: The backend structure might be { fragmentId, unlockedAt }
                this.user.unlockedFragments.push({
                    fragmentId: fragmentId,
                    unlockedAt: new Date().toISOString()
                })
            }
        },

        logout() {
            this.user = null
            const token = useCookie('auth_token')
            token.value = null
        }
    }
})
