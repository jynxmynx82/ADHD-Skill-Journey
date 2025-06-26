declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_API_URL: string;
      EXPO_PUBLIC_OPENFOODFACTS_API_URL: string;
      EXPO_PUBLIC_AMAZON_AFFILIATE_ID: string;
      EXPO_PUBLIC_WALMART_AFFILIATE_ID: string;
    }
  }
}

// Ensure this file is treated as a module
export {};