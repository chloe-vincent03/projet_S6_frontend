export const useImageOptimization = () => {
    /**
     * Optimizes a Cloudinary URL by injecting transformation parameters.
     * @param url The original image URL
     * @param width Target width (default 1080)
     * @returns Optimized URL
     */
    const optimizeImage = (url: string, width: number = 1080) => {
        if (!url) return ''
        if (!url.includes('cloudinary.com')) return url // Skip non-cloudinary images

        // Insert transformations after /upload/
        // f_auto: Auto format (webp/avif)
        // q_auto: Auto quality
        // w_...: Resize
        const transformation = `f_auto,q_auto,w_${width}`

        return url.replace('/upload/', `/upload/${transformation}/`)
    }

    return {
        optimizeImage
    }
}
