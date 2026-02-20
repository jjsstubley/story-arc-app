/**
 * Generates a stable random gradient color based on an ID
 * This ensures the same ID always gets the same color
 */
export function getGradientColor(id: string): string {
  // Color palette with Chakra UI color schemes and shades
  const colors = [
    "orange.900",
    "blue.900",
    "purple.900",
    "pink.900",
    "teal.900",
    "cyan.900",
    "red.900",
    "green.900",
    "yellow.900",
    "indigo.900",
  ];

  // Create a simple hash from the ID to get a consistent index
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Use absolute value and modulo to get a valid index
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

