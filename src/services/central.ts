import { ControlPanelEventType, EventLogWithName, CentralCodeDTO } from '../interfaces';
import { CentralDataAccess, EventDataAccess, HouseDataAccess, UserDataAccess } from '../database/access';
import { verifyPass } from '../utils';
import { NotFoundError, UnauthorizedError } from '../errors';

export class CentralService {
  constructor (
    private userDataAccess: UserDataAccess,
    private centralDataAccess: CentralDataAccess,
    private houseDataAccess: HouseDataAccess,
    private eventDataAccess: EventDataAccess
  ) {}

  async getHistory (userId: string, houseId: string): Promise<EventLogWithName[]> {
    const house = await this.houseDataAccess.getOne(userId, houseId);
    const events = await this.eventDataAccess.getByHouse(houseId);

    return events.map(event => {
      if (event.source === 'ControlPanel') {
        const sensorNumber = event.sensorNumber;
        const sensor = sensorNumber !== undefined
          ? house.sensors.find(s => s.number === sensorNumber)
          : undefined;

        const historyWithName: EventLogWithName = {
          date: event.date,
          type: event.type ?? ControlPanelEventType.ALARM_TRIGGERED,
          ...(sensorNumber !== undefined && { sensorNumber }),
          ...((sensor !== undefined || sensorNumber !== undefined) && {
            deviceName: sensor?.name ?? String(sensorNumber ?? '')
          }),
          ...(event.userId !== undefined && { userId: event.userId })
        };

        return historyWithName;
      }

      const sensor = house.sensors.find(s => s.number === event.number);
      const historyWithName: EventLogWithName = {
        date: event.date,
        type: 'SENSOR',
        sensorNumber: event.number,
        deviceName: sensor?.name ?? String(event.number)
      };

      return historyWithName;
    });
  }

  async updateCode (userId: string, houseId: string, codeBody: CentralCodeDTO): Promise<void> {
    const user = await this.userDataAccess.getById(userId);
    const { password, currentCode, newCode } = codeBody;

    const passwordIsCorrect = await verifyPass(password, user.password);
    if (!passwordIsCorrect) throw new UnauthorizedError('Incorrect user password');

    const house = await this.houseDataAccess.getOne(userId, houseId);
    const centralCode = house?.controlPanel.alarmCode;

    if (!centralCode) throw new NotFoundError('Alarm code not found for validation');
    if (centralCode !== currentCode) throw new UnauthorizedError('Current alarm code is incorrect');

    await this.centralDataAccess.updateCode(userId, houseId, newCode);
  }
}
