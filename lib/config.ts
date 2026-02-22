/**
 * DataVoice Agent - Business Configuration
 * 
 * This file contains customizable settings for your specific business needs.
 * Modify these values to tailor the AI assistant to your industry and use case.
 * 
 * For environment-based configuration, see .env.local
 */

export interface BusinessConfig {
  name: string;
  industry: IndustryType;
  keyMetrics: string[];
  customTables: string[];
  defaultCurrency: string;
  dateFormat: string;
  fiscalYearStart: string;
  customInstructions: string;
}

export type IndustryType = 
  | 'retail'
  | 'ecommerce'
  | 'saas'
  | 'healthcare'
  | 'finance'
  | 'manufacturing'
  | 'education'
  | 'hospitality'
  | 'real-estate'
  | 'other';

/**
 * Industry-specific configurations
 * Each industry has predefined key metrics and common table structures
 */
export const INDUSTRY_PRESETS: Record<IndustryType, { keyMetrics: string[]; customTables: string[] }> = {
  retail: {
    keyMetrics: ['revenue', 'orders', 'customers', 'average_order_value'],
    customTables: ['products', 'orders', 'customers', 'inventory', 'stores'],
  },
  ecommerce: {
    keyMetrics: ['revenue', 'orders', 'conversion_rate', 'cart_abandonment'],
    customTables: ['products', 'orders', 'customers', 'carts', 'reviews'],
  },
  saas: {
    keyMetrics: ['mrr', 'arr', 'churn_rate', 'active_users'],
    customTables: ['subscriptions', 'users', 'plans', 'usage_metrics'],
  },
  healthcare: {
    keyMetrics: ['patients', 'appointments', 'revenue', 'readmission_rate'],
    customTables: ['patients', 'appointments', 'providers', 'insurance'],
  },
  finance: {
    keyMetrics: ['assets', 'liabilities', 'transactions', 'roi'],
    customTables: ['accounts', 'transactions', 'portfolios', 'clients'],
  },
  manufacturing: {
    keyMetrics: ['production_volume', 'defect_rate', 'inventory_turnover'],
    customTables: ['products', 'production_runs', 'inventory', 'suppliers'],
  },
  education: {
    keyMetrics: ['students', 'enrollment', 'graduation_rate', 'revenue'],
    customTables: ['students', 'courses', 'enrollments', 'faculty'],
  },
  hospitality: {
    keyMetrics: ['occupancy_rate', 'revpar', 'bookings', 'guest_satisfaction'],
    customTables: ['reservations', 'rooms', 'guests', 'bookings'],
  },
  'real-estate': {
    keyMetrics: ['properties', 'occupancy_rate', 'rental_income', 'cap_rate'],
    customTables: ['properties', 'tenants', 'leases', 'maintenance'],
  },
  other: {
    keyMetrics: ['revenue', 'customers', 'orders'],
    customTables: [],
  },
};

/**
 * Default configuration
 * This will be overridden by environment variables if set
 */
export const DEFAULT_CONFIG: BusinessConfig = {
  name: 'Your Business',
  industry: 'retail',
  keyMetrics: INDUSTRY_PRESETS.retail.keyMetrics,
  customTables: INDUSTRY_PRESETS.retail.customTables,
  defaultCurrency: 'USD',
  dateFormat: 'YYYY-MM-DD',
  fiscalYearStart: 'January',
  customInstructions: '',
};

/**
 * Get business configuration from environment variables or use defaults
 */
export function getBusinessConfig(): BusinessConfig {
  // Only runs on server-side in Next.js
  if (typeof window === 'undefined') {
    const businessName = process.env.BUSINESS_NAME;
    const industryType = process.env.INDUSTRY_TYPE as IndustryType | undefined;
    const customInstructions = process.env.CUSTOM_INSTRUCTIONS;
    const defaultCurrency = process.env.DEFAULT_CURRENCY;

    const industry = industryType && INDUSTRY_PRESETS[industryType] 
      ? industryType 
      : 'retail';

    return {
      name: businessName || DEFAULT_CONFIG.name,
      industry,
      keyMetrics: DEFAULT_CONFIG.keyMetrics,
      customTables: DEFAULT_CONFIG.customTables,
      defaultCurrency: defaultCurrency || DEFAULT_CONFIG.defaultCurrency,
      dateFormat: DEFAULT_CONFIG.dateFormat,
      fiscalYearStart: DEFAULT_CONFIG.fiscalYearStart,
      customInstructions: customInstructions || DEFAULT_CONFIG.customInstructions,
    };
  }

  return DEFAULT_CONFIG;
}

/**
 * Application settings
 */
export const APP_SETTINGS = {
  // Query limits
  MAX_QUERY_RESULTS: 1000,
  QUERY_TIMEOUT_MS: 30000,
  
  // Voice settings
  AUDIO_SAMPLE_RATE: 16000,
  AUDIO_BUFFER_SIZE: 4096,
  
  // UI settings
  DEFAULT_CHART_TYPE: 'bar' as 'bar' | 'line' | 'pie' | 'table' | 'number',
  ENABLE_DESTRUCTIVE_QUERIES: false,
  
  // Conversation
  MAX_CONVERSATION_HISTORY: 10,
  
  // Demo mode
  ENABLE_DEMO_MODE: true,
};

/**
 * Get app settings from environment variables
 */
export function getAppSettings() {
  if (typeof window === 'undefined') {
    return {
      ...APP_SETTINGS,
      DEFAULT_CHART_TYPE: (process.env.DEFAULT_CHART_TYPE as any) || APP_SETTINGS.DEFAULT_CHART_TYPE,
      ENABLE_DESTRUCTIVE_QUERIES: process.env.ENABLE_DESTRUCTIVE_QUERIES === 'true',
    };
  }
  return APP_SETTINGS;
}

/**
 * Generate system prompt for Gemini AI
 * This creates a customized prompt based on business configuration
 */
export function generateSystemPrompt(
  schema: string,
  config: BusinessConfig = DEFAULT_CONFIG
): string {
  const today = new Date().toISOString().split('T')[0];
  
  return `You are DataVoice, a friendly and helpful database assistant for ${config.name}.

DATABASE SCHEMA:
${schema}

BUSINESS CONTEXT:
- Industry: ${config.industry}
- Key Metrics: ${config.keyMetrics.join(', ')}
- Currency: ${config.defaultCurrency}
- Date Format: ${config.dateFormat}
- Fiscal Year Start: ${config.fiscalYearStart}

GUIDELINES:
1. Speak naturally and concisely, like explaining to a colleague
2. Always explain what the data means, not just the numbers
3. Suggest relevant visualizations automatically based on the data
4. For time-based data, default to line charts
5. For comparisons across categories, use bar charts
6. For proportions and distributions, use pie charts
7. For single values, use number display
8. For detailed data, use table view
9. NEVER execute destructive queries (DELETE, DROP, TRUNCATE, UPDATE) without explicit confirmation
10. If a query might be slow or return many rows, warn the user and suggest adding LIMIT
11. Format currency values as ${config.defaultCurrency}
12. Use the date format ${config.dateFormat} when referencing dates
13. Today's date is ${today}

${config.customInstructions ? `ADDITIONAL INSTRUCTIONS:\n${config.customInstructions}` : ''}

RESPONSE FORMAT:
When you need to query data, use the run_sql_query tool with this structure:
{
  "query": "SELECT ...",
  "chartType": "bar|line|pie|table|number",
  "explanation": "Brief explanation of what this query shows"
}

After receiving query results, summarize the key findings in natural language.`;
}
