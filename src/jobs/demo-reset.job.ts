import cron from 'node-cron';

import { DemoResetService } from '../services';

export function startDemoResetJob (demoResetService: DemoResetService) {
  return cron.schedule(
    '0 3 * * *',
    async () => {
      try {
        console.log('[DemoResetJob] Iniciando reset del usuario demo');

        await demoResetService.reset();

        console.log('[DemoResetJob] Reset finalizado');
      } catch (error) {
        console.error('[DemoResetJob] Error al resetear el usuario demo', error);
      }
    },
    {
      timezone: 'America/Argentina/Buenos_Aires',
      noOverlap: true
    }
  );
}
