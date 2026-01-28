<script setup>
useHead({
  title: "Politique de Confidentialité - La Ville Lente",
});
</script>

<template>
    <main class="min-h-screen bg-[#e9ecf5] py-12">
        <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <header class="mb-12 text-center">
                <h1 class="text-4xl md:text-5xl text-[#2C3E50] font-serif font-bold mb-4">
                    Politique de Confidentialité
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
                
                <!-- Intro -->
                <section class="space-y-4 text-stone-700 leading-relaxed">
                    <p>
                        Bienvenue sur <span class="font-bold text-[#2C3E50]">La Ville Lente</span>. La protection de vos données personnelles est une priorité, même pour un projet étudiant !
                    </p>
                    <p>
                        Cette politique vise à vous informer en toute transparence sur les données que nous collectons (et surtout celles que nous ne collectons pas).
                    </p>
                </section>

                <!-- 1. Données collectées -->
                <section>
                    <h2 class="text-2xl font-serif font-bold text-[#2C3E50] mb-6 border-b border-stone-100 pb-2">
                        1. Les données que nous collectons
                    </h2>
                    <div class="space-y-6 text-stone-700 leading-relaxed">
                        <div>
                            <h3 class="font-bold text-[#2C3E50] mb-2">1.1 Données fournies par vous</h3>
                            <ul class="list-disc pl-5 space-y-2">
                                <li><span class="font-bold">Compte Utilisateur :</span> Adresse e-mail, pseudonyme et mot de passe (crypté).</li>
                                <li><span class="font-bold">Contact :</span> Contenu des e-mails si vous nous écrivez.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 class="font-bold text-[#2C3E50] mb-2">1.2 Données liées à l'utilisation (Jeu)</h3>
                            <ul class="list-disc pl-5 space-y-2">
                                <li><span class="font-bold">Progression :</span> Lieux découverts, fragments de totems débloqués, énigmes résolues.</li>
                                <li><span class="font-bold">Géolocalisation :</span> Votre position est utilisée <span class="italic">uniquement en local</span> sur votre appareil pour valider la découverte des lieux. Elle n'est PAS stockée sur nos serveurs.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <!-- 2. Finalités -->
                <section>
                    <h2 class="text-2xl font-serif font-bold text-[#2C3E50] mb-6 border-b border-stone-100 pb-2">
                        2. Pourquoi collectons-nous ces données ?
                    </h2>
                    <ul class="list-disc pl-5 space-y-2 text-stone-700 leading-relaxed">
                        <li>Pour vous permettre de créer un compte et de sauvegarder votre progression (ne pas perdre vos totems !).</li>
                        <li>Pour assurer le bon fonctionnement technique du site.</li>
                        <li>Pour répondre à vos demandes de contact.</li>
                    </ul>
                    <p class="mt-4 bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-900 text-sm">
                        <span class="font-bold">Important :</span> Aucune donnée n'est utilisée à des fins commerciales, publicitaires ou revendue à des tiers.
                    </p>
                </section>

                <!-- 3. Partage -->
                <section>
                    <h2 class="text-2xl font-serif font-bold text-[#2C3E50] mb-6 border-b border-stone-100 pb-2">
                        3. Partage des données
                    </h2>
                    <p class="text-stone-700 leading-relaxed">
                        Vos données sont accessibles uniquement par l'équipe projet (étudiants et tuteurs pédagogiques) et notre hébergeur technique (pour des raisons de maintenance uniquement).
                    </p>
                </section>

                <!-- 4. Sécurité -->
                <section>
                    <h2 class="text-2xl font-serif font-bold text-[#2C3E50] mb-6 border-b border-stone-100 pb-2">
                        4. Sécurité
                    </h2>
                    <p class="text-stone-700 leading-relaxed">
                        Les mots de passe sont hachés (cryptés) avant d'être stockés en base de données. Nous utilisons des protocoles sécurisés (HTTPS) pour tous les échanges de données.
                    </p>
                </section>

                <!-- 5. Vos Droits -->
                <section>
                    <h2 class="text-2xl font-serif font-bold text-[#2C3E50] mb-6 border-b border-stone-100 pb-2">
                        5. Vos Droits (RGPD)
                    </h2>
                    <p class="text-stone-700 leading-relaxed mb-4">
                        Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez demander la suppression complète de votre compte et de votre progression à tout moment.
                    </p>
                    <p class="text-stone-700">
                        Pour exercer ces droits, envoyez un simple e-mail à : 
                        <a href="mailto:contact@lavillelente.fr" class="font-bold hover:underline text-[#2C3E50]">contact@lavillelente.fr</a>
                    </p>
                </section>

                <!-- Footer -->
                <footer class="mt-12 text-center text-stone-400 text-sm">
                    <p>© {{ new Date().getFullYear() }} La Ville Lente — Politique de Confidentialité.</p>
                </footer>

            </section>
        </div>
    </main>
</template>
