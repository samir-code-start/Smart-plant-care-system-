/*
  =============================================================================
  Smart Plant Care System — ESP8266 Live ThingSpeak Soil Moisture Monitor
  =============================================================================
  This sketch reads a soil moisture sensor connected to pin A0 on an ESP8266
  NodeMCU, converts the raw analog reading to a calibrated moisture percentage (0-100%),
  and sends the live telemetry to your ThingSpeak channel every 20-30 seconds.
  
  WIRING:
  -------------------------------------------------------------
  Soil Moisture Sensor VCC  ->  ESP8266 3V3  (Do NOT use 5V!)
  Soil Moisture Sensor GND  ->  ESP8266 GND
  Soil Moisture Sensor AOUT ->  ESP8266 A0
  -------------------------------------------------------------

  THINGSPEAK CHANNEL FIELD MAPPING:
  - Field 1: Raw ADC reading (0 - 1023)
  - Field 2: Soil Moisture percentage (0.0 - 100.0%)
  - Field 3: Plant ID (e.g. 1 = Tomato, 2 = Basil, 3 = Aloe Vera, etc.)
  - Field 4: Status code (0 = Boot, 1 = Normal, 2 = Out of Range)
  =============================================================================
*/

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

// =============================================================================
// 1. USER CONFIGURATION (ENTER YOUR DETAILS HERE)
// =============================================================================

// WiFi Network Credentials
const char* WIFI_SSID     = "YOUR_WIFI_NAME";        // Enter your 2.4GHz WiFi SSID
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";    // Enter your WiFi Password

// ThingSpeak Configuration
// Get your Write API Key from ThingSpeak -> Channels -> Your Channel -> API Keys -> Write API Key
const char* THINGSPEAK_WRITE_API_KEY = "YOUR_THINGSPEAK_WRITE_API_KEY";

// Active Plant ID being monitored:
// 1 = Tomato, 2 = Basil, 3 = Aloe Vera, 4 = Money Plant, 5 = Mint, 6 = Rose, 7 = Cucumber
const int ACTIVE_PLANT_ID = 1;

// Reporting interval in milliseconds (ThingSpeak free tier requires minimum 15 seconds)
const unsigned long REPORT_INTERVAL_MS = 25000; // 25 seconds between live updates

// =============================================================================
// 2. CALIBRATION VALUES (ADC 0 - 1023)
// =============================================================================
// Capacitive & resistive sensors output HIGHER values in dry air and LOWER in wet water.
// To calibrate:
//  1. Check Serial Monitor with sensor in air: set ADC_AIR_VALUE to that number (~750-850)
//  2. Check Serial Monitor with sensor in water cup: set ADC_WATER_VALUE to that number (~350-450)
int ADC_AIR_VALUE   = 820; // Dry air reading (0% moisture)
int ADC_WATER_VALUE = 380; // Submerged in water reading (100% moisture)

// Noise filtering: Number of ADC samples to average per reading
const int SAMPLE_COUNT = 15;
const int SAMPLE_DELAY_MS = 20;

// Built-in LED on NodeMCU (active LOW on most ESP8266 boards)
const int LED_PIN = LED_BUILTIN;

// =============================================================================
// 3. GLOBAL VARIABLES
// =============================================================================
unsigned long lastSendTime = 0;
bool firstRun = true;

// =============================================================================
// 4. SETUP
// =============================================================================
void setup() {
  Serial.begin(115200);
  delay(200);

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH); // LED off

  Serial.println();
  Serial.println(F("=================================================="));
  Serial.println(F(" 🌱 Smart Plant Care System — Live Soil Telemetry "));
  Serial.println(F("=================================================="));
  Serial.print(F("Calibrated Air ADC:   ")); Serial.println(ADC_AIR_VALUE);
  Serial.print(F("Calibrated Water ADC: ")); Serial.println(ADC_WATER_VALUE);
  Serial.print(F("Active Plant ID:      ")); Serial.println(ACTIVE_PLANT_ID);
  Serial.print(F("Report Interval:      ")); Serial.print(REPORT_INTERVAL_MS / 1000); Serial.println(F("s"));
  Serial.println(F("--------------------------------------------------"));

  connectWiFi();
}

