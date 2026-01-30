/**
 * Convierte un tiempo en formato 24 horas (HH:MM) a formato 12 horas con AM/PM
 * @param {string} time24 - Tiempo en formato 24 horas (ej: "14:30", "09:15")
 * @returns {string} Tiempo en formato 12 horas con AM/PM (ej: "2:30 PM", "9:15 AM")
 */
export function formatTimeTo12Hour(time24) {
  if (!time24) return '';
  
  // Verificar formato válido HH:MM
  const timeRegex = /^(\d{1,2}):(\d{2})$/;
  const match = time24.match(timeRegex);
  
  if (!match) return time24; // Si el formato no es válido, retornar tal cual
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  
  // Determinar AM o PM
  const period = hours >= 12 ? 'PM' : 'AM';
  
  // Convertir a formato 12 horas
  if (hours === 0) {
    hours = 12; // Medianoche es 12 AM
  } else if (hours > 12) {
    hours = hours - 12; // Convertir PM
  }
  
  return `${hours}:${minutes} ${period}`;
}

/**
 * Convierte un tiempo en formato 12 horas con AM/PM a formato 24 horas (HH:MM)
 * @param {string} time12 - Tiempo en formato 12 horas (ej: "2:30 PM", "9:15 AM")
 * @returns {string} Tiempo en formato 24 horas (ej: "14:30", "09:15")
 */
export function formatTimeTo24Hour(time12) {
  if (!time12) return '';
  
  // Extraer horas, minutos y periodo (AM/PM)
  const timeRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
  const match = time12.match(timeRegex);
  
  if (!match) return time12; // Si el formato no es válido, retornar tal cual
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  
  // Convertir a formato 24 horas
  if (period === 'AM') {
    if (hours === 12) {
      hours = 0; // 12 AM es 00
    }
  } else { // PM
    if (hours !== 12) {
      hours = hours + 12; // Convertir PM (excepto 12 PM)
    }
  }
  
  // Asegurar formato de dos dígitos para las horas
  const hoursFormatted = hours.toString().padStart(2, '0');
  
  return `${hoursFormatted}:${minutes}`;
}
