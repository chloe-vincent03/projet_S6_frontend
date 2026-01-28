<script setup>
useHead({
  title: "CGU - La Ville Lente",
});
</script>

<template>
    <main class="min-h-screen bg-[#e9ecf5] py-12">
        <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <header class="mb-12 text-center">
                <h1 class="text-4xl md:text-5xl text-[#2C3E50] font-serif font-bold mb-4">
                    Conditions Générales d’Utilisation
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
                
                <!-- 1. Informations légales -->
                <section>
                    <h2 class="text-2xl font-serif font-bold text-[#2C3E50] mb-6 border-b border-stone-100 pb-2">
                        1. Informations légales et champ d’application
                    </h2>
                    <div class="space-y-4 text-stone-700 leading-relaxed">
                        <div>
                            <h3 class="font-bold text-[#2C3E50] mb-2">1.1 Informations légales</h3>
                            <p>
                                Le site <span class="font-bold">La Ville Lente</span> est un projet étudiant développé par <span class="font-bold">Chloé Vincent</span> dans le cadre du BUT MMI de Montbéliard.
                            </p>
                            <p class="mt-2">
                                Contact : 
                                <a href="mailto:contact@lavillelente.fr" class="underline decoration-stone-300 hover:decoration-[#2C3E50] transition-colors">
                                    contact@lavillelente.fr
                                </a>
                            </p>
                        </div>

                        <div>
                            <h3 class="font-bold text-[#2C3E50] mb-2">1.2 Champ d’application</h3>
                            <p>
                                Les présentes Conditions Générales d’Utilisation (CGU) définissent les règles d’accès et d’utilisation du site. En naviguant sur ce site ou en créant un compte, vous acceptez ces conditions sans réserve.
                            </p>
                        </div>
                    </div>
                </section>

                <!-- 2. Objet du site -->
                <section>
                    <h2 class="text-2xl font-serif font-bold text-[#2C3E50] mb-6 border-b border-stone-100 pb-2">
                        2. Objet du site
                    </h2>
                    <p class="text-stone-700 leading-relaxed mb-4">
                        <span class="font-bold">La Ville Lente</span> est une plateforme ludique et culturelle dédiée à la redécouverte du patrimoine urbain.
                    </p>
                    <p class="text-stone-700 mb-2">Elle permet aux utilisateurs de :</p>
                    <ul class="list-disc pl-5 space-y-2 text-stone-700">
                        <li>Explorer virtuellement et physiquement des lieux notables de la ville.</li>
                        <li>Résoudre des énigmes pour débloquer des contenus narratifs (le "Grimoire").</li>
                        <li>Suivre leur progression à travers la collection de "Totems".</li>
                    </ul>
                </section>

                <!-- 3. Accès et Compte -->
                <section>
                    <h2 class="text-2xl font-serif font-bold text-[#2C3E50] mb-6 border-b border-stone-100 pb-2">
                        3. Accès et Utilisation
                    </h2>
                    <div class="space-y-6 text-stone-700 leading-relaxed">
                        <div>
                            <h3 class="font-bold text-[#2C3E50] mb-2">3.1 Création de compte</h3>
                            <p>
                                L'accès à certaines fonctionnalités (sauvegarde de la progression, déblocage des totems) nécessite la création d'un compte utilisateur via une adresse email valide et un mot de passe.
                            </p>
                        </div>
                        <div>
                            <h3 class="font-bold text-[#2C3E50] mb-2">3.2 Responsabilité des identifiants</h3>
                            <p>
                                L'utilisateur est responsable de la confidentialité de ses identifiants. Toute action réalisée depuis son compte est réputée avoir été effectuée par lui-même.
                            </p>
                        </div>
                        <div>
                            <h3 class="font-bold text-[#2C3E50] mb-2">3.3 Gratuité</h3>
                            <p>
                                L'accès au site et à ses fonctionnalités est entièrement gratuit et à but non lucratif.
                            </p>
                        </div>
                    </div>
                </section>

                <!-- 4. Propriété intellectuelle -->
                <section>
                    <h2 class="text-2xl font-serif font-bold text-[#2C3E50] mb-6 border-b border-stone-100 pb-2">
                        4. Propriété Intellectuelle
                    </h2>
                    <div class="space-y-4 text-stone-700 leading-relaxed">
                        <p>
                            La structure générale du site, ainsi que les textes, graphiques, images (notamment les aquarelles et illustrations des totems), et tout autre élément composant le site sont la propriété exclusive de l'éditeur du site ou de ses partenaires.
                        </p>
                        <p>
                            Toute représentation et/ou reproduction et/ou exploitation partielle ou totale de ce site, par quelque procédé que ce soit, sans l'autorisation préalable et par écrit de l'éditeur est strictement interdite et constituerait une contrefaçon sanctionnée par le Code de la propriété intellectuelle.
                        </p>
                    </div>
                </section>

                <!-- 5. Comportement -->
                <section>
                    <h2 class="text-2xl font-serif font-bold text-[#2C3E50] mb-6 border-b border-stone-100 pb-2">
                        5. Règles de bonne conduite
                    </h2>
                    <p class="text-stone-700 leading-relaxed mb-4">
                        L'utilisateur s'engage à ne pas utiliser le site pour :
                    </p>
                    <ul class="list-disc pl-5 space-y-2 text-stone-700">
                        <li>Tenter de pirater ou de contourner les mécanismes de sécurité du site.</li>
                        <li>Utiliser des failles pour valider des étapes sans les accomplir réellement (bien que cela gâche surtout votre propre plaisir !).</li>
                        <li>Collecter des données sur les autres utilisateurs.</li>
                    </ul>
                </section>

                <!-- 6. Données Personnelles -->
                <section>
                    <h2 class="text-2xl font-serif font-bold text-[#2C3E50] mb-6 border-b border-stone-100 pb-2">
                        6. Protection des Données
                    </h2>
                    <p class="text-stone-700 leading-relaxed">
                        Les données collectées (email, progression) sont uniquement utilisées pour le bon fonctionnement du jeu. Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour l'exercer, contactez-nous à <a href="mailto:contact@lavillelente.fr" class="font-bold hover:underline">contact@lavillelente.fr</a>.
                        Pour plus de détails, consultez notre <RouterLink to="/politique-confidentialite" class="underline decoration-stone-300 hover:decoration-[#2C3E50]">Politique de Confidentialité</RouterLink>.
                    </p>
                </section>

                <!-- 7. Responsabilité -->
                <section>
                    <h2 class="text-2xl font-serif font-bold text-[#2C3E50] mb-6 border-b border-stone-100 pb-2">
                        7. Responsabilité
                    </h2>
                    <p class="text-stone-700 leading-relaxed">
                        Bien que nous nous efforcions d'assurer la fiabilité des informations, l'éditeur ne saurait être tenu responsable des erreurs ou omissions, ni d'une indisponibilité du service. L'exploration physique des lieux de la ville se fait sous la seule responsabilité de l'utilisateur.
                    </p>
                </section>

                <!-- Footer -->
                <footer class="mt-12 text-center text-stone-400 text-sm">
                    <p>© {{ new Date().getFullYear() }} La Ville Lente — Tous droits réservés.</p>
                </footer>

            </section>
        </div>
    </main>
</template>
