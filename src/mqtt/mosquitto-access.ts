import mqtt from 'mqtt';
import { Estado, MQTTtopicHandler } from '../interfaces';
import { capitalize } from 'lodash';
import { HouseAction, WarningType } from '../interfaces/websockets.interfaces';
import { extractSensors } from './utils';
import { MosquittoEventDispatcher } from './mosquitto-event-dispatcher';

/** Clase que gestiona la conexión ``MQTT`` y maneja la subscripción y publicación a tópicos. */
export class MosquittoAccess {
  private dispatcher!: MosquittoEventDispatcher;
  private url = process.env.MQTT_URL ?? '';
  private baseTopic = process.env.MQTT_BASE_TOPIC ?? '';
  private client = mqtt.connect(
    this.url, { username: process.env.MQTT_USERNAME, password: process.env.MQTT_PASS }
  );

  private topicHandlers: MQTTtopicHandler[] = [
    {
      prefix: 'alarmas/eventos/armado/',
      handler: this.armingHandler.bind(this)
    },
    {
      prefix: 'alarmas/eventos/disparo/',
      handler: this.triggerHandler.bind(this)
    },
    {
      prefix: 'alarmas/luces/',
      handler: this.lightsHandler.bind(this)
    }
  ];

  /** Asigna el despachador de eventos de Mosquitto para la clase MosquittoAccess. */
  setDispatcher (dispatcher: MosquittoEventDispatcher) {
    this.dispatcher = dispatcher;
  }

  /** Conecta al servidor MQTT y suscribe a los tópicos. */
  connect () {
    this.client.on('connect', () => {
      // Subscripción a todos los tópicos de la app.
      this.client.subscribe(`${this.baseTopic}/#`, (err) => {
        if (!err) {
          console.log(`Suscrito a ${this.baseTopic}/#`);
        } else {
          console.error('Error al suscribirse:', err);
        }
      });
    });

    // Manejo de mensajes recibidos.
    this.client.on('message', async (topic, message) => {
      const payload = message.toString().trim();
      console.log({ topico: topic, mensaje: payload });

      const topicHandler = this.topicHandlers.find(th => topic.startsWith(th.prefix));
      if (!topicHandler) {
        console.log('No existe Handler para el tópico:', topic);
        return;
      }

      topicHandler.handler(topic, payload);
    });
  }

  /** Publica mensaje `MQTT` a Mosquitto en el tópico indicado. */
  publicMessage (houseAction: HouseAction, message: string, username: string, houseName: string) {
    let topic = '';

    switch (houseAction) {
      case HouseAction.SET_ARMED_STATE:
        topic = `${this.baseTopic}/eventos/armado/${username}/${houseName}`;
        break;
      case HouseAction.TRIGGER_ALARM:
        topic = `${this.baseTopic}/eventos/disparo/${username}/${houseName}`;
        break;
      case HouseAction.SET_LIGHTS:
        topic = `${this.baseTopic}/luces/${username}/${houseName}`;
        break;
      default:
        console.log('Error: Tópico MQTT incorrecto.');
        break;
    }

    if (!topic) return;

    this.client.publish(topic, message);
  }

  private armingHandler (topic: string, payload: string) {
    const [,,, username, houseName] = topic.split('/');
    const [stateText, sensors] = payload.split(':');
    const state = capitalize(stateText?.trim());
    const excludedSensors = extractSensors(sensors);

    if (state !== Estado.ENCENDIDO && state !== Estado.APAGADO) {
      console.log(`Mensaje de activación incorrento: ${state}`);
      this.dispatcher.onWarning(username, WarningType.DEVICE_STATE);
      return;
    }
    
    this.dispatcher.onAlarmArming(username, houseName, state as Estado, excludedSensors);
  }
  
  private lightsHandler (topic: string, payload: string) {
    const [,, username, houseName] = topic.split('/');
    const [sector, stateText] = payload.split(':');
    const state = capitalize(stateText?.trim());
    
    if (state !== Estado.ENCENDIDO && state !== Estado.APAGADO) {
      console.log(`Mensaje de activación incorrento: ${state}`);
      this.dispatcher.onWarning(username, WarningType.LIGHTS_STATE);
      return;
    }

    this.dispatcher.onLightsChange(username, houseName, sector, state as Estado);
  }

  private triggerHandler (topic: string, payload: string) {
    const [,,, username, houseName] = topic.split('/');
    const [stateText, sensor] = payload.split(':');
    const state = capitalize(stateText?.trim());
    const sensorNumber = Number(sensor?.trim()) ? Number(sensor?.trim()) : null;

    if (state !== Estado.ENCENDIDO && state !== Estado.APAGADO) {
      console.log(`Mensaje de disparo incorrecto: ${state}`);
      this.dispatcher.onWarning(username, WarningType.TRIGGER_ALARM);
      return;
    }

    this.dispatcher.onTriggered(username, houseName, state as Estado, sensorNumber);
  }
}
