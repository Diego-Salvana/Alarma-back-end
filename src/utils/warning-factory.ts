import { Warning, WarningType } from '../interfaces';

export class WarningFactory {
  static fromType (type: WarningType): Warning {
    let message;

    switch (type) {
      case WarningType.DEVICE_STATE:
        message = 'Could not confirm the Alarm state.';
        break;
      case WarningType.LIGHTS_STATE:
        message = 'Could not confirm the Lights state.';
        break;
      default:
        message = 'Could not confirm the issued action.';
        break;
    }

    return { type, message };
  }
}