// =============================================================================
// 5. MAIN LOOP
// =============================================================================
void loop() {
  // Reconnect WiFi if disconnected
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println(F("[WiFi] Lost connection. Reconnecting..."));
    connectWiFi();
  }

  unsigned long currentMillis = millis();

  // Send reading when timer expires or on initial boot
  if (firstRun || (currentMillis - lastSendTime >= REPORT_INTERVAL_MS)) {
    lastSendTime = currentMillis;
    firstRun = false;

    // 1. Take averaged reading from A0
    int rawADC = readSoilSensor();

    // 2. Map ADC reading to moisture percentage (0.0% to 100.0%)
    float moisturePct = 0.0;
    int statusCode = 1; // 1 = Normal

    if (ADC_AIR_VALUE != ADC_WATER_VALUE) {
      moisturePct = ((float)(ADC_AIR_VALUE - rawADC) / (float)(ADC_AIR_VALUE - ADC_WATER_VALUE)) * 100.0;
    }

    // Check bounds
    if (moisturePct < 0.0 || moisturePct > 100.0) {
      statusCode = 2; // Out of range flag
      moisturePct = constrain(moisturePct, 0.0, 100.0);
    }

    // 3. Print live data to Serial Monitor
    Serial.println();
    Serial.println(F("--- [LIVE READING] ---"));
    Serial.print(F("Raw ADC:      ")); Serial.println(rawADC);
    Serial.print(F("Moisture:     ")); Serial.print(moisturePct, 1); Serial.println(F("%"));
    Serial.print(F("Status:       ")); Serial.println(statusCode == 1 ? F("Normal") : F("Out of Range / Check Calibration"));

    // 4. Transmit live data to ThingSpeak
    sendToThingSpeak(rawADC, moisturePct, ACTIVE_PLANT_ID, statusCode);
  }

  delay(100);
}

// =============================================================================
// 6. HELPER FUNCTIONS
// =============================================================================

// Read analog pin A0 multiple times and compute average to eliminate noise
int readSoilSensor() {
  long total = 0;
  for (int i = 0; i < SAMPLE_COUNT; i++) {
    total += analogRead(A0);
    delay(SAMPLE_DELAY_MS);
  }
  return (int)(total / SAMPLE_COUNT);
}

// Connect to WiFi network
void connectWiFi() {
  Serial.print(F("[WiFi] Connecting to "));
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    digitalWrite(LED_PIN, LOW); // Blink LED while connecting
    delay(250);
    digitalWrite(LED_PIN, HIGH);
    delay(250);
    Serial.print(F("."));
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println(F("[WiFi] Connected successfully!"));
    Serial.print(F("[WiFi] IP Address: "));
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println(F("[WiFi] Failed to connect. Will retry during next cycle."));
  }
}

// Send live data to ThingSpeak using HTTP GET
bool sendToThingSpeak(int rawADC, float moisturePct, int plantId, int status) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println(F("[ThingSpeak] Cannot send: WiFi not connected."));
    return false;
  }

  // Visual indicator: Turn on LED during transmission
  digitalWrite(LED_PIN, LOW);

  WiFiClient client;
  HTTPClient http;

  // Construct ThingSpeak update URL
  // http://api.thingspeak.com/update?api_key=KEY&field1=ADC&field2=MOISTURE&field3=PLANT&field4=STATUS
  String url = "http://api.thingspeak.com/update";
  url += "?api_key=" + String(THINGSPEAK_WRITE_API_KEY);
  url += "&field1=" + String(rawADC);
  url += "&field2=" + String(moisturePct, 1);
  url += "&field3=" + String(plantId);
  url += "&field4=" + String(status);

  Serial.println(F("[ThingSpeak] Sending telemetry to channel..."));
  http.begin(client, url);
  int httpCode = http.GET();

  bool success = false;
  if (httpCode > 0) {
    String payload = http.getString();
    // ThingSpeak returns the Entry ID (> 0) on success, or "0" if throttled/failed
    if (httpCode == 200 && payload.toInt() > 0) {
      Serial.print(F("[ThingSpeak] SUCCESS! Feed Entry ID: "));
      Serial.println(payload);
      success = true;
    } else {
      Serial.print(F("[ThingSpeak] Update rejected by server. HTTP Code: "));
      Serial.print(httpCode);
      Serial.print(F(", Response: "));
      Serial.println(payload);
      if (payload == "0") {
        Serial.println(F("[ThingSpeak] Rate limit hit: Ensure minimum 15 seconds between updates."));
      }
    }
  } else {
    Serial.print(F("[ThingSpeak] HTTP request failed, error: "));
    Serial.println(http.errorToString(httpCode));
  }

  http.end();
  digitalWrite(LED_PIN, HIGH); // LED off
  return success;
}
