# Depuración: el frontend no muestra la señal del sensor (A0 / temp)

## 1. Basura en el Monitor Serial (ya corregido)

Los caracteres `...` aparecen cuando el **baud del Monitor Serial no coincide** con el del firmware.

- **Firmware:** está en **9600** (ajustado para que coincida con tu monitor).
- En Arduino IDE: **Herramientas → Monitor Serial** y elegir **9600 baud**.
- Si cambias a 115200 en el firmware, pon también 115200 en el monitor.

Tras corregir el baud deberías ver líneas como:
```text
Conectando a WiFi.....
WiFi OK
Intentando conexión MQTT... ¡Conectado!
Publicado: home/esp8266/out/temp = 512
```

Si ves `Publicado: home/esp8266/out/temp = ...` cada ~5 s, el ESP está publicando bien.

---

## 2. Checklist para que el sensor se vea en el frontend

### A) Widget en la app

El dispositivo debe tener un widget de tipo **Viewer** con **Topic ID exactamente** `temp` (como en el firmware).

- Edita el dispositivo "esp8266" (icono lápiz).
- Comprueba que hay un widget:
  - **Tipo:** Viewer  
  - **Topic ID:** `temp`  
  - **Label:** ej. "Señal A0"
- Min/Max: por ejemplo 0 y 1023 (ADC crudo). Guarda.

Si ese widget no existe, la app no tiene dónde mostrar el valor aunque el backend reciba los mensajes.

### B) Backend recibe MQTT

Con el backend en marcha, en la terminal donde corre Node deberías ver cada ~5 s algo como:

```text
[MQTT] home/esp8266/out/temp → 512
```

- Si **no** aparece: el broker no está recibiendo el mensaje o el backend no está suscrito (revisa que el dispositivo con `baseTopic: "home/esp8266"` exista en la app y que el backend se haya conectado al broker tras arrancar).
- Si **sí** aparece: el backend recibe y reenvía por WebSocket; el fallo estaría en frontend o en la configuración del widget.

### C) WebSocket conectado

En la barra de la app debe salir **"Conectado"** (punto verde). Si sale **"Desconectado"**, el frontend no recibe los eventos `device:data`.

### D) Consola del navegador (opcional)

En DevTools → Console no deberían aparecer errores de Socket.io. Si quieres ver los datos que llegan, en `SocketContext.tsx` puedes añadir temporalmente un `console.log` dentro del `socket.on("device:data", ...)` para ver `baseTopic`, `topicId` y `value`.

---

## 3. Resumen rápido

| Paso | Qué comprobar |
|------|----------------|
| 1 | Monitor Serial a **9600** y ver "Publicado: .../out/temp = ..." |
| 2 | Dispositivo en la app tiene widget **Viewer** con **topicId: `temp`** |
| 3 | Terminal del backend muestra "[MQTT] home/esp8266/out/temp → ..." |
| 4 | Navbar de la app muestra **Conectado** |

Si 1, 2, 3 y 4 están bien, el valor del sensor debería verse en el viewer.
