# ESP8266 NodeMCU — Wiring Guide

## Components Required
- 1x ESP8266 NodeMCU (v2 or v3)
- 1x Soil Moisture Sensor (Capacitive v1.2 recommended, or resistive fork sensor)
- 1x USB Micro-B cable (for power and programming)
- Jumper wires (3x Female-to-Female or Female-to-Male depending on sensor)

## Pin Connections

| Sensor Pin | NodeMCU Pin | Wire Colour (suggestion) | Notes |
|:-----------|:------------|:------------------------|:------|
| **VCC**    | **3V3**     | Red                     | Use 3.3V ONLY. Do NOT use Vin (5V) — the ESP8266 ADC accepts max 3.3V on NodeMCU boards. |
| **GND**    | **GND**     | Black                   | Any GND pin on the NodeMCU. |
| **AOUT** (Analog Out) | **A0** | Yellow / Blue | Analog signal pin. The only analog input on ESP8266. |

## Wiring Diagram

```
    Soil Moisture Sensor          ESP8266 NodeMCU
    +------------------+          +------------------+
    |  VCC  -------------------------------- 3V3     |
    |  GND  -------------------------------- GND     |
    |  AOUT -------------------------------- A0      |
    +------------------+          +------------------+
```

## Important Notes

1. **Voltage Warning:** The ESP8266 NodeMCU has a built-in voltage divider on the A0 pin that accepts 0-3.3V input. Feeding 5V to a sensor that outputs >3.3V on its analog pin can damage the ADC or produce clipped readings. Always power from the 3V3 pin.

2. **Capacitive vs. Resistive Sensors:**
   - **Capacitive v1.2:** More durable, corrosion-resistant, longer lifespan. Recommended.
   - **Resistive Fork:** Cheaper but corrodes over time. Works fine for short demos.

3. **Sensor Insertion:** Push the sensor into the soil up to the marked line (if present). The exposed electronic components at the top must stay above soil level.

4. **USB Power:** The NodeMCU is powered via its Micro-USB port. A phone charger or computer USB port works fine. No external power supply is needed for the sensor since it draws minimal current from 3V3.
