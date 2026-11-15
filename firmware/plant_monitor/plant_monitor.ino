// ============================================
// Smart Plant Care System — ESP8266 Firmware
// ============================================
// Reads soil moisture sensor, calibrates to percentage,
// and reports to ThingSpeak at a configurable interval.
// ============================================

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include "config.h"

// --- Sensor Status Codes (sent to ThingSpeak Field 4) ---
#define STATUS_BOOT        0
#define STATUS_NORMAL      1
#define STATUS_OUT_OF_RANGE 2

// --- State Variables ---
unsigned long lastReportTime = 0;
bool isFirstReading = true;

// --- ThingSpeak API endpoint ---
const char* THINGSPEAK_API_URL = "http://api.thingspeak.com/update";

void setup() {
    Serial.begin(115200);
    delay(100);

    Serial.println();
    Serial.println(F("=============================="));
    Serial.println(F("Smart Plant Care - Soil Monitor"));
    Serial.println(F("=============================="));

    // Connect to WiFi
    connectWiFi();

    Serial.print(F("Calibration: AIR="));
    Serial.print(ADC_AIR_VALUE);
    Serial.print(F(" WATER="));
    Serial.println(ADC_WATER_VALUE);
    Serial.print(F("Report interval: "));
    Serial.print(REPORT_INTERVAL_MS / 1000);
    Serial.println(F("s"));
    Serial.print(F("Active Plant ID: "));
    Serial.println(ACTIVE_PLANT_ID);
}

void loop() {
    // Ensure WiFi stays connected (non-blocking reconnect)
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println(F("[WiFi] Connection lost — reconnecting..."));
        connectWiFi();
    }

    unsigned long now = millis();

    // Report on the configured interval (or immediately on boot)
    if (isFirstReading || (now - lastReportTime >= REPORT_INTERVAL_MS)) {
        lastReportTime = now;
        isFirstReading = false;

        // 1. Read and average the ADC
        int rawADC = readAveragedADC();

        // 2. Calibrate to moisture percentage
        float moisturePct = calibrateToPercentage(rawADC);

        // 3. Determine sensor status
        int sensorStatus = STATUS_NORMAL;
        if (moisturePct < 0.0 || moisturePct > 100.0) {
            sensorStatus = STATUS_OUT_OF_RANGE;
            // Clamp for display, but flag the issue
            moisturePct = constrain(moisturePct, 0.0, 100.0);
        }

        // 4. Log to Serial
        Serial.print(F("[Sensor] Raw ADC: "));
        Serial.print(rawADC);
        Serial.print(F("  Moisture: "));
        Serial.print(moisturePct, 1);
        Serial.print(F("%  Status: "));
        Serial.println(sensorStatus);

        // 5. Send to ThingSpeak
        bool sent = sendToThingSpeak(rawADC, moisturePct, ACTIVE_PLANT_ID, sensorStatus);
        if (sent) {
            Serial.println(F("[ThingSpeak] Data sent successfully."));
        } else {
            Serial.println(F("[ThingSpeak] Failed to send data."));
        }
    }
}

// --- WiFi Connection (blocking on boot, non-blocking check in loop) ---
void connectWiFi() {
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    Serial.print(F("[WiFi] Connecting to "));
    Serial.print(WIFI_SSID);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 40) {
        delay(500);
        Serial.print(F("."));
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println();
        Serial.print(F("[WiFi] Connected! IP: "));
        Serial.println(WiFi.localIP());
    } else {
        Serial.println();
        Serial.println(F("[WiFi] Connection failed. Will retry on next loop."));
    }
}

// --- ADC Oversampling & Averaging ---
int readAveragedADC() {
    long sum = 0;
    for (int i = 0; i < ADC_SAMPLE_COUNT; i++) {
        sum += analogRead(A0);
        delay(ADC_SAMPLE_DELAY_MS);
    }
    return (int)(sum / ADC_SAMPLE_COUNT);
}

// --- Calibration: Map ADC to Moisture Percentage ---
// Most soil sensors output HIGHER ADC in dry air, LOWER in water.
// moisture% = (ADC_air - ADC_reading) / (ADC_air - ADC_water) * 100
float calibrateToPercentage(int rawADC) {
    if (ADC_AIR_VALUE == ADC_WATER_VALUE) {
        // Avoid division by zero with identical calibration values
        return 0.0;
    }
    float pct = ((float)(ADC_AIR_VALUE - rawADC) / (float)(ADC_AIR_VALUE - ADC_WATER_VALUE)) * 100.0;
    return pct;
}

// --- Send Data to ThingSpeak ---
bool sendToThingSpeak(int rawADC, float moisturePct, int plantId, int status) {
    if (WiFi.status() != WL_CONNECTED) {
        return false;
    }

    WiFiClient client;
    HTTPClient http;

    // Build the URL with query parameters
    String url = String(THINGSPEAK_API_URL);
    url += "?api_key=" + String(THINGSPEAK_WRITE_API_KEY);
    url += "&field1=" + String(rawADC);
    url += "&field2=" + String(moisturePct, 1);
    url += "&field3=" + String(plantId);
    url += "&field4=" + String(status);

    http.begin(client, url);
    int httpCode = http.GET();
    http.end();

    // ThingSpeak returns the entry ID on success (> 0), or 0 on failure
    return (httpCode == 200);
}
