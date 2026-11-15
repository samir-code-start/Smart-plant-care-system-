# PROJECT SPECIFICATION

# AI-Powered Smart Plant Care System

**Version:** 1.0\
**Project Type:** AI + IoT + Full-Stack Web Application\
**Development Environment:** Google Antigravity IDE\
**Project Status:** Specification and planning phase

---

# 1. Project Objective

Build a web-based AI-Powered Smart Plant Care System that combines IoT-based soil moisture monitoring, manual moisture input, cloud data storage, and Generative AI-powered plant analysis.

The application should allow users to:

1. Select a plant from a predefined collection.
2. Select its current growth stage.
3. Monitor soil moisture using a physical ESP8266 NodeMCU and soil moisture sensor.
4. Enter moisture conditions manually when physical sensor monitoring is unavailable.
5. View moisture readings and historical trends.
6. Request AI-powered plant analysis using the Google Gemini API.
7. Ask plant-related questions through an AI chat interface.

The physical IoT sensor must be the primary demonstration feature. Manual input is a fallback that must remain available.

The application is intended to be a single-user demonstration project. User authentication is not required.

# 2. Development Instructions for Antigravity

Act as a senior full-stack engineer with experience in IoT integrations, React, cloud databases, serverless backends, and Generative AI applications.

Your responsibility is to build a reliable, maintainable, and functional application based on this specification.

## Engineering autonomy

You have freedom to decide:

- Project folder organisation.
- Component architecture.
- Reusable hooks and utility functions.
- Code organisation and naming conventions.
- Error handling and validation.
- Loading states and responsive layouts.
- Performance optimisations.
- Appropriate libraries within the approved technology stack.

You must request approval before:

- Changing the approved technology stack.
- Adding major features.
- Changing the product requirements.
- Changing the database architecture.
- Introducing authentication.
- Adding paid services or subscriptions.
- Exposing or changing security-sensitive configurations.
- Performing destructive database or repository operations.

## Required development workflow

Follow this process:

**Plan → Review → Approval → Implementation → Testing → Verification**

Before writing substantial code:

1. Inspect the existing repository.
2. Identify existing files, dependencies, and configurations.
3. Prepare an implementation plan.
4. Identify unresolved technical decisions.
5. Present the proposed database schema and API contracts.
6. Wait for approval before executing significant changes.

Do not unnecessarily recreate existing working code.

Do not install unnecessary dependencies or overengineer the application.

# 3. Approved Technology Stack

Use the following technologies:

| Component            | Approved Technology                             |
| -------------------- | ----------------------------------------------- |
| Frontend             | React                                           |
| Build tool           | Vite                                            |
| Programming language | JavaScript or TypeScript (recommend TypeScript) |
| Styling              | Tailwind CSS                                    |
| Hardware             | ESP8266 NodeMCU                                 |
| Soil monitoring      | Soil moisture sensor                            |
| IoT cloud            | ThingSpeak                                      |
| Database             | Supabase PostgreSQL                             |
| Backend              | Vercel Serverless Functions                     |
| AI provider          | Google Gemini API                               |
| AI SDK               | Official `@google/genai` SDK                    |
| IDE                  | Google Antigravity                              |
| Version control      | GitHub                                          |

Do not introduce another backend framework or database without approval.

# 4. Plant Collection and Preset Information

The application must support only the following predefined plants:

1. Tomato
2. Basil
3. Aloe Vera
4. Money Plant
5. Mint
6. Rose
7. Cucumber

Users must select a plant from this collection.

Custom plant creation, custom plant names, and custom plant profiles are not required.

## Plant information

Each plant must have predefined information:

- Plant name.
- Description.
- Recommended soil moisture guidance.
- Watering requirements.
- Basic care instructions.
- Available growth stages.

## Growth stages

Users must be able to select one of the following:

- Seedling
- Vegetative
- Flowering
- Fruiting
- Mature
- Unknown

Growth stage selection must be available on the main dashboard.

Plant moisture requirements must come from predefined plant data. Do not allow Gemini to invent the plant's recommended moisture thresholds.

Keep plant information separate from frontend components so it can be maintained easily.

# 5. IoT Hardware Requirements

## Hardware components

The physical monitoring system uses:

- ESP8266 NodeMCU.
- Soil moisture sensor.
- USB power supply for the NodeMCU.
- Appropriate sensor wiring and power connections.

