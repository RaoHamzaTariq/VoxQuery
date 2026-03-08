# 🚀 VoxQuery Setup Guide

> Complete guide to installing and configuring VoxQuery on your local machine.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [First Connection](#first-connection)
- [Running VoxQuery](#running-voxquery)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before installing VoxQuery, ensure you have the following:

### Required Software

| Software | Version | Purpose | Download |
|----------|---------|---------|----------|
| **Node.js** | 20.x or higher | JavaScript runtime | [Download](https://nodejs.org/) |
| **npm** | 9.x or higher | Package manager | Included with Node.js |
| **Git** | Latest | Version control | [Download](https://git-scm.com/) |

### Required Accounts & Keys

| Item | Purpose | Get From |
|------|---------|----------|
| **Google Gemini API Key** | AI voice processing | [Google AI Studio](https://aistudio.google.com/apikey) |

### Optional (For Database Connection)

| Software | Version | Purpose |
|----------|---------|---------|
| **MySQL** | 5.7+ | Database server |
| **PostgreSQL** | 12+ | Database server |

> 💡 **Note**: You can use VoxQuery in **Demo Mode** without a database for testing and exploration.

---

## Installation

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <repository-url> VoxQuery
cd VoxQuery
```

### Step 2: Install Dependencies

```bash
# Install all dependencies
npm install
```

**Expected Output:**
```
added 500+ packages in 2m
```

### Step 3: Set Up Environment Variables

```bash
# Copy the environment template
cp .env.example .env.local

# Open .env.local in your editor
# Windows: notepad .env.local
# macOS/Linux: nano .env.local
```

**Edit `.env.local`:**

```env
# ════════════════════════════════════════════════════════
# Required: API Keys
# ════════════════════════════════════════════════════════
NEXT_PUBLIC_GEMINI_API_KEY="your_actual_gemini_api_key"

# ════════════════════════════════════════════════════════
# Optional: Business Customization
# ════════════════════════════════════════════════════════
BUSINESS_NAME="Your Company Name"
INDUSTRY_TYPE="retail"
DATABASE_TYPE="mysql"
DEFAULT_CHART_TYPE="bar"
ENABLE_DESTRUCTIVE_QUERIES="false"
CUSTOM_INSTRUCTIONS=""
DEBUG_MODE="false"
```

> ⚠️ **Important**: Replace `your_actual_gemini_api_key` with your real Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

### Step 4: Verify Installation

```bash
# Run the development server
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 15.4.9
  - Local:        http://localhost:3000
  - Ready in 1234ms
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Configuration

### Environment Variables Reference

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | Your Gemini API key | `AIzaSy...` |

#### Optional Variables

| Variable | Description | Default | Options |
|----------|-------------|---------|---------|
| `BUSINESS_NAME` | Your organization name | `Your Business` | Any string |
| `INDUSTRY_TYPE` | Industry for AI context | `retail` | `retail`, `ecommerce`, `saas`, `healthcare`, `finance`, `manufacturing`, `education`, `hospitality`, `real-estate`, `other` |
| `DATABASE_TYPE` | Primary database type | `mysql` | `mysql`, `postgres` |
| `DEFAULT_CHART_TYPE` | Default visualization | `bar` | `bar`, `line`, `pie`, `table`, `number` |
| `ENABLE_DESTRUCTIVE_QUERIES` | Allow destructive queries | `false` | `true`, `false` |
| `CUSTOM_INSTRUCTIONS` | Custom AI instructions | `""` | Any string |
| `DEBUG_MODE` | Enable debug logging | `false` | `true`, `false` |

### Business Configuration (Advanced)

For deeper customization, edit `lib/config.ts`:

```typescript
export const DEFAULT_CONFIG: BusinessConfig = {
  name: 'Your Business',
  industry: 'retail',  // Change to match your industry
  keyMetrics: ['revenue', 'orders', 'customers', 'average_order_value'],
  customTables: ['products', 'orders', 'customers', 'inventory'],
  defaultCurrency: 'USD',
  dateFormat: 'YYYY-MM-DD',
  fiscalYearStart: 'January',
  customInstructions: `
    Focus on sales metrics and customer analytics.
    Always show currency in USD and mention growth percentages.
  `,
};
```

---

## First Connection

### Option 1: Demo Mode (Recommended for First-Time Users)

1. **Launch VoxQuery**
   ```bash
   npm run dev
   ```

2. **Enable Demo Mode**
   - On the connection screen, toggle **"Demo Mode"**
   - Click **"Save & Connect"**

3. **Navigate to Dashboard**
   - Click **"Dashboard"** in the sidebar
   - Click **"Connect"** to establish Gemini session

4. **Try Your First Query**
   - Click the **Microphone** button
   - Ask: *"Show me total sales"*
   - View results with chart and SQL preview

### Option 2: Connect to Real Database

#### MySQL Connection

1. **Gather Connection Details**
   - Host: `localhost` (or your server IP)
   - Port: `3306`
   - Database: Your database name
   - Username: Database user
   - Password: User password

2. **Fill Connection Form**
   - Select **MySQL** as database type
   - Enter connection details
   - Click **"Test Connection"** to verify
   - Click **"Save & Connect"**

3. **Verify Schema**
   - Schema browser should show your tables
   - Expand tables to see columns

#### PostgreSQL Connection

1. **Gather Connection Details**
   - Host: `localhost` (or your server IP)
   - Port: `5432`
   - Database: Your database name
   - Username: Database user
   - Password: User password
   - SSL: Enable if required

2. **Fill Connection Form**
   - Select **PostgreSQL** as database type
   - Enter connection details
   - Enable **SSL** if needed
   - Click **"Test Connection"** to verify
   - Click **"Save & Connect"**

---

## Running VoxQuery

### Development Mode

```bash
# Start development server with hot reload
npm run dev

# Access at http://localhost:3000
```

**Features:**
- ✅ Hot module replacement (HMR)
- ✅ Detailed error messages
- ✅ Source maps for debugging

### Production Build

```bash
# Create optimized production build
npm run build

# Start production server
npm run start

# Access at http://localhost:3000
```

**Features:**
- ✅ Optimized bundle size
- ✅ Minified code
- ✅ Production optimizations

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint code check |
| `npm run clean` | Clean Next.js cache |

---

## Troubleshooting

### Installation Issues

#### Problem: `npm install` fails

**Symptoms:**
```
npm ERR! code ENOENT
npm ERR! syscall open
npm ERR! path package.json
```

**Solution:**
```bash
# Ensure you're in the project directory
cd VoxQuery

# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Problem: Node.js version mismatch

**Symptoms:**
```
Error: Unsupported engine "node>=20"
```

**Solution:**
```bash
# Check your Node.js version
node --version

# Upgrade Node.js to version 20 or higher
# Download from https://nodejs.org/

# Or use nvm (Node Version Manager)
nvm install 20
nvm use 20
```

### API Key Issues

#### Problem: Gemini API key not working

**Symptoms:**
- Error: "Gemini API key not configured"
- Microphone button doesn't work

**Solution:**

1. **Verify API Key in .env.local**
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY="your_actual_key"
   ```

2. **Restart Development Server**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

3. **Test API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Ensure API key is active
   - Check quota limits

### Microphone Issues

#### Problem: Microphone not detected

**Symptoms:**
- Browser shows microphone blocked icon
- No audio visualization

**Solution:**

1. **Grant Microphone Permission**
   - Click lock icon in browser address bar
   - Allow microphone access
   - Refresh page

2. **Check Browser Compatibility**
   - Use Chrome 120+ or Edge 120+ (recommended)
   - Firefox and Safari have limited support

3. **Test Microphone**
   ```bash
   # Use another app to verify microphone works
   # e.g., Google Meet, Zoom, or browser recorder
   ```

### Database Connection Issues

#### Problem: Connection refused

**Symptoms:**
```
Error: ECONNREFUSED
```

**Solution:**

1. **Verify Database is Running**
   ```bash
   # MySQL
   mysql --version
   
   # PostgreSQL
   psql --version
   ```

2. **Check Host and Port**
   - MySQL: `localhost:3306`
   - PostgreSQL: `localhost:5432`

3. **Test Connection Manually**
   ```bash
   # MySQL
   mysql -h localhost -u username -p database_name
   
   # PostgreSQL
   psql -h localhost -U username -d database_name
   ```

#### Problem: Authentication failed

**Symptoms:**
```
Error: Access denied for user 'username'@'localhost'
```

**Solution:**

1. **Verify Credentials**
   - Double-check username and password
   - Ensure user has SELECT privileges

2. **Reset Password (if needed)**
   ```sql
   -- MySQL
   ALTER USER 'username'@'localhost' IDENTIFIED BY 'new_password';
   FLUSH PRIVILEGES;
   
   -- PostgreSQL
   ALTER USER username WITH PASSWORD 'new_password';
   ```

### Build Issues

#### Problem: TypeScript errors

**Symptoms:**
```
error TS2345: Argument of type 'X' is not assignable to parameter of type 'Y'
```

**Solution:**

```bash
# Check for type errors
npx tsc --noEmit

# Fix reported errors in your code
# Or temporarily disable strict mode in tsconfig.json
```

#### Problem: ESLint warnings

**Symptoms:**
```
warning  'variable' is defined but never used  no-unused-vars
```

**Solution:**

```bash
# Run linter to see all issues
npm run lint

# Fix automatically (if possible)
npm run lint -- --fix
```

---

## Next Steps

After successful installation:

1. ✅ **Explore Demo Mode** - Test with sample data
2. ✅ **Connect Your Database** - Set up real database connection
3. ✅ **Customize Configuration** - Adjust for your industry
4. ✅ **Try Voice Queries** - Ask questions naturally
5. ✅ **Review Security Settings** - Configure query permissions

---

## Getting Help

- 📖 **[Architecture Docs](./ARCHITECTURE.md)** - Understand system design
- 📚 **[API Documentation](./API_DOCUMENTATION.md)** - API reference
- 🔧 **[Configuration Guide](./CONFIGURATION.md)** - Customization options
- 🐛 **[Troubleshooting](../README.md#troubleshooting)** - Common issues

---

*Last Updated: March 3, 2026*
