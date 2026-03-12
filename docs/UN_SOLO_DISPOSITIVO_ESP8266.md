# Un solo dispositivo en la app: LED + señal analógica (y PWM)

## Respuesta corta

**Sí:** puedes manejar el LED (o un slider de intensidad) y la lectura de la señal analógica con **un solo dispositivo** en la app. Un dispositivo = un `baseTopic` (un ESP). Cada **widget** es un canal: salida (switch/slider) o entrada (viewer).

---

## 1. Señal analógica (solo lectura) en el mismo dispositivo

Tu firmware ya publica en:

- `home/esp8266/out/temp` → valor de `analogRead(A0)` cada 5 s.

En la app solo tienes que **añadir un segundo widget** al dispositivo "esp8266":

1. Editar el dispositivo (icono lápiz).
2. Agregar widget:
   - **Tipo:** Viewer (solo lectura).
   - **Label:** p. ej. "Señal A0" o "Tensión".
   - **Topic ID:** `temp` (igual que en el firmware).
   - **Min / Max:** p. ej. 0 y 1023 (ADC crudo) o 0 y 100 (porcentaje). Opcional para escala visual.

No hace falta cambiar backend ni frontend: el backend ya está suscrito a `home/esp8266/out/#` y cuando llega algo en `out/temp` actualiza el widget con `topicId: "temp"` y reenvía por WebSocket al dashboard.

---

## 2. Resumen del modelo en la app

| Widget   | Tipo    | Topic ID | Dirección MQTT                    | Uso en el ESP                          |
|----------|---------|----------|-----------------------------------|----------------------------------------|
| LED      | Switch  | `led1`   | In: `.../in/led1` (comandos)      | Recibe 0/1, `digitalWrite` o PWM       |
| LED PWM  | Slider  | `led1`   | In: `.../in/led1` (comandos)      | Recibe 0–255, `analogWrite` en D6      |
| Señal A0 | Viewer  | `temp`   | Out: `.../out/temp` (telemetría)  | Publicas `analogRead(A0)` cada X seg   |

Un mismo dispositivo puede tener varios widgets; cada uno se identifica por `topicId` y puede ser entrada (viewer) o salida (switch/slider).

---

## 3. Pasar el LED a slider (PWM en D6)

Si quieres controlar intensidad con un slider en la app:

- **App:** en el dispositivo "esp8266", cambia el widget del LED de **Switch** a **Slider**, topicId sigue siendo `led1`, **Min: 0**, **Max: 255**.
- **Firmware:** en el callback MQTT, para `led1` usar `analogWrite(PIN_LED, valor)` con valor 0–255 (y el LED en D6).

Ejemplo en el callback (sustituir el bloque de `led1`):

```cpp
if (topicId == "led1") {
  int v = atoi(value);
  v = constrain(v, 0, 255);
  analogWrite(LED_BUILTIN, v);  // D6 en ESP8266, PWM
}
```

Y asegurar que el pin sea el que soporta PWM (p. ej. D6 = GPIO12 en ESP8266).

---

## 4. Firmware de referencia (LED PWM + lectura A0)

En la carpeta `firmware/` tienes un ejemplo completo que:

- Controla un LED por PWM en D6 con topicId `led1` (slider 0–255).
- Publica la señal analógica A0 en `out/temp` cada 5 s.

Mismo dispositivo en la app: un widget **slider** para `led1` y un widget **viewer** para `temp`.
