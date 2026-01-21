export const useTotems = () => {
    // Totem Metadata (Known info for specific IDs)
    const totemMetadata = {
        1: {
            name: "Le Veilleur",
            image: "https://res.cloudinary.com/dveki8qer/image/upload/v1768909823/totem_ezvedw.svg",
            description: "Assemblez les fragments pour réveiller l'esprit de la ville."
        },
        2: {
            name: "L'Éveilleur",
            image: "https://res.cloudinary.com/dveki8qer/image/upload/v1768987067/totem_02_ctfw6u.svg",
            description: "Un nouveau gardien se révèle à ceux qui poursuivent la quête."
        },
        3: {
            name: "Le Voyageur",
            image: "https://res.cloudinary.com/dveki8qer/image/upload/v1768987064/totem_03_rocezc.svg",
            description: "Une silhouette mystérieuse se dessine à l'horizon."
        }
    }

    // Helper to get metadata with fallback
    const getTotemMetadata = (id: number) => {
        const meta = (totemMetadata as any)[id]
        return {
            id: id,
            name: meta?.name || `Totem #${id}`,
            image: meta?.image || "",
            description: meta?.description || "Un nouveau mystère à résoudre."
        }
    }

    return {
        totemMetadata,
        getTotemMetadata
    }
}
