# ⚙️ VoxQuery Configuration Guide

> Complete guide to configuring and customizing VoxQuery for your business needs.

## 📋 Table of Contents

- [Overview](#overview)
- [Environment Variables](#environment-variables)
- [Business Configuration](#business-configuration)
- [Industry Presets](#industry-presets)
- [Application Settings](#application-settings)
- [Database Configuration](#database-configuration)
- [AI Customization](#ai-customization)
- [Security Configuration](#security-configuration)
- [UI Customization](#ui-customization)

---

## Overview

VoxQuery can be configured at multiple levels to match your business requirements, industry standards, and security policies. Configuration options range from simple environment variables to deep code-level customization.

### Configuration Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Environment Variables (.env.local)                │
│  • API Keys                                                 │
│  • Business Name                                            │
│  • Industry Type                                            │
│  • Feature Flags                                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: Business Configuration (lib/config.ts)            │
│  • Industry Presets                                         │
│  • Key Metrics                                              │
│  • Custom Instructions                                      │
│  • Date/Currency Formats                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Application Settings (lib/config.ts)              │
│  • Query Limits                                             │
│  • Voice Settings                                           │
│  • UI Defaults                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: Code Customization                                │
│  • System Prompts                                           │
│  • Component Styling                                        │
│  • Custom Features                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Environment Variables

### Quick Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your values
nano .env.local
```

### Required Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` | ✅ Yes |

### Optional Variables

#### Business Settings

| Variable | Description | Default | Options |
|----------|-------------|---------|---------|
| `BUSINESS_NAME` | Your company name | `Your Business` | Any string |
| `INDUSTRY_TYPE` | Industry for AI context | `retail` | See [Industry Presets](#industry-presets) |
| `DATABASE_TYPE` | Primary database type | `mysql` | `mysql`, `postgres` |
| `DEFAULT_CURRENCY` | Default currency code | `USD` | `USD`, `EUR`, `GBP`, etc. |

#### Feature Flags

| Variable | Description | Default | Options |
|----------|-------------|---------|---------|
| `DEFAULT_CHART_TYPE` | Default visualization | `bar` | `bar`, `line`, `pie`, `table`, `number` |
| `ENABLE_DESTRUCTIVE_QUERIES` | Allow destructive queries | `false` | `true`, `false` |
| `DEBUG_MODE` | Enable debug logging | `false` | `true`, `false` |

#### Custom Instructions

| Variable | Description | Default |
|----------|-------------|---------|
| `CUSTOM_INSTRUCTIONS` | Custom AI behavior instructions | `""` |

### Complete Example

```env
# ════════════════════════════════════════════════════════
# Required: API Keys
# ════════════════════════════════════════════════════════
NEXT_PUBLIC_GEMINI_API_KEY="AIzaSyD...your_actual_key"

# ════════════════════════════════════════════════════════
# Business Configuration
# ════════════════════════════════════════════════════════
BUSINESS_NAME="Acme Corporation"
INDUSTRY_TYPE="ecommerce"
DATABASE_TYPE="mysql"
DEFAULT_CURRENCY="USD"

# ════════════════════════════════════════════════════════
# Feature Configuration
# ════════════════════════════════════════════════════════
DEFAULT_CHART_TYPE="bar"
ENABLE_DESTRUCTIVE_QUERIES="false"
DEBUG_MODE="false"

# ════════════════════════════════════════════════════════
# Custom Instructions
# ════════════════════════════════════════════════════════
CUSTOM_INSTRUCTIONS="Focus on ecommerce metrics like conversion rates, average order value, and customer lifetime value. Always show currency in USD with thousand separators."
```

---

## Business Configuration

### Configuring lib/config.ts

For deeper customization, edit the business configuration file:

```typescript
export const DEFAULT_CONFIG: BusinessConfig = {
  name: 'Acme Corporation',
  industry: 'ecommerce',
  keyMetrics: ['revenue', 'orders', 'conversion_rate', 'cart_abandonment'],
  customTables: ['products', 'orders', 'customers', 'carts', 'reviews'],
  defaultCurrency: 'USD',
  dateFormat: 'YYYY-MM-DD',
  fiscalYearStart: 'January',
  customInstructions: `
    Focus on ecommerce metrics and customer analytics.
    Always mention growth percentages and compare to previous periods.
    Use friendly, conversational tone.
  `,
};
```

### Configuration Options

#### name

Your business or organization name.

```typescript
name: 'Acme Corporation'
```

**Used in:**
- AI system prompt
- UI branding (optional)
- Email templates (future)

#### industry

Industry type for AI context.

```typescript
industry: 'ecommerce'
```

**Available options:**
- `retail`
- `ecommerce`
- `saas`
- `healthcare`
- `finance`
- `manufacturing`
- `education`
- `hospitality`
- `real-estate`
- `other`

#### keyMetrics

Key business metrics for AI prioritization.

```typescript
keyMetrics: ['revenue', 'orders', 'conversion_rate', 'cart_abandonment']
```

**Common metrics by industry:**

| Industry | Key Metrics |
|----------|-------------|
| **Retail** | `revenue`, `orders`, `customers`, `average_order_value` |
| **E-commerce** | `revenue`, `orders`, `conversion_rate`, `cart_abandonment` |
| **SaaS** | `mrr`, `arr`, `churn_rate`, `active_users` |
| **Healthcare** | `patients`, `appointments`, `revenue`, `readmission_rate` |
| **Finance** | `assets`, `liabilities`, `transactions`, `roi` |

#### customTables

Tables specific to your business.

```typescript
customTables: ['products', 'orders', 'customers', 'carts', 'reviews']
```

#### defaultCurrency

Default currency code for financial data.

```typescript
defaultCurrency: 'USD'
```

**Common currency codes:**
- `USD` - US Dollar
- `EUR` - Euro
- `GBP` - British Pound
- `JPY` - Japanese Yen
- `CAD` - Canadian Dollar
- `AUD` - Australian Dollar

#### dateFormat

Date format for display.

```typescript
dateFormat: 'YYYY-MM-DD'
```

**Common formats:**
- `YYYY-MM-DD` - ISO format (2024-01-15)
- `MM/DD/YYYY` - US format (01/15/2024)
- `DD/MM/YYYY` - EU format (15/01/2024)
- `MMMM D, YYYY` - Long format (January 15, 2024)

#### fiscalYearStart

Start of fiscal year.

```typescript
fiscalYearStart: 'January'
```

**Options:**
- Month names: `January`, `February`, etc.

#### customInstructions

Custom instructions for AI behavior.

```typescript
customInstructions: `
  Focus on sales metrics and customer analytics.
  Always show currency in USD and mention growth percentages.
  Be concise and conversational in responses.
`
```

---

## Industry Presets

VoxQuery includes pre-configured industry presets for quick setup.

### Retail

```typescript
retail: {
  keyMetrics: ['revenue', 'orders', 'customers', 'average_order_value'],
  customTables: ['products', 'orders', 'customers', 'inventory', 'stores'],
}
```

**Use case:** Physical retail stores, multi-location businesses

### E-commerce

```typescript
ecommerce: {
  keyMetrics: ['revenue', 'orders', 'conversion_rate', 'cart_abandonment'],
  customTables: ['products', 'orders', 'customers', 'carts', 'reviews'],
}
```

**Use case:** Online stores, digital marketplaces

### SaaS

```typescript
saas: {
  keyMetrics: ['mrr', 'arr', 'churn_rate', 'active_users'],
  customTables: ['subscriptions', 'users', 'plans', 'usage_metrics'],
}
```

**Use case:** Software as a Service, subscription businesses

### Healthcare

```typescript
healthcare: {
  keyMetrics: ['patients', 'appointments', 'revenue', 'readmission_rate'],
  customTables: ['patients', 'appointments', 'providers', 'insurance'],
}
```

**Use case:** Hospitals, clinics, healthcare providers

### Finance

```typescript
finance: {
  keyMetrics: ['assets', 'liabilities', 'transactions', 'roi'],
  customTables: ['accounts', 'transactions', 'portfolios', 'clients'],
}
```

**Use case:** Financial services, investment firms

### Manufacturing

```typescript
manufacturing: {
  keyMetrics: ['production_volume', 'defect_rate', 'inventory_turnover'],
  customTables: ['products', 'production_runs', 'inventory', 'suppliers'],
}
```

**Use case:** Manufacturing, production facilities

### Education

```typescript
education: {
  keyMetrics: ['students', 'enrollment', 'graduation_rate', 'revenue'],
  customTables: ['students', 'courses', 'enrollments', 'faculty'],
}
```

**Use case:** Schools, universities, educational institutions

### Hospitality

```typescript
hospitality: {
  keyMetrics: ['occupancy_rate', 'revpar', 'bookings', 'guest_satisfaction'],
  customTables: ['reservations', 'rooms', 'guests', 'bookings'],
}
```

**Use case:** Hotels, restaurants, tourism

### Real Estate

```typescript
'real-estate': {
  keyMetrics: ['properties', 'occupancy_rate', 'rental_income', 'cap_rate'],
  customTables: ['properties', 'tenants', 'leases', 'maintenance'],
}
```

**Use case:** Property management, real estate agencies

---

## Application Settings

### Query Limits

```typescript
export const APP_SETTINGS = {
  // Maximum query results
  MAX_QUERY_RESULTS: 1000,
  
  // Query timeout in milliseconds
  QUERY_TIMEOUT_MS: 30000,  // 30 seconds
};
```

**Considerations:**
- Increase `MAX_QUERY_RESULTS` for large datasets
- Increase `QUERY_TIMEOUT_MS` for complex queries
- Balance performance with functionality

### Voice Settings

```typescript
export const APP_SETTINGS = {
  // Audio sample rate for microphone input
  AUDIO_SAMPLE_RATE: 16000,  // 16 kHz
  
  // Audio buffer size
  AUDIO_BUFFER_SIZE: 4096,   // samples
};
```

**Considerations:**
- Higher sample rate = better quality, more bandwidth
- Smaller buffer = lower latency, more CPU usage

### UI Defaults

```typescript
export const APP_SETTINGS = {
  // Default chart type
  DEFAULT_CHART_TYPE: 'bar',
  
  // Allow destructive queries
  ENABLE_DESTRUCTIVE_QUERIES: false,
  
  // Maximum conversation history
  MAX_CONVERSATION_HISTORY: 10,
  
  // Enable demo mode
  ENABLE_DEMO_MODE: true,
};
```

---

## Database Configuration

### MySQL Configuration

```env
DATABASE_TYPE="mysql"
DEFAULT_DB_HOST="localhost"
DEFAULT_DB_PORT="3306"
```

**Connection Settings:**

| Setting | Default | Description |
|---------|---------|-------------|
| Host | `localhost` | MySQL server host |
| Port | `3306` | MySQL server port |
| SSL | `false` | Enable SSL connection |

### PostgreSQL Configuration

```env
DATABASE_TYPE="postgres"
DEFAULT_DB_HOST="localhost"
DEFAULT_DB_PORT="5432"
```

**Connection Settings:**

| Setting | Default | Description |
|---------|---------|-------------|
| Host | `localhost` | PostgreSQL server host |
| Port | `5432` | PostgreSQL server port |
| SSL | `false` | Enable SSL connection |

### SSL Configuration

For production databases:

```typescript
const connection = {
  type: 'mysql',
  host: 'production-db.example.com',
  port: 3306,
  database: 'production',
  username: 'app_user',
  password: 'secure_password',
  ssl: true,  // Enable SSL
};
```

---

## AI Customization

### System Prompt Customization

The AI system prompt can be customized in `hooks/use-live-gemini.ts`:

```typescript
const systemPrompt = `You are VoxQuery, a friendly and helpful database assistant for ${config.name}.

DATABASE SCHEMA:
${schemaDescription}

BUSINESS CONTEXT:
- Industry: ${config.industry}
- Key Metrics: ${config.keyMetrics.join(', ')}
- Currency: ${config.defaultCurrency}

GUIDELINES:
1. Speak naturally and concisely
2. Always explain what the data means
3. Suggest relevant visualizations
4. Keep responses under 30 seconds
5. Reference screen displays

${config.customInstructions}
`;
```

### Customizing AI Personality

**Friendly and Casual:**
```typescript
customInstructions: `
  Use a friendly, casual tone.
  Use contractions (you're, we've, that's).
  Show enthusiasm for interesting findings.
  Use phrases like "Great question!", "Interesting...", "Hmm..."
`
```

**Professional and Formal:**
```typescript
customInstructions: `
  Use a professional, formal tone.
  Avoid contractions.
  Focus on accuracy and precision.
  Provide detailed explanations when requested.
`
```

**Concise and Direct:**
```typescript
customInstructions: `
  Be concise and direct.
  Get straight to the point.
  Use bullet points for multiple items.
  Keep responses under 2 sentences when possible.
`
```

### Language Customization

VoxQuery automatically responds in the same language as the user. To customize:

```typescript
// In use-live-gemini.ts
ALWAYS respond in the SAME language the user uses:
- User speaks English → Respond in English
- User speaks Spanish → Respond in Spanish
- User speaks French → Respond in French
```

---

## Security Configuration

### Query Security

```typescript
export const APP_SETTINGS = {
  // Block destructive queries
  ENABLE_DESTRUCTIVE_QUERIES: false,
};
```

**Destructive patterns blocked:**
- `DROP`
- `DELETE`
- `TRUNCATE`
- `UPDATE`
- `INSERT`
- `ALTER`
- `CREATE`
- `REPLACE`

### Enabling Destructive Queries (Not Recommended)

For development environments only:

```env
ENABLE_DESTRUCTIVE_QUERIES="true"
```

⚠️ **Warning:** Only enable in isolated development environments.

### Query Result Limiting

```typescript
// Auto-add LIMIT to queries
if (!/\bLIMIT\b/i.test(query)) {
  const cleanQuery = query.trim().replace(/;\s*$/, '');
  finalQuery = `${cleanQuery}\nLIMIT 1000`;
}
```

**Customize limit:**
```typescript
const MAX_RESULTS = 500;  // Change from 1000
```

### Credential Protection

Passwords are:
- ✅ Stored in memory only (Zustand state)
- ✅ Never persisted to localStorage
- ✅ Not included in persisted connection data
- ✅ Cleared on disconnect

---

## UI Customization

### Branding

#### Logo

Replace logo files in `public/`:

| File | Usage | Size |
|------|-------|------|
| `Logo.png` | Default logo | 200x50px |
| `logo_light_bg.png` | Light background | 200x50px |
| `logo-vector.png` | Vector version | Any |

#### Business Name in UI

Update in components:

```typescript
// components/Header.tsx
const BUSINESS_NAME = process.env.BUSINESS_NAME || 'VoxQuery';

<h1 className="text-xl font-bold">{BUSINESS_NAME}</h1>
```

### Theme Colors

VoxQuery uses Tailwind CSS with a slate color palette:

```typescript
// Primary colors
bg-[#0f172a]      // Dark background (slate-950)
bg-slate-900       // Panel background
text-slate-100     // Primary text
text-slate-400     // Secondary text

// Accent colors
text-emerald-500   // Success/Active
text-blue-500      // Info
text-purple-500    // AI speaking
text-red-500       // Error/Stop
```

**Customize colors in `globals.css`:**

```css
:root {
  --background-primary: #0f172a;
  --background-secondary: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --accent-primary: #10b981;
}
```

### Chart Customization

Default chart types:

```typescript
type ChartType = 'bar' | 'line' | 'pie' | 'table' | 'number';
```

**Add custom chart types in `components/Visualization.tsx`:**

```typescript
// Add area chart
case 'area':
  return <AreaChart data={data} />;
```

---

## Configuration Validation

### Environment Variable Validation

Add validation in development:

```typescript
// lib/config.ts
export function validateConfig() {
  const requiredVars = ['NEXT_PUBLIC_GEMINI_API_KEY'];
  const missing = requiredVars.filter(
    varName => !process.env[varName]
  );

  if (missing.length > 0) {
    console.warn(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}
```

### Configuration Health Check

Create a health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  const config = {
    geminiKey: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    businessName: process.env.BUSINESS_NAME || 'Not set',
    industry: process.env.INDUSTRY_TYPE || 'retail',
  };

  return NextResponse.json({ config });
}
```

---

## Configuration Examples

### Small Retail Business

```env
NEXT_PUBLIC_GEMINI_API_KEY="AIzaSy..."
BUSINESS_NAME="Joe's Hardware"
INDUSTRY_TYPE="retail"
DATABASE_TYPE="mysql"
DEFAULT_CURRENCY="USD"
CUSTOM_INSTRUCTIONS="Focus on inventory levels, sales trends, and supplier performance. Use friendly, neighborhood tone."
```

### E-commerce Startup

```env
NEXT_PUBLIC_GEMINI_API_KEY="AIzaSy..."
BUSINESS_NAME="ShopFast Inc"
INDUSTRY_TYPE="ecommerce"
DATABASE_TYPE="postgres"
DEFAULT_CURRENCY="USD"
DEFAULT_CHART_TYPE="line"
CUSTOM_INSTRUCTIONS="Focus on conversion rates, cart abandonment, and customer lifetime value. Always compare to previous period."
```

### SaaS Company

```env
NEXT_PUBLIC_GEMINI_API_KEY="AIzaSy..."
BUSINESS_NAME="CloudSoft"
INDUSTRY_TYPE="saas"
DATABASE_TYPE="postgres"
DEFAULT_CURRENCY="USD"
CUSTOM_INSTRUCTIONS="Focus on MRR, ARR, churn rate, and user engagement. Use professional but friendly tone."
```

### Healthcare Provider

```env
NEXT_PUBLIC_GEMINI_API_KEY="AIzaSy..."
BUSINESS_NAME="City Medical Center"
INDUSTRY_TYPE="healthcare"
DATABASE_TYPE="mysql"
DEFAULT_CURRENCY="USD"
ENABLE_DESTRUCTIVE_QUERIES="false"
CUSTOM_INSTRUCTIONS="Focus on patient outcomes, appointment scheduling, and resource utilization. Maintain professional, HIPAA-compliant language."
```

---

## Troubleshooting

### Configuration Not Applied

**Symptoms:**
- Changes to `.env.local` not reflected
- Default values used

**Solution:**
```bash
# Restart development server
# Environment variables are loaded on startup
Ctrl+C
npm run dev
```

### Industry Preset Not Working

**Symptoms:**
- AI doesn't understand industry terms
- Wrong metrics prioritized

**Solution:**
```typescript
// Verify industry type matches preset
INDUSTRY_TYPE="ecommerce"  // Not "e-commerce" or "ecom"

// Check lib/config.ts for preset definition
```

### Custom Instructions Ignored

**Symptoms:**
- AI doesn't follow custom instructions
- Default behavior persists

**Solution:**
1. Ensure `CUSTOM_INSTRUCTIONS` is set in `.env.local`
2. Restart development server
3. Check system prompt in `use-live-gemini.ts`
4. Clear browser cache

---

*Last Updated: March 3, 2026*
