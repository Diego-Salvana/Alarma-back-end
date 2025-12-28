export function verifySensorNumber (sensor: string): number {
  const sensorNumber = Math.floor(Number(sensor));
      
  if (isNaN(sensorNumber) || sensorNumber < 1) {
    throw new Error(`El número de sensor ${sensor} no es válido`);
  }

  return sensorNumber;
}

/** Extrae los números de sensor y arma un array con ellos. */
export function extractSensors (sensors: string): string[] {
  const arraySensors = sensors?.split(',') || [];
  return arraySensors.map(sensor => sensor.trim());
}
