export const useAtmosphere = () => {
    // Shared state across components
    // 1 = Nature (Pollen)
    // 2 = Fire/Light (Embers/Bokeh)
    // 3 = Water (Rain/Bubbles)
    // 4 = Mystery (Fog)
    // ...
    const activeAtmosphereId = useState('activeAtmosphereId', () => 1)

    const setAtmosphere = (id: number) => {
        activeAtmosphereId.value = id
    }

    return {
        activeAtmosphereId,
        setAtmosphere
    }
}
