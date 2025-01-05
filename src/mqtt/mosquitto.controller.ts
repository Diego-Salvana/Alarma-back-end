import mqtt from 'mqtt';
import { MosquittoCentralService } from './mosquitto-central';
import { CentralDataAccess, SensorDataAccess } from '../schemas';
import { CentralProperty, SensorProperty } from '../interfaces';
import { MosquittoSensorService } from './mosquitto-sensor';

export function connectMosquitto (centralModel: CentralDataAccess, sensorModel: SensorDataAccess) {
   const serviceOfCentral = new MosquittoCentralService(centralModel);
   const serviceOfSensor = new MosquittoSensorService(sensorModel);
   const mqttUrl = process.env.MQTT_URL ?? '';
   const topicBase = process.env.TOPIC_BASE ?? '';

   const client = mqtt.connect(mqttUrl, { username: process.env.MQTT_USERNAME, password: process.env.MQTT_PASS });

   client.on('connect', () => {
      // Suscripción a tópicos
      client.subscribe(`${topicBase}/#`, (err) => {
         if (!err) {
            console.log(`Suscrito a ${topicBase}/#`);
         
            client.publish(`${topicBase}/conexion`, 'Conexión establecida');
         } else {
            console.error('Error al suscribirse:', err);
         }
      });
   });

   client.on('message', async (topic, message) => {
      const messageText = message.toString().trim();
      console.log({ mensaje: messageText, topico: topic });
   
      const topicArray = topic.split('/');
      const userName = topicArray[1];
      const houseName = topicArray[2];

      // Array de 4 partes implica apuntar a la central "alarmas/usuario_1/casa_1/(alarmaEncendida)"
      if (topicArray.length === 4) {
         const centralProp = topicArray[3];

         switch (centralProp as CentralProperty) {
            case 'alarmaEncendida':
               serviceOfCentral.updateState(userName, houseName, messageText);
               break;
            default:
               break;
         }

      // Array de 5 partes implica apuntar a un sensor "alarmas/usuario_1/casa_1/sensores/(estado || activado)"
      } else if (topicArray.length === 5) {
         const sensorProp = topicArray[4];

         switch (sensorProp as SensorProperty) {
            case 'estado':
               // updateSensorState(userName, houseName, sensorNumber, messageText);
               break;
            case 'activado':
               serviceOfCentral.setActivation(userName, houseName);
               serviceOfSensor.updateHistory(userName, houseName, messageText);
               break;
            default:
               break;
         }
      } else {
         console.log('Formato de tópico incorrecto');
      }
   });
}
