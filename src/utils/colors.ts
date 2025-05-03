// Generate a random color for designers
export const generateRandomColor = (): string => {
  const colors = [
    '#4f46e5', // Indigo
    '#0ea5e9', // Sky
    '#14b8a6', // Teal
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#f97316', // Orange
    '#10b981', // Emerald
    '#6366f1', // Indigo
  ];
  
  // Pick a random color from the array
  return colors[Math.floor(Math.random() * colors.length)];
};

// Get a contrasting text color (black or white) based on background color
export const getContrastTextColor = (hexColor: string): string => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Get a lighter version of the color for hover states
export const getLighterColor = (hexColor: string, factor = 0.2): string => {
  // Convert hex to RGB
  let r = parseInt(hexColor.slice(1, 3), 16);
  let g = parseInt(hexColor.slice(3, 5), 16);
  let b = parseInt(hexColor.slice(5, 7), 16);
  
  // Make lighter
  r = Math.min(255, r + Math.round((255 - r) * factor));
  g = Math.min(255, g + Math.round((255 - g) * factor));
  b = Math.min(255, b + Math.round((255 - b) * factor));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};