import { Warning, WarningType } from '../interfaces';

export class WarningFactory {
  static fromType (type: WarningType): Warning {
    let message;

    switch (type) {
      case WarningType.DEVICE_STATE:
        message = 'No se pudo confirmar el estado de la Alarma.';
        break;
      case WarningType.LIGHTS_STATE:
        message = 'No se pudo confirmar el estado de las Luces.';
        break;
      default:
        message = 'No fue posible confirmar la acción emitida.';
        break;
    }

    return { type, message };
  }
}
