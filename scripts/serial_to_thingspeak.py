#!/usr/bin/env python3
"""
=============================================================================
Smart Plant Care System — USB Serial to ThingSpeak Live Forwarder
=============================================================================
If your ESP8266 / Arduino is plugged into your PC via USB cable and prints
sensor data to the Serial port, this script reads the serial stream and
automatically pushes each reading live to your ThingSpeak channel.

Requirements:
    pip install pyserial requests

Usage:
    python scripts/serial_to_thingspeak.py <COM_PORT> <THINGSPEAK_WRITE_API_KEY>

Example (Windows):
    python scripts/serial_to_thingspeak.py COM3 ABC123WRITEKEY

Expected Serial Output Formats from Arduino/ESP8266 (any of these work):
    1. Single number: "512" (raw ADC value)
    2. Comma-separated: "512, 65.4" (raw ADC, moisture percentage)
    3. JSON: {"raw_adc": 512, "moisture_pct": 65.4}
=============================================================================
"""

import sys
import time
import json
import re

try:
    import serial
    import requests
except ImportError:
    print("\n❌ Missing required python packages.")
    print("Please install them with: pip install pyserial requests\n")
    sys.exit(1)

if len(sys.argv) < 3:
    print("\nUsage:")
    print("    python scripts/serial_to_thingspeak.py <COM_PORT> <THINGSPEAK_WRITE_API_KEY>\n")
    print("Example (Windows):")
    print("    python scripts/serial_to_thingspeak.py COM3 YOUR_WRITE_KEY\n")
    sys.exit(1)

port = sys.argv[1]
write_key = sys.argv[2]
baud_rate = 115200
last_upload_time = 0
MIN_UPLOAD_INTERVAL_SEC = 20  # ThingSpeak free tier requires >= 15 seconds

print("=" * 65)
print(" 🌱 Serial-to-ThingSpeak Live Forwarder Active")
print("=" * 65)
print(f"Serial Port:      {port} @ {baud_rate} baud")
print(f"Min Interval:     {MIN_UPLOAD_INTERVAL_SEC}s")
print(f"ThingSpeak Key:   {write_key[:4]}...{write_key[-4:]}")
print("Press Ctrl+C to stop.\n")

try:
    ser = serial.Serial(port, baud_rate, timeout=2)
    time.sleep(2)  # Wait for serial connection to stabilize
    print(f"✅ Connected to {port}. Listening for live sensor data...\n")
except Exception as e:
    print(f"❌ Failed to open serial port {port}: {e}")
    sys.exit(1)

def parse_line(line_str):
    """Extract raw ADC and moisture percentage from a serial line."""
    line_str = line_str.strip()
    if not line_str:
        return None, None

    # Check if JSON
    if line_str.startswith("{") and line_str.endswith("}"):
        try:
            data = json.loads(line_str)
            raw = data.get("raw_adc") or data.get("adc") or data.get("raw")
            moist = data.get("moisture_pct") or data.get("moisture") or data.get("pct")
            return float(raw) if raw is not None else None, float(moist) if moist is not None else None
        except Exception:
            pass

    # Check for numbers in comma-separated string
    numbers = re.findall(r"[-+]?\d*\.\d+|\d+", line_str)
    if len(numbers) >= 2:
        return float(numbers[0]), float(numbers[1])
    elif len(numbers) == 1:
        raw_val = float(numbers[0])
        # Auto-compute percentage using standard 820 air -> 380 water calibration
        moist_pct = max(0.0, min(100.0, ((820.0 - raw_val) / (820.0 - 380.0)) * 100.0))
        return raw_val, round(moist_pct, 1)

    return None, None

try:
    while True:
        if ser.in_waiting > 0:
            raw_line = ser.readline().decode("utf-8", errors="ignore").strip()
            if not raw_line:
                continue

            print(f"[Serial IN] {raw_line}")
            adc, moisture = parse_line(raw_line)

            if adc is not None and moisture is not None:
                now = time.time()
                elapsed = now - last_upload_time

                if elapsed < MIN_UPLOAD_INTERVAL_SEC:
                    wait_remaining = int(MIN_UPLOAD_INTERVAL_SEC - elapsed)
                    print(f"    ⏳ Waiting {wait_remaining}s before next ThingSpeak post (rate limit)...")
                    continue

                last_upload_time = now
                url = "https://api.thingspeak.com/update"
                params = {
                    "api_key": write_key,
                    "field1": int(adc),
                    "field2": round(moisture, 1),
                    "field3": 1,  # Plant ID 1 = Tomato
                    "field4": 1   # Status 1 = Normal
                }

                try:
                    res = requests.get(url, params=params, timeout=10)
                    if res.status_code == 200 and int(res.text) > 0:
                        print(f"    🚀 SUCCESS! Posted Entry #{res.text} -> ADC: {int(adc)}, Moisture: {round(moisture, 1)}%\n")
                    else:
                        print(f"    ⚠️ ThingSpeak rejected: HTTP {res.status_code}, Response: {res.text}\n")
                except Exception as ex:
                    print(f"    ❌ Network error sending to ThingSpeak: {ex}\n")

        time.sleep(0.1)

except KeyboardInterrupt:
    print("\nStopping forwarder...")
finally:
    ser.close()