## Sensor behaviour

The system will use only ONE physical sensor.

The sensor will monitor one selected plant at a time.

The ESP8266 must:

1. Read the soil moisture sensor.
2. Obtain the raw ADC value.
3. Convert the raw reading into a calibrated approximate moisture percentage.
4. Send readings to ThingSpeak.
5. Include the relevant sensor status information where supported.

Important:

- Raw ADC values must never be directly presented as moisture percentages.
- Calibration values must be configurable.
- Do not invent calibration values.
- Keep the sensor reporting interval configurable.
- Account for ThingSpeak rate limits.
- Handle failed network requests.
- Avoid presenting invalid readings as genuine measurements.

The final calibration values will be supplied after physical testing.

# 6. ThingSpeak Integration

ThingSpeak will be responsible for storing physical sensor readings.

The data flow must be:

ESP8266 → ThingSpeak → Vercel API → React Dashboard

Use ThingSpeak as the primary source of physical sensor data.

## Proposed ThingSpeak fields

| Field   | Purpose                        |
| ------- | ------------------------------ |
| Field 1 | Raw sensor ADC value           |
| Field 2 | Calibrated moisture percentage |
| Field 3 | Plant identifier               |
| Field 4 | Sensor status                  |

The exact field mapping must be confirmed before implementation.

ThingSpeak should store the sensor's physical readings and history.

Do not duplicate every ThingSpeak reading into Supabase.

The Vercel backend should retrieve the latest sensor reading and relevant historical readings from ThingSpeak.

## Sensor connection status

The dashboard must display:

- Latest available reading.
- Reading timestamp.
- Connection status.
- Whether the displayed reading is current or stale.

If the sensor stops sending readings:

- Preserve the last known reading.
- Preserve its original timestamp.
- Show a disconnected or stale status.
- Never represent an old reading as a live measurement.

Implement a configurable stale-reading timeout. Its final value must be agreed upon before testing.

# 7. Manual Moisture Input

Manual moisture input must always be available on the main dashboard.

Users must be able to enter a moisture condition without relying on the physical sensor.

The application should support the following conditions:

- Dry
- Damp
- Wet

Store manual readings in Supabase.

Each manual reading must contain:

- Reading ID.
- Plant ID.
- Moisture condition.
- Input source.
- Timestamp.

The input source must be marked as `manual`.

Manual input must never be displayed as a physical sensor measurement.

There must not be a separate controller interface.

# 8. Monitoring Modes

Both monitoring options must remain available at all times.

### Sensor monitoring

- Retrieves physical readings from ThingSpeak.
- Displays moisture information and sensor status.
- Uses physical sensor history.

### Manual monitoring

- Allows the user to enter a moisture condition.
- Stores the reading in Supabase.
- Displays manual reading history.

The user should be able to use either method without permanently disabling the other.

Clearly identify the source of every reading.

Do not merge sensor and manual readings into a single indistinguishable data series.

# 9. Moisture History and Visualisation

Create a simple moisture history section on the main dashboard.

It should:

- Display historical readings.
- Show timestamps.
- Identify the reading source.
- Display sensor history retrieved from ThingSpeak.
- Display manual history retrieved from Supabase.
- Provide a simple chart for understanding moisture trends.

Use an appropriate charting library if necessary.

Do not introduce complex analytics or forecasting in the first version.

# 10. Supabase Database

Supabase PostgreSQL will be used for application data and manual moisture readings.

It is not the primary storage system for physical sensor readings.

## Proposed tables

### Table: plants

Stores the predefined plant collection.

Suggested columns:

- `id`
- `name`
- `description`
- `moisture_guidance`
- `watering_requirements`
- `care_instructions`
- `created_at`

### Table: moisture_readings

Stores manual moisture readings.

Suggested columns:

- `id`
- `plant_id`
- `moisture_status`
- `input_source`
- `created_at`

Requirements:

- Use appropriate PostgreSQL data types.
- Add primary keys and foreign keys.
- Add appropriate constraints.
- Ensure `input_source` identifies manual readings.
- Use timestamps consistently.
- Avoid unnecessary duplication.

The exact schema must be presented for review before database execution.

## Database security

No user authentication is required for this demonstration application.

However, no-login access must not mean unrestricted database access.

