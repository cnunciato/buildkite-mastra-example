
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { changeAnalyst } from './agents/change-analyst';
import { pipeline } from './workflows/pipeline';

export const mastra = new Mastra({
  agents: { changeAnalyst },
  workflows: { pipeline },
  storage: new LibSQLStore({
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
