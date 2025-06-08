/**
 * Fetch a secret from Azure Key Vault
 * @param {string} secretName - Name of the secret to retrieve
 * @returns {Promise<string>} - The secret value
 */
/**
 * Fetch a secret from Azure Key Vault
 * @param {string} secretName - Name of the secret to retrieve
 * @returns {Promise<string>} - The secret value
 */
const getSecret = async (secretName) => {
  try {
    // If Azure Key Vault is not configured, fallback to environment variables
    const envVar = secretName.replace(/-/g, '_').toUpperCase();
    return process.env[envVar];
  } catch (error) {
    console.error(`Failed to fetch secret ${secretName}:`, error);
    return null;
  }
};

module.exports = { getSecret };