- Enable appropriate Row Level Security policies.
- Never expose the Supabase service-role key in frontend code.
- Use the publishable key only with suitable database policies.
- Validate and restrict operations through the backend where appropriate.

# 11. Backend Architecture

Use Vercel Serverless Functions.

Do not build a permanently running Express server.

Place serverless API functions inside the root `api/` directory.

Proposed endpoints:

### GET /api/sensor-latest

Responsibilities:

- Retrieve the latest ThingSpeak reading.
- Validate the returned data.
- Calculate whether the reading is stale.
- Return reading, timestamp, and connection status.

### POST /api/manual-reading

Responsibilities:

- Accept manual moisture input.
- Validate the selected plant and moisture condition.
- Save the reading to Supabase.
- Return the saved record.

### POST /api/analyze

Responsibilities:

- Accept the selected plant and growth stage.
- Retrieve relevant moisture information.
- Retrieve relevant recent history.
- Send the context to Gemini.
- Return structured analysis to the frontend.

### POST /api/chat

Responsibilities:

- Accept a plant-related user question.
- Include relevant plant context.
- Communicate with Gemini.
- Return the AI response.

You may propose adjustments to these endpoint contracts before implementation, but obtain approval first.

# 12. Gemini AI Integration

Use Google Gemini through the official `@google/genai` SDK.

The Gemini API key must be stored securely on the backend.

Never expose the Gemini API key in:

- React frontend code.
- Browser environment variables.
- GitHub repository.
- ESP8266 firmware.

## AI analysis trigger

AI analysis must run ONLY when the user clicks the Analyse button.

Do not call Gemini automatically after every sensor reading.

## Analysis context

Send relevant information to Gemini:

- Plant name.
- Plant description.
- Growth stage.
- Predefined moisture requirements.
- Latest available reading.
- Reading source: sensor or manual.
- Reading timestamp.
- Relevant recent moisture history.

## Expected AI response

The AI should provide:

1. Current moisture condition.
2. Comparison with recommended plant moisture guidance.
3. Interpretation of recent moisture trends.
4. Plant-specific care recommendations.
5. Important warnings, if applicable.

AI outputs must be structured and easy to display in the dashboard.

The AI must distinguish between physical sensor measurements and manually entered conditions.

If no valid moisture reading is available, it must clearly communicate that limitation rather than inventing an analysis.

## Plant-related AI chat

Provide a simple chat interface where users can ask questions about the selected plant.

The AI should use the selected plant's information as context.

Do not implement unrelated general-purpose AI features.

# 13. Frontend Dashboard

Build a clean, modern, responsive dashboard.

The main dashboard should contain the following sections:

### A. Plant Selection

- Dropdown or selection cards for the seven predefined plants.
- Plant name and basic information.
- Growth-stage selection.

### B. Plant Information

- Description.
- Recommended moisture guidance.
- Watering requirements.
- Basic care instructions.

### C. Physical Sensor Monitoring

- Latest moisture reading.
- Moisture percentage, if calibrated.
- Sensor connection status.
- Reading timestamp.
- Current/stale reading indicator.

### D. Manual Input

- Moisture condition selection.
- Submit button.
- Input validation.
- Success and error messages.

### E. Moisture History

- Historical sensor readings.
- Historical manual readings.
- Chart visualisation.
- Source labels and timestamps.

### F. AI Analysis

- Analyse button.
- Loading state.
- Structured analysis results.
- Care recommendations.

### G. AI Chat

- Message input.
- Chat history during the current session.
- AI response display.
- Error and loading states.

Keep all these features within one unified application dashboard.

Avoid unnecessary pages and complex navigation.

# 14. Environment Variables

Use environment variables for all service credentials.

Proposed configuration:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=

GEMINI_API_KEY=
GEMINI_MODEL=

