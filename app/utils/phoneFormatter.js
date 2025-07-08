/**
 * Formats a phone number to (xxx) xxx-xxxx format
 * @param {string} value - The raw phone number input
 * @returns {string} - Formatted phone number
 */
export function formatPhoneNumber(value) {
  // Remove all non-digits
  const phoneNumber = value.replace(/\D/g, '');
  
  // Limit to 10 digits
  const trimmed = phoneNumber.slice(0, 10);
  
  // Format based on length
  if (trimmed.length === 0) return '';
  if (trimmed.length <= 3) return `(${trimmed}`;
  if (trimmed.length <= 6) return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3)}`;
  
  return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3, 6)}-${trimmed.slice(6)}`;
}

/**
 * Removes formatting from a phone number to get just the digits
 * @param {string} formattedNumber - The formatted phone number
 * @returns {string} - Just the digits
 */
export function unformatPhoneNumber(formattedNumber) {
  return formattedNumber.replace(/\D/g, '');
}

/**
 * Validates if a phone number is complete (10 digits)
 * @param {string} formattedNumber - The formatted phone number
 * @returns {boolean} - True if complete
 */
export function isPhoneNumberComplete(formattedNumber) {
  const digits = unformatPhoneNumber(formattedNumber);
  return digits.length === 10;
} 