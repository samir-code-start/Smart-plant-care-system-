# AI-Powered Smart Plant Care System

A full-stack precision agriculture and IoT web application designed to monitor soil moisture, track hydration trends, record manual observations, and deliver botanical health evaluations and interactive care advice powered by **Google Gemini AI**.

---

## 🌿 System Architecture

```
Hardware Layer:
ESP8266 NodeMCU + Soil Sensor ──(WiFi HTTPS 30s)──> ThingSpeak (Fields 1-4)
                                                          │
Cloud & Backend Layer:                                    │
                                                          ▼
Supabase PostgreSQL <──> Vercel Serverless Functions (/api/*) <──> Google Gemini API
                                  │                                (gemini-3.8-flash)
Presentation Layer:               ▼
                         React Dashboard (Vite)
            (Telemetry, Manual Input, Trends, AI Analysis, Q&A)
```

---

## 🛠️ Technology Stack

| Layer | Technology | Function |
|---|---|---|
| **Frontend Framework** | React 19 + TypeScript | Component-based, fully type-safe user interface |
| **Bundler & Dev Server** | Vite 8 + Tailwind CSS v4 | Instant hot-reloading with integrated API middleware |
| **Icons & Design** | Lucide React + Tailwind Utility Classes | Responsive, clean botanical interface |
| **Data Visualisation** | Recharts (ComposedChart) | Dual-series chart distinguishing physical sensor from manual logs |
| **Hardware** | ESP8266 NodeMCU v2/v3 + Analog Soil Sensor | Analog reading, noise oversampling, inverted calibration |
| **IoT Telemetry Buffer** | ThingSpeak REST API | Cloud telemetry buffer with 4 dedicated channels |
| **Database** | Supabase (PostgreSQL 15+) | Predefined plant catalog & manual reading audit trail with RLS |
| **Serverless API** | Vercel Serverless Functions (`api/*.ts`) | Secure backend shielding API keys and credentials |
| **Generative AI** | Google Gemini API (`gemini-3.8-flash`) | Precision botanical analysis and interactive plant assistant |

---

## 📁 Repository Structure & Code Functionality

