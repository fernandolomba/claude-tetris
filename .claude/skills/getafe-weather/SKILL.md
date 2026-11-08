---
name: getafe-weather
description: Da las condiciones climáticas actuales de Getafe (temperatura, humedad, sensación térmica, nubosidad y velocidad del viento) y la previsión de los 3 próximos días. Úsala cuando el usuario pregunte por el tiempo, la temperatura o el viento en Getafe.
---

# Clima de Getafe

Cuando se invoque esta skill:

1. Obtén los datos de la API de Open-Meteo (sin clave) con `curl`:

   ```bash
   curl -s "https://api.open-meteo.com/v1/forecast?latitude=40.3083&longitude=-3.7327&current=temperature_2m,relative_humidity_2m,apparent_temperature,cloud_cover,wind_speed_10m,wind_direction_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=4&timezone=Europe%2FMadrid"
   ```

2. Responde de forma breve con las condiciones actuales (`current`):
   - **Temperatura** (y sensación térmica)
   - **Humedad**
   - **Nubosidad** (% y estado del cielo según `weather_code`)
   - **Velocidad del viento** (km/h) y dirección (convierte los grados a puntos cardinales)
3. Añade una sección **Próximos 3 días** con una línea por día usando `daily`, saltando el primer elemento (hoy): fecha, mínima y máxima, estado del cielo según `weather_code` y probabilidad máxima de precipitación.
4. Indica la hora del dato (`current.time`); la API se actualiza cada 15 minutos, así que lecturas seguidas pueden repetirse.
5. Cita la fuente como enlace markdown: [Open-Meteo](https://open-meteo.com/).

Códigos `weather_code` (WMO): 0 despejado, 1-3 poco nuboso/parcialmente nuboso/cubierto, 45-48 niebla, 51-57 llovizna, 61-67 lluvia, 71-77 nieve, 80-82 chubascos, 95-99 tormenta.
