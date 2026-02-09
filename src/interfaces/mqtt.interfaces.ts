export interface MQTTtopicHandler {
  prefix: string;
  handler: (topic: string, payload: string) => void;
}