THINGSPEAK_CHANNEL_ID=
THINGSPEAK_READ_API_KEY=
```

The ESP8266 firmware must separately use the ThingSpeak Write API Key.

Do not commit `.env.local` or other secret files to GitHub.

Provide an `.env.example` file with variable names but no actual credentials.

# 15. Explicitly Excluded Features

Do not implement the following:

- User registration and login.
- Multiple physical sensors.
- Custom plant creation.
- Custom plant names.
- Automatic irrigation.
- Water-pump control.
- Plant disease detection.
- Image recognition.
- Separately trained machine-learning models.
- Offline AI.
- Weather API integration.
- Advanced IoT automation.
- Automatic Gemini analysis.
- Complex predictive analytics.

Do not add features just because they seem useful.

Any scope expansion requires approval.

# 16. Error Handling and Reliability

The application must handle:

- ESP8266 disconnection.
- ThingSpeak API failures.
- Missing or invalid sensor readings.
- Stale readings.
- Supabase connection errors.
- Invalid manual input.
- Gemini API errors.
- Gemini rate limits.
- Network interruptions.
- Empty historical data.

Display useful error messages.

Use loading indicators and appropriate fallback states.

Never fabricate sensor values or AI analysis to make the dashboard appear functional.

# 17. Acceptance Criteria

The project will be considered functionally complete when the following conditions are satisfied.

### Plant management

- [ ] All seven predefined plants are available.
- [ ] Selecting a plant displays its predefined information.
- [ ] Users can select a growth stage.
- [ ] Custom plant creation is unavailable.

### Physical sensor

- [ ] ESP8266 reads the physical moisture sensor.
- [ ] Readings are sent to ThingSpeak.
- [ ] Dashboard retrieves readings through the backend.
- [ ] Calibrated moisture values are displayed only after calibration.
- [ ] Latest reading and timestamp are visible.
- [ ] Disconnection and stale readings are handled correctly.

### Manual monitoring

- [ ] Manual input is available on the main dashboard.
- [ ] Users can submit dry, damp, or wet conditions.
- [ ] Manual readings are stored in Supabase.
- [ ] Manual readings are clearly identified as manual.

### History

- [ ] Historical readings are displayed.
- [ ] Sensor and manual readings are distinguishable.
- [ ] A moisture history chart is available.

### AI integration

- [ ] Gemini analysis runs only after clicking Analyse.
- [ ] Plant and growth-stage context is provided.
- [ ] Relevant moisture information is provided.
- [ ] AI recommendations are displayed clearly.
- [ ] Plant-related AI chat works.
- [ ] Gemini API credentials remain server-side.

### Security and deployment

- [ ] Secrets are not committed to GitHub.
- [ ] Supabase access policies are configured.
- [ ] Backend API endpoints validate input.
- [ ] The application builds successfully.
- [ ] The application can be deployed to Vercel.

# 18. Unresolved Technical Decisions

Do not invent the following values or silently make final decisions.

Present recommendations for approval.

1. **Sensor calibration:** Actual dry-soil and wet-soil ADC values must be measured using the physical hardware.
2. **Plant association:** Confirm the workflow for associating the one physical sensor with the currently selected plant. Proposed approach: the user selects a plant, moves the sensor to that plant, and confirms the change.
3. **Moisture thresholds:** Establish defensible predefined moisture guidance for each plant.
4. **Stale-reading timeout:** Recommend an appropriate timeout based on the actual ThingSpeak reporting interval.
5. **ThingSpeak field mapping:** Confirm the final field configuration and how plant association is represented.
6. **Gemini model:** Recommend a currently available suitable model and obtain approval before final configuration.

These are implementation decisions, not permission to change the product scope.

# 19. Required Deliverables

The completed project should contain:

- Complete React frontend.
- Tailwind CSS configuration.
- Vercel serverless backend functions.
- Supabase database schema and setup instructions.
- ThingSpeak integration.
- ESP8266 firmware and wiring documentation.
- Gemini AI integration.
- `.env.example` file.
- `.gitignore` configured for secrets.
- `README.md` with setup and deployment instructions.
- Testing instructions.
- Clear project folder structure.

# 20. First Task: Planning Only

At the beginning, DO NOT immediately start generating the entire application.

First inspect the existing repository and present:

1. Your understanding of the project.
2. Proposed project folder structure.
3. System architecture.
4. Database schema.
5. Backend API contracts.
6. ThingSpeak configuration requirements.
7. ESP8266 firmware approach.
8. Frontend component plan.
9. Gemini integration plan.
10. Unresolved decisions and recommended solutions.
11. Development phases and testing strategy.

Clearly separate confirmed requirements from your recommendations.

Wait for my approval before making significant changes or executing database operations.

The priority is a working, understandable, reliable demonstration—not unnecessary complexity or excessive features.
