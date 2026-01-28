<script setup>
useHead({
  title: "Mentions Légales - La Ville Lente",
});
</script>

<template>
    <main class="min-h-screen bg-[#e9ecf5] py-12">
        <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <header class="mb-12 text-center">
                <h1 class="text-4xl md:text-5xl text-[#2C3E50] font-serif font-bold mb-4">
                    Mentions Légales
                </h1>
                <p class="text-stone-500">
                    Dernière mise à jour : <span class="font-medium">Janvier 2026</span>
                </p>
                <div class="mt-8">
                     <NuxtLink to="/" class="text-stone-400 hover:text-[#2C3E50] text-sm font-medium transition-colors">
                        ← Retour à l'accueil
                     </NuxtLink>
                </div>
            </header>

            <!-- Content card -->
            <section class="bg-white rounded-[2rem] shadow-xl border border-stone-100 p-8 md:p-12 space-y-12">
                
                <!-- Identité -->
                <section>
                    <h2 class="text-2xl font-serif font-bold text-[#2C3E50] mb-6 border-b border-stone-100 pb-2">Identification</h2>
                    <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div class="bg-stone-50 p-6 rounded-xl border border-stone-100">
                            <dt class="text-sm font-bold text-[#2C3E50] uppercase tracking-wider mb-2">Éditeur du site</dt>
                            <dd class="text-stone-700">Chloé Vincent</dd>
                        </div>
                        <div class="bg-stone-50 p-6 rounded-xl border border-stone-100">
                            <dt class="text-sm font-bold text-[#2C3E50] uppercase tracking-wider mb-2">Statut</dt>
                            <dd class="text-stone-700">Projet Étudiant (BUT MMI Montbéliard)</dd>
                        </div>
                        <div class="bg-stone-50 p-6 rounded-xl border border-stone-100">
                            <dt class="text-sm font-bold text-[#2C3E50] uppercase tracking-wider mb-2">Adresse</dt>
                            <dd class="text-stone-700">
                                4 Place Tharradin<br>
                                25200 Montbéliard, France
                            </dd>
                        </div>
                        <div class="bg-stone-50 p-6 rounded-xl border border-stone-100">
                            <dt class="text-sm font-bold text-[#2C3E50] uppercase tracking-wider mb-2">Contact</dt>
                            <dd class="text-stone-700">
                                <a class="underline decoration-stone-300 underline-offset-4 hover:decoration-[#2C3E50] transition-all"
                                    href="mailto:contact@lavillelente.fr">
                                    contact@lavillelente.fr
                                </a>
                            </dd>
                        </div>
                    </dl>
                </section>

                <!-- Hébergeur -->
                <section>
                    <h2 class="text-2xl font-serif font-bold text-[#2C3E50] mb-6 border-b border-stone-100 pb-2">Hébergement</h2>
                    <div class="bg-stone-50 p-6 rounded-xl border border-stone-100">
                        <p class="text-stone-700 leading-relaxed">
                            Ce site est hébergé par <span class="font-bold">Vercel Inc.</span><br>
                            <span class="text-sm text-stone-500">
                                340 S Lemon Ave #4133 Walnut, CA 91789, USA
                            </span>
                        </p>
                        <p class="mt-4 text-sm text-stone-500 italic">
                            (Ou mettre ici les coordonnées de votre hébergeur réel si différent, ex: Infomaniak, OVH...)
                        </p>
                    </div>
                </section>

                <!-- Objet du site -->
                <section>
                    <h2 class="text-2xl font-serif font-bold text-[#2C3E50] mb-6 border-b border-stone-100 pb-2">Objet du site</h2>
                    <p class="text-stone-700 leading-relaxed mb-4">
                        <span class="font-bold">La Ville Lente</span> est un projet interactif invitant à la redécouverte du patrimoine urbain à travers une expérience ludique mêlant exploration réelle, cartographie et résolution d'énigmes.
                    </p>
                    <p class="text-stone-700 leading-relaxed">
                        Le site permet aux utilisateurs de :
                    </p>
                    <ul class="mt-4 list-disc space-y-2 pl-5 text-stone-700">
                        <li>Suivre leur progression dans la ville.</li>
                        <li>Débloquer des fragments de "Totems" virtuels.</li>
                        <li>Consulter un "Grimoire" recensant les mystères résolus.</li>
                    </ul>
                </section>

                <!-- Propriété intellectuelle -->
                <section>
                    <h2 class="text-2xl font-serif font-bold text-[#2C3E50] mb-6 border-b border-stone-100 pb-2">Propriété Intellectuelle</h2>
                    <div class="space-y-4 text-stone-700 leading-relaxed">
                        <p>
                            L’ensemble des contenus (textes, illustrations, éléments graphiques, code) présents sur ce site est la propriété exclusive de l'éditeur ou fait l'objet d'une autorisation d'utilisation.
                        </p>
                        <p>
                            Les illustrations à l'aquarelle et les designs des totems sont des créations originales réalisées pour ce projet. Toute reproduction, modification ou diffusion sans accord préalable est interdite.
                        </p>
                    </div>
                </section>

                <!-- Données personnelles -->
                <section>
                    <h2 class="text-2xl font-serif font-bold text-[#2C3E50] mb-6 border-b border-stone-100 pb-2">Données Personnelles</h2>
                    <div class="space-y-4 text-stone-700 leading-relaxed">
                        <p>
                            Dans le cadre de son fonctionnement (sauvegarde de la progression), le site peut être amené à stocker certaines données :
                        </p>
                        <ul class="list-disc space-y-2 pl-5">
                            <li>Adresse email et pseudonyme pour l'authentification.</li>
                            <li>Données de progression (lieux visités, énigmes résolues).</li>
                        </ul>
                        <p class="mt-4 bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-900 text-sm">
                            <span class="font-bold">Note :</span> Ce projet est réalisé dans un cadre pédagogique. Les données ne sont ni vendues ni transmises à des tiers. Vous pouvez demander la suppression de votre compte et de vos données à tout moment via l'adresse de contact.
                        </p>
                    </div>
                </section>

            </section>
            
            <!-- Footer -->
            <footer class="mt-12 text-center text-stone-400 text-sm">
                <p>© 2026 La Ville Lente - Projet MMI</p>
            </footer>
        </div>
    </main>
</template>
