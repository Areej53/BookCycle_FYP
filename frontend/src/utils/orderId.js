/**
 * Utility to format Order IDs into real-world e-commerce reference numbers
 * e.g., '7f4741d99095b8551c851d81' -> '#BC-851D81'
 * e.g., 'BC-104928' -> '#BC-104928'
 */
export const formatOrderId = (id) => {
  if (!id) return '';
  const s = String(id).trim();

  // If already prefixed with #BC-
  if (s.startsWith('#BC-') || s.startsWith('#bc-')) {
    return s.toUpperCase();
  }

  // If starts with BC-
  if (s.startsWith('BC-') || s.startsWith('bc-')) {
    return `#${s.toUpperCase()}`;
  }

  // If already starts with #
  if (s.startsWith('#')) {
    const raw = s.slice(1);
    if (raw.length >= 10) {
      return `#BC-${raw.slice(-6).toUpperCase()}`;
    }
    return `#BC-${raw.toUpperCase()}`;
  }

  // If it's a long 24-character hexadecimal/MongoDB style ID
  if (s.length >= 10) {
    return `#BC-${s.slice(-6).toUpperCase()}`;
  }

  return `#BC-${s.toUpperCase()}`;
};

export default formatOrderId;
