# Soil Moisture Sensor — Calibration Guide

## Why Calibrate?

The raw ADC values from the ESP8266 analog pin (0-1024) are meaningless on their own. Different sensors, wiring, voltage sources, and soil types produce different ranges. Calibration maps YOUR sensor's specific readings to 0%-100% moisture.

## Calibration Procedure

### Step 1: Dry Air Reading (0% Moisture)

1. Power on the NodeMCU with the sensor connected.
2. Hold the sensor in **dry open air** (not touching anything).
3. Open the Serial Monitor (115200 baud) in Arduino IDE.
4. Note the **Raw ADC** value reported. This is your `ADC_AIR_VALUE`.
5. Record several readings and take the average.

**Example:** Raw ADC in air = `823`

### Step 2: Full Water Reading (100% Moisture)

1. Place the sensor probe in a **glass of water** up to the marked line.
2. Wait 5-10 seconds for the reading to stabilize.
3. Note the **Raw ADC** value. This is your `ADC_WATER_VALUE`.
4. Record several readings and take the average.

**Example:** Raw ADC in water = `340`

### Step 3: Update config.h

Open `firmware/plant_monitor/config.h` and update:

```cpp
const int ADC_AIR_VALUE = 823;    // Your measured dry-air reading
const int ADC_WATER_VALUE = 340;  // Your measured water-submerged reading
```

### Step 4: Verify

1. Re-upload the firmware to the NodeMCU.
2. Test in air — should read ~0%.
3. Test in water — should read ~100%.
4. Test in moist soil — should read somewhere in between.

## Calibration Formula

```
Moisture % = (ADC_AIR - ADC_READING) / (ADC_AIR - ADC_WATER) x 100
```

Clamped to 0%-100%.

## Tips

- Calibrate in the same conditions you'll use for monitoring (same power source, same wiring length).
- The sensor may drift slightly over weeks — recalibrate periodically for precision.
- If readings seem inverted (100% in air), your sensor may have reversed polarity — swap `ADC_AIR_VALUE` and `ADC_WATER_VALUE`.
