import mqtt from 'mqtt';
import { MosquittoCentralService } from './mosquitto-central';
import { CentralDataAccess, SensorDataAccess } from '../schemas';
import { CentralProperty, SensorProperty } from '../interfaces';
import { MosquittoSensorService } from './mosquitto-sensor';

export class MosquittoAccess {
   private mqttCentralService = new MosquittoCentralService(this.centralModel);
   private mqttSensorService = new MosquittoSensorService(this.sensorModel);
   private mqttUrl = process.env.MQTT_URL ?? '';
   private topicBase = process.env.TOPIC_BASE ?? '';
   private client = mqtt.connect(this.mqttUrl, { username: process.env.MQTT_USERNAME, password: process.env.MQTT_PASS });

   constructor (private centralModel: CentralDataAccess, private sensorModel: SensorDataAccess) {}

   connect () {
      this.client.on('connect', async () => {
      // Suscripción a tópicos
         this.client.subscribe(`${this.topicBase}/#`, (err) => {
            if (!err) {
               console.log(`Suscrito a ${this.topicBase}/#`);
         
               this.client.publish(`${this.topicBase}/conexion`, 'Conexión establecida');
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

         // Array de 4 partes implica apuntar a la central "alarmas/usuario_1/casa_1/(alarmaEncendida)"
         if (topicArray.length === 4) {
            const centralProp = topicArray[3];

            switch (centralProp as CentralProperty) {
               case 'alarmaEncendida':
                  this.mqttCentralService.updateState(userName, houseName, messageText);
                  break;
               default:
                  console.error('Propiedad de tópico no válida: ', centralProp);
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
                  this.mqttCentralService.setActivation(userName, houseName);
                  this.mqttSensorService.updateHistory(userName, houseName, messageText);
                  break;
               default:
                  break;
            }
         } else {
            console.log('Formato de tópico incorrecto');
         }
      });
   }
}
