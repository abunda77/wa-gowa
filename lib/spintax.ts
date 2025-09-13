/**
 * Spintax Engine for WhatsApp Bulk Messenger
 * Processes spintax syntax: {option1|option2|option3} and variables [[nama]]
 */

export interface SpintaxResult {
  processedMessage: string
  variablesUsed: string[]
}

/**
 * Process spintax syntax and variables in a message
 * @param template - Message template with spintax and variables
 * @param variables - Object containing variable values (e.g., {nama: "John"})
 * @returns Processed message with random selections and variable substitutions
 */
export function processSpintax(template: string, variables: Record<string, string> = {}): SpintaxResult {
  let processedMessage = template
  const variablesUsed: string[] = []

  // First, process spintax groups {option1|option2|option3}
  processedMessage = processedMessage.replace(/\{([^}]+)\}/g, (match, content) => {
    const options = content.split("|").map((option: string) => option.trim())
    if (options.length === 0) return match

    // Select random option
    const randomIndex = Math.floor(Math.random() * options.length)
    return options[randomIndex]
  })

  // Then, process variables [[variableName]]
  processedMessage = processedMessage.replace(/\[\[([^\]]+)\]\]/g, (match, variableName) => {
    const trimmedName = variableName.trim()
    variablesUsed.push(trimmedName)

    if (variables[trimmedName] !== undefined) {
      return variables[trimmedName]
    }

    // If variable not found, return empty string (for manual input mode)
    return ""
  })

  return {
    processedMessage: processedMessage.trim(),
    variablesUsed,
  }
}

/**
 * Validate spintax syntax in a template
 * @param template - Message template to validate
 * @returns Array of validation errors, empty if valid
 */
export function validateSpintax(template: string): string[] {
  const errors: string[] = []

  // Check for unmatched braces
  const openBraces = (template.match(/\{/g) || []).length
  const closeBraces = (template.match(/\}/g) || []).length
  if (openBraces !== closeBraces) {
    errors.push("Jumlah kurung kurawal buka dan tutup tidak seimbang")
  }

  // Check for unmatched square brackets
  const openSquareBrackets = (template.match(/\[\[/g) || []).length
  const closeSquareBrackets = (template.match(/\]\]/g) || []).length
  if (openSquareBrackets !== closeSquareBrackets) {
    errors.push("Jumlah kurung siku ganda buka dan tutup tidak seimbang")
  }

  // Check for empty spintax groups
  const emptySpintaxGroups = template.match(/\{\s*\}/g)
  if (emptySpintaxGroups) {
    errors.push("Ditemukan grup spintax kosong: {}")
  }

  // Check for empty variable names
  const emptyVariables = template.match(/\[\[\s*\]\]/g)
  if (emptyVariables) {
    errors.push("Ditemukan nama variabel kosong: [[]]")
  }

  // Check for spintax groups with only separators
  const invalidSpintaxGroups = template.match(/\{[|]+\}/g)
  if (invalidSpintaxGroups) {
    errors.push("Ditemukan grup spintax dengan hanya separator: {|||}")
  }

  return errors
}

/**
 * Extract all variable names from a template
 * @param template - Message template
 * @returns Array of unique variable names found
 */
export function extractVariables(template: string): string[] {
  const variables: string[] = []
  const matches = template.matchAll(/\[\[([^\]]+)\]\]/g)

  for (const match of matches) {
    const variableName = match[1].trim()
    if (variableName && !variables.includes(variableName)) {
      variables.push(variableName)
    }
  }

  return variables
}

/**
 * Generate preview of how spintax will be processed
 * @param template - Message template
 * @param sampleCount - Number of sample variations to generate
 * @returns Array of sample processed messages
 */
export function generateSpintaxPreview(template: string, sampleCount = 3): string[] {
  const previews: string[] = []
  const sampleVariables = { nama: "Contoh Nama" }

  for (let i = 0; i < sampleCount; i++) {
    const result = processSpintax(template, sampleVariables)
    if (!previews.includes(result.processedMessage)) {
      previews.push(result.processedMessage)
    }
  }

  return previews
}

/**
 * Count possible variations in a spintax template
 * @param template - Message template
 * @returns Number of possible unique variations
 */
export function countSpintaxVariations(template: string): number {
  let variations = 1
  const spintaxGroups = template.matchAll(/\{([^}]+)\}/g)

  for (const match of spintaxGroups) {
    const options = match[1].split("|").filter((option) => option.trim())
    variations *= options.length
  }

  return variations
}
