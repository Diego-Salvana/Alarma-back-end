import mqtt from 'mqtt';
import { MosquittoCentralService } from './mosquitto-central';
import { HouseDataAccess, SensorDataAccess } from '../schemas';
import { CentralProperty, Estado, SensorProperty } from '../interfaces';
import { MosquittoSensorService } from './mosquitto-sensor';
import { emitDataSockets } from '../server';
import { capitalize } from 'lodash';
import { AlarmActivation, Topic } from '../interfaces/websockets-transfers';

export class MosquittoAccess {
  private mqttCentralService = new MosquittoCentralService(this.houseModel);
  private mqttSensorService = new MosquittoSensorService(this.sensorModel);
  private mqttUrl = process.env.MQTT_URL ?? '';
  private baseTopic = process.env.TOPIC_BASE ?? '';
  private client = mqtt.connect(
    this.mqttUrl, { username: process.env.MQTT_USERNAME, password: process.env.MQTT_PASS }
  );

  private baseActivationEventSocket = 'alarmaEncendida';

  constructor (private houseModel: HouseDataAccess, private sensorModel: SensorDataAccess) {}

  connect () {
    this.client.on('connect', () => {
      // Suscripción a tópicos
      this.client.subscribe(`${this.baseTopic}/#`, (err) => {
        if (!err) {
          console.log(`Suscrito a ${this.baseTopic}/#`);
         
          this.client.publish('alarmas/conexion', 'Server conectado');
        } else {
          console.error('Error al suscribirse:', err);
        }
      });
    });

    this.client.on('message', async (topic, message) => {
      const messageText = message.toString().trim();
      console.log({ mensaje: messageText, topico: topic });
			
      const topicArray = topic.split('/');
      const userName = topicArray[1];
      const houseName = topicArray[2];

      /* Array de 4 partes implica apuntar a la central "alarmas/usuario_1/casa_1/(alarmaEncendida)" */
      if (topicArray.length === 4) {
        const messageArray = messageText.split('/');
        const state = capitalize(messageArray[0].trim());
        const excludedSensors = this.extractSensors(messageArray[1]);
        const centralProp = topicArray[3] as CentralProperty;

        switch (centralProp) {
          case 'alarmaEncendida':
            if (state !== Estado.ENCENDIDO && state !== Estado.APAGADO) {
              console.log(`Mensaje de activación incorrento: ${state}`);
              return;
            }

            this.sendActivationInfo(userName, state as Estado, excludedSensors, houseName);
            break;
          default:
            console.error('Propiedad de central no válida: ', centralProp);
            break;
        }

        /*
				Array de 5 partes implica apuntar a un sensor "alarmas/usuario_1/casa_1/sensores/(estado || activado)"
				estado --> mensaje: 1,"On" | "Off"
				activado --> mensaje: 1
			*/
      } else if (topicArray.length === 5) {
        const sensorProp = topicArray[4] as SensorProperty;

        switch (sensorProp) {
          case 'estado':
            // updateSensorState(userName, houseName, sensorNumber, messageText);
            break;
          case 'activado':
            this.mqttCentralService.setActivation(userName, houseName, messageText);
            this.mqttSensorService.updateHistory(userName, houseName, messageText);
            break;
          default:
            break;
        }
      } else {
        console.log('Formato de tópico incorrecto 2');
      }
    });
  }

  sendSocketError (event: Topic, message: string) {
    emitDataSockets('error', { event, message });
  }

  /** Publica mensaje a Mosquitto en el tópico indicado. */
  publicMessage (topic: Topic, message: string, userName: string, houseName: string) {
    let topicMQTT: string;

    switch (topic) {
      case 'alarmActivation':
        topicMQTT = `${this.baseTopic}/${userName}/${houseName}/alarmaEncendida`;
        this.client.publish(topicMQTT, message);
        break;
      default:
        console.log('Error: Tópico MQTT incorrecto.');
        break;
    }
  }

  /** Envía información `websockets` al usuario y carga datos en la `DB`. */
  private sendActivationInfo (
    userName: string, isActive: Estado, excludedSensors: string[], houseName: string
  ) {
    const eventSocket = `${this.baseActivationEventSocket}/${userName}`;
    const activationInfo: AlarmActivation = {
      state: isActive,
      excludedSensors
    };

    emitDataSockets(eventSocket, activationInfo);

    void this.mqttCentralService.updateState(userName, houseName, activationInfo);
  }

  /** Extrae los números de sensor y arma un nuevo array. */
  private extractSensors (sensors: string): string[] {
    const arraySensors = sensors?.split(',') || [];
    return arraySensors.map(sensor => sensor.trim());
  }
}
