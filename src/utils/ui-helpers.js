/**
 * Generates a consistent gradient style based on a name string.
 * @param {string} name - The name to generate the style from.
 * @returns {object} - The style object containing background, border, and box-shadow.
 */
export const getCardStyle = (name) => {
    if (!name) return {};

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Use hash to pick a hue (0-360)
    const hue = Math.abs(hash % 360);

    // Gradient fades from left-to-right (strong left, transparent right)
    // using var(--bg-card) to blend seamlessly with the theme
    const colorMain = `hsla(${hue}, 85%, 25%, 0.25)`; // Reduced intensity (0.5 -> 0.25)

    return {
        '--card-gradient-color': colorMain,
    };
};
