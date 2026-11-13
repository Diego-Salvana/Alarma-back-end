/* eslint-disable @typescript-eslint/dot-notation */
import { MqttClient } from 'mqtt';
import { HouseAction, WarningType } from '../../src/interfaces';
import { extractSensors, MosquittoAccess, MosquittoEventDispatcher } from '../../src/mqtt';

jest.mock('mqtt', () => ({
  connect: jest.fn(() => ({
    on: jest.fn(),
    publish: jest.fn(),
    subscribe: jest.fn(),
    end: jest.fn()
  }))
}));

describe('Mosquitto', () => {
  let dispacher: jest.Mocked<MosquittoEventDispatcher>;
  let mosquittoAccess: MosquittoAccess;
  let mockClient: jest.MockedObjectDeep<MqttClient>;
  const username = 'usuario';
  const houseName = 'casa';
  const armingTopicMock = `prefix/eventos/armado/${username}/${houseName}`;
  const triggerTopicMock = `prefix/eventos/disparo/${username}/${houseName}`;

  beforeEach(() => {
    dispacher = {
      onAlarmArming: jest.fn(),
      onWarning: jest.fn(),
      onTriggered: jest.fn()
    } as unknown as jest.Mocked<MosquittoEventDispatcher>;
    
    mosquittoAccess = new MosquittoAccess();
    mosquittoAccess.setDispatcher(dispacher);

    mockClient = jest.mocked(mosquittoAccess['client']);
  });
  
  it('debería conectar a mosquitto con 4 eventos', () => {
    mosquittoAccess.connect();

    expect(mosquittoAccess['client'].on).toHaveBeenCalledTimes(4);
  });

  it('debería publicar un mensaje', () => {
    const topicContentMock = `eventos/armado/${username}/${houseName}`;
    const mockClient = jest.mocked(mosquittoAccess['client']);

    mosquittoAccess.publicMessage(HouseAction.SET_ARMED_STATE, 'Mensaje de prueba', username, houseName);
    
    expect(mockClient.publish).toHaveBeenCalledTimes(1);
    const [topic, message] = mockClient.publish.mock.calls[0];
    expect(topic).toContain(topicContentMock);
    expect(message).toBe('Mensaje de prueba');
  });

  it('no debería publicar un mensaje si "HouseAction" es incorrecto', () => {
    mosquittoAccess.publicMessage('Wrong Action' as HouseAction, 'Mensaje de prueba', username, houseName);
    
    expect(mockClient.publish).not.toHaveBeenCalled();
  });

  it('debería manejar el evento de arming con sensores excluidos', () => {
    const payload = 'ON:1,2,3';
    const excludedSensors = extractSensors(payload.split(':')[1]);
    
    mosquittoAccess['armingHandler'](armingTopicMock, payload);
    
    expect(dispacher.onAlarmArming).toHaveBeenCalledTimes(1);
    expect(dispacher.onAlarmArming).toHaveBeenCalledWith(username, houseName, 'On', excludedSensors);
  });

  it('debería manejar el evento de disarming', () => {
    mosquittoAccess['armingHandler'](armingTopicMock, 'OFF');

    expect(dispacher.onAlarmArming).toHaveBeenCalledTimes(1);
    expect(dispacher.onAlarmArming).toHaveBeenCalledWith(username, houseName, 'Off', []);
  });

  it('debería ignorar payloads inválidos al armar alarma', () => {
    mosquittoAccess['armingHandler'](armingTopicMock, 'INVALID');

    expect(dispacher.onAlarmArming).not.toHaveBeenCalled();
    expect(dispacher.onWarning).toHaveBeenCalledTimes(1);
    expect(dispacher.onWarning).toHaveBeenCalledWith(username, WarningType.DEVICE_STATE);
  });

  it('debería manejar el evento de trigger al activar la alarma', () => {
    mosquittoAccess['triggerHandler'](triggerTopicMock, 'true:1');

    expect(dispacher.onTriggered).toHaveBeenCalledTimes(1);
    expect(dispacher.onTriggered).toHaveBeenCalledWith(username, houseName, true, 1);
  });

  it('debería manejar el evento de trigger al desactivar la alarma', () => {
    mosquittoAccess['triggerHandler'](triggerTopicMock, 'false');

    expect(dispacher.onTriggered).toHaveBeenCalledTimes(1);
    expect(dispacher.onTriggered).toHaveBeenCalledWith(username, houseName, false, null);
  });
});