```
iot/
├── .env.example                  # Environment variable template with documentation
├── .env.local                    # Local secrets (gitignored, never committed)
├── vercel.json                   # Vercel routing, build commands, and serverless rules
├── package.json                  # Dependencies, scripts, and engine specifications
├── vite.config.ts                # Vite config + local dev middleware for /api/* routes
│
├── api/                          # Vercel Serverless Backend (Node.js runtime)
│   ├── _shared/
│   │   ├── geminiClient.ts       # Singleton wrapper for @google/genai SDK (gemini-3.8-flash)
│   │   ├── supabaseClient.ts     # Server-side Supabase client with service-role security
│   │   ├── thingspeakClient.ts   # HTTP fetcher, parser & validator for ThingSpeak feeds
│   │   └── types.ts              # Shared TypeScript contracts for requests & responses
│   ├── sensor-latest.ts          # GET: Latest ThingSpeak feed + stale & offline status
│   ├── sensor-history.ts         # GET: Recent feeds (last 30) for trend graphing
│   ├── manual-reading.ts         # POST: Validates & records manual soil observations
│   ├── manual-history.ts         # GET: Retrieves recent manual observations from Supabase
│   ├── analyze.ts                # POST: On-demand structured plant health assessment
│   └── chat.ts                   # POST: Conversational plant care Q&A
│
├── database/                     # PostgreSQL Migrations & Seeds
│   ├── schema.sql                # Table definitions, enums, checks, indices & RLS policies
│   └── seed.sql                  # Botanical presets for all 7 supported plants
│
├── firmware/                     # ESP8266 NodeMCU Firmware
│   ├── plant_monitor/
│   │   ├── plant_monitor.ino     # Non-blocking C++ sketch (ADC reading, calibration, WiFi)
│   │   └── config.h.example      # Template for WiFi SSID, ThingSpeak key, and ADC values
│   ├── WIRING.md                 # Pinout table, circuit diagram, and 3.3V safety rules
│   └── CALIBRATION.md            # Step-by-step air/water calibration procedure
│
└── src/                          # React Frontend Application
    ├── components/
    │   ├── common/
    │   │   ├── Badge.tsx         # Color-coded status indicators (Online, Stale, Dry, Wet)
    │   │   ├── Button.tsx        # Accessible button with loading spinner state
    │   │   ├── Card.tsx          # Consistent container card with header actions
    │   │   └── LoadingSpinner.tsx# Reusable loading indicator
    │   ├── dashboard/
    │   │   ├── Header.tsx        # App header displaying live sensor connection & freshness
    │   │   ├── PlantSelector.tsx # Dropdown for 7 plants + 6 growth stage selector pills
    │   │   ├── PlantInfoCard.tsx # Displays ideal moisture range, watering & care guidelines
    │   │   ├── SensorCard.tsx    # Real-time gauge (0-100%), raw ADC, and freshness badge
    │   │   ├── ManualInputCard.tsx # 3-state radio buttons (Dry/Damp/Wet) + submit form
    │   │   ├── MoistureChart.tsx # Recharts chart showing continuous sensor vs manual logs
    │   │   └── RecentLogsTable.tsx # Tabular activity log sorted newest first
    │   └── ai/
    │       ├── AnalysisView.tsx  # Structured cards for condition, trends, actions & alerts
    │       └── ChatAssistant.tsx # Interactive Q&A chat assistant for plant health questions
    ├── data/
    │   └── predefinedPlants.ts   # Client-side botanical constants for instant render
    ├── hooks/
    │   ├── usePlantSelection.ts  # Active plant and growth stage state management
    │   ├── useSensorTelemetry.ts # Periodic polling of ThingSpeak with stale detection
    │   ├── useManualReading.ts   # Form mutation and Supabase query management
    │   ├── usePlantAnalysis.ts   # On-demand Gemini AI health evaluation state
    │   └── usePlantChat.ts       # Conversational chat state and turn-by-turn history
    ├── services/
    │   └── api.ts                # Type-safe fetch client for all /api endpoints
    └── types/
        ├── plant.ts              # Plant, growth stage, care profile interfaces
        ├── telemetry.ts          # Sensor readings, manual logs, connection status types
        └── ai.ts                 # Gemini structured response schema & chat types
```

---

## 🔍 How the System Works

### 1. IoT Sensor Telemetry & Calibration
- The **ESP8266 NodeMCU** connects to an analog soil moisture probe via pin `A0` powered strictly at `3.3V`.
- **Oversampling:** Takes 10 readings over 500ms and computes the arithmetic mean to filter electrical noise.
- **Inverted Linear Calibration:** Maps raw analog values (`0–1024`) into a true `0%–100%` percentage scale:
  $$\text{Moisture \%} = \frac{\text{ADC}_{\text{air}} - \text{ADC}_{\text{reading}}}{\text{ADC}_{\text{air}} - \text{ADC}_{\text{water}}} \times 100\%$$
- **Transmission:** Reports every 30 seconds to **ThingSpeak**:
  - `Field 1`: Raw ADC value
  - `Field 2`: Calibrated moisture percentage
  - `Field 3`: Plant ID (1=Tomato, 2=Basil, 3=Aloe Vera, 4=Money Plant, 5=Mint, 6=Rose, 7=Cucumber)
  - `Field 4`: Sensor status code (0=Boot, 1=Normal, 2=Out of Range)

### 2. Connection Health & Stale Telemetry Detection
- Telemetry is considered **Live / Online** if the latest update is within 120 seconds.
- If no update is received for $>120$ seconds, the dashboard transitions to **Stale Telemetry** (amber warning).
- If no update is received for $>300$ seconds, the dashboard indicates **Sensor Offline** (red indicator).
- The system **never fabricates** readings or disguises stale values as live measurements.

