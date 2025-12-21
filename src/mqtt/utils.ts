export function verifySensorNumber (sensor: string): number {
  const sensorNumber = Math.floor(Number(sensor));
      
  if (isNaN(sensorNumber) || sensorNumber < 1) {
    throw new Error(`El número de sensor ${sensor} no es válido`);
  }

  return sensorNumber;
}
