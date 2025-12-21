import mqtt from 'mqtt';
import { MosquittoCentralService } from './mosquitto-central';
import { HouseDataAccess, SensorDataAccess } from '../schemas';
import { CentralProperty, Estado, SensorProperty } from '../interfaces';
import { MosquittoSensorService } from './mosquitto-sensor';
import { emitDataSockets } from '../server';
import { capitalize } from 'lodash';
import { AlarmArming, Topic } from '../interfaces/websockets-transfers';

/** Clase que gestiona la conexión ``MQTT`` y maneja la subscripción y publicación a tópicos. */
export class MosquittoAccess {
  private mqttCentralService = new MosquittoCentralService(this.houseModel);
  private mqttSensorService = new MosquittoSensorService(this.sensorModel);
  private baseAlarmArmingSocket = process.env.WS_ALARM_ARMING ?? '';
  private mqttUrl = process.env.MQTT_URL ?? '';
  private baseTopic = process.env.TOPIC_BASE ?? '';
  private client = mqtt.connect(
    this.mqttUrl, { username: process.env.MQTT_USERNAME, password: process.env.MQTT_PASS }
  );

  constructor (private houseModel: HouseDataAccess, private sensorModel: SensorDataAccess) {}

  /** Conecta al servidor MQTT y suscribe a los tópicos. */
  connect () {
    this.client.on('connect', () => {
      // Subscripción a todos los tópicos de la app.
      this.client.subscribe(`${this.baseTopic}/#`, (err) => {
        if (!err) {
          console.log(`Suscrito a ${this.baseTopic}/#`);
          this.client.publish('alarmas/conexion', 'Server conectado');
        } else {
          console.error('Error al suscribirse:', err);
        }
      });
    });

    // Manejo de mensajes recibidos.
    this.client.on('message', async (topic, message) => {
      const messageText = message.toString().trim();
      console.log({ mensaje: messageText, topico: topic });
			
      const topicArray = topic.split('/');
      const username = topicArray[1];
      const houseName = topicArray[2];

      /*
      ** Array de 4 partes implica apuntar a la central:
      ** "alarmas/usuario_1/casa_1/alarmaEncendida"
      */
      if (topicArray.length === 4) {
        const messageArray = messageText.split(':');
        const state = capitalize(messageArray[0].trim());
        const excludedSensors = this.extractSensors(messageArray[1]);
        const centralProp = topicArray[3] as CentralProperty;

        switch (centralProp) {
          case 'alarmaEncendida':
            if (state !== Estado.ENCENDIDO && state !== Estado.APAGADO) {
              console.log(`Mensaje de activación incorrento: ${state}`);
              return;
            }
            this.sendArmingInfo(username, state as Estado, excludedSensors, houseName);
            break;
          default:
            console.error('Propiedad de central no válida: ', centralProp);
            break;
        }

        /*
        ** Array de 5 partes implica apuntar a un sensor:
        ** "alarmas/usuario_1/casa_1/sensores/(estado || activado)"
        ** estado --> 1,("On" | "Off")
        ** activado --> 1
        */
      } else if (topicArray.length === 5) {
        const sensorProp = topicArray[4] as SensorProperty;

        switch (sensorProp) {
          case 'activado':
            this.mqttSensorService.updateHistory(username, houseName, messageText);
            break;
          default:
            console.error('Propiedad de sensor no válida: ', sensorProp);
            break;
        }
      } else {
        console.log('Formato de tópico incorrecto 2');
      }
    });
  }

  /** Envía mensaje de error a través de ``websockets``, sobre el canal `error`. */
  sendSocketError (event: Topic, message: string) {
    emitDataSockets('error', { event, message });
  }

  /** Publica mensaje `MQTT` a Mosquitto en el tópico indicado. */
  publicMessage (topic: Topic, message: string, userName: string, houseName: string) {
    let topicMQTT = '';

    switch (topic) {
      case 'alarmActivation':
        topicMQTT = `${this.baseTopic}/${userName}/${houseName}/alarmaEncendida`;
        break;
      default:
        console.log('Error: Tópico MQTT incorrecto.');
        break;
    }

    this.client.publish(topicMQTT, message);
  }

  /** Envía información `websockets` al usuario y carga datos en la `DB`. */
  private sendArmingInfo (
    username: string, isActive: Estado, excludedSensors: string[], houseName: string
  ) {
    const eventSocket = `${this.baseAlarmArmingSocket}/${username}/${houseName}`;
    const alarmArmingInfo: AlarmArming = { state: isActive, excludedSensors };

    emitDataSockets(eventSocket, alarmArmingInfo);

    void this.mqttCentralService.updateState(username, houseName, alarmArmingInfo);
  }

  /** Extrae los números de sensor y arma un array con ellos. */
  private extractSensors (sensors: string): string[] {
    const arraySensors = sensors?.split(',') || [];
    return arraySensors.map(sensor => sensor.trim());
  }
}