### 3. Manual Fallback Observations
- When the physical sensor is offline or moved, users can record soil observations:
  - `Dry` (Soil feels dry and crumbly)
  - `Damp` (Soil feels cool and moderately moist)
  - `Wet` (Soil feels saturated with water)
- Stored permanently in **Supabase PostgreSQL** with `input_source = 'manual'`.
- The trends chart represents manual logs as discrete diamond scatter points, distinct from continuous sensor lines.

### 4. Botanical Guidance & Presets
Seven plants are supported with scientifically accurate moisture thresholds:
- **Tomato** (*Solanum lycopersicum*): 60%–80%
- **Basil** (*Ocimum basilicum*): 50%–70%
- **Aloe Vera** (*Aloe barbadensis miller*): 15%–30%
- **Money Plant** (*Epipremnum aureum*): 40%–60%
- **Mint** (*Mentha spicata*): 60%–80%
- **Rose** (*Rosa spp.*): 50%–70%
- **Cucumber** (*Cucumis sativus*): 60%–80%

### 5. Generative AI Botanical Analysis (`gemini-3.8-flash`)
- **Trigger:** Only executed when the user clicks **"Analyse Plant"** (never automated on raw sensor packets to avoid quota exhaustion).
- **Context Provided:** Selected plant, botanical description, current growth stage, ideal moisture thresholds, latest available telemetry (sensor or manual), and recent historical trend.
- **Output:** Returns a structured evaluation containing:
  - `moisture_status_assessment`: Optimal, Under-watered, or Over-watered
  - `current_condition_summary`: Plain-English diagnosis
  - `trend_interpretation`: Evaluation of rate of drying or saturation
  - `care_recommendations`: Actionable steps (watering quantity, pruning, drainage)
  - `warnings`: Critical alerts (e.g. blossom drop risk, root rot warning)

---

## 🚀 Setup & Installation

### 1. Prerequisites
- Node.js `v20+` or `v24+` installed
- [Supabase](https://supabase.com) account (free tier)
- [ThingSpeak](https://thingspeak.mathworks.com) account (free tier)
- [Google AI Studio](https://aistudio.google.com/) Gemini API Key

### 2. Environment Configuration
Copy `.env.example` to `.env.local` and add your service credentials:
```bash
cp .env.example .env.local
```

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.8-flash

# ThingSpeak Channel
THINGSPEAK_CHANNEL_ID=your_channel_id
THINGSPEAK_READ_API_KEY=your_read_api_key

# Freshness Timeouts
STALE_THRESHOLD_SECONDS=120
OFFLINE_THRESHOLD_SECONDS=300
```

### 3. Run Database Migrations (Supabase)
1. In the Supabase Dashboard, open the **SQL Editor**.
2. Run `database/schema.sql` to initialize tables, enums, indices, and RLS policies.
3. Run `database/seed.sql` to populate the 7 botanical presets.

### 4. Run Locally
```bash
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser. The custom Vite dev middleware automatically proxies `/api/*` requests to your local serverless function files!

### 5. Flash ESP8266 Firmware
1. Open `firmware/plant_monitor/plant_monitor.ino` in Arduino IDE.
2. Follow `firmware/WIRING.md` for hardware connections.
3. Calibrate your sensor using `firmware/CALIBRATION.md`.
4. Copy `firmware/plant_monitor/config.h.example` to `config.h`, fill in WiFi credentials and ThingSpeak Write Key, and upload.

---

## 🚢 Deploying to Vercel

1. Push this repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Configure the Environment Variables in the Vercel project settings (from `.env.local`).
4. Click **Deploy**. Vercel will automatically build the React frontend and deploy the `/api` serverless functions.

---

## 📄 License

MIT License. Designed and developed with Google Antigravity.
