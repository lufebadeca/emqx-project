/*
 * EMQ IoT — ESP8266: LED PWM (D6) + lectura analógica (A0)
 * Un solo dispositivo en la app: widget slider (led1) + widget viewer (temp).
 *
 * Configura en la app:
 * - Dispositivo baseTopic: home/esp8266
 * - Widget 1: Slider, topicId led1, min 0, max 255
 * - Widget 2: Viewer, topicId temp, min 0, max 1023 (o la escala que uses)
 */

#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// --- CONFIGURACIÓN ---
const char* WIFI_SSID     = "Epicentro Tech";
const char* WIFI_PASS     = "Epicentro Tech01";
const char* MQTT_HOST     = "192.168.1.53";
const uint16_t MQTT_PORT  = 1883;
const char* BASE_TOPIC    = "home/esp8266";

// Pin LED con PWM (D6 = GPIO12 en NodeMCU/ESP8266)
// LED: no quitar la resistencia. 3.3V con R ~220–330 Ohm es seguro y da buena luz.
#define LED_PIN 12

WiFiClient espClient;
PubSubClient mqtt(espClient);

void reconnect() {
  while (!mqtt.connected()) {
    Serial.print("Intentando conexión MQTT...");
    if (mqtt.connect("esp8266-control")) {
      Serial.println(" ¡Conectado!");
      String subTopic = String(BASE_TOPIC) + "/in/#";
      mqtt.subscribe(subTopic.c_str());
    } else {
      Serial.print(" falló, rc=");
      Serial.print(mqtt.state());
      Serial.println(" reintentando en 5 segundos");
      delay(5000);
    }
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String t(topic);
  int idx = t.lastIndexOf("/in/");
  if (idx == -1) return;
  String topicId = t.substring(idx + 4);

  char value[16];
  for (unsigned int i = 0; i < length && i < 15; i++) value[i] = (char)payload[i];
  value[length < 15 ? length : 15] = '\0';

  Serial.printf("Comando recibido: [%s] -> %s\n", topicId.c_str(), value);

  if (topicId == "led1") {
    int v = atoi(value);
    if (v < 0) v = 0;
    if (v > 255) v = 255;
    analogWrite(LED_PIN, v);
  }
}

void setup() {
  // Usa 9600 en el Monitor Serial; si cambias aquí, cambia también en la herramienta.
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);
  analogWrite(LED_PIN, 0);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi OK");

  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  mqtt.setCallback(mqttCallback);
}

void loop() {
  if (!mqtt.connected()) {
    reconnect();
  }
  mqtt.loop();

  // Publicar señal analógica A0 cada 5 segundos
  static unsigned long lastPub = 0;
  if (millis() - lastPub > 5000) {
    lastPub = millis();
    char buf[8];
    sprintf(buf, "%d", analogRead(A0));
    String pubTopic = String(BASE_TOPIC) + "/out/temp";
    mqtt.publish(pubTopic.c_str(), buf);
    Serial.printf("Publicado: %s = %s\n", pubTopic.c_str(), buf);
  }
}
