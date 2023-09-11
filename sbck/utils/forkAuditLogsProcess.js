import childProcess from 'child_process';

import { AUDIT_LOG_AS_SEPARATE_PROCESS } from '../config.js';
import { logger } from './logger.js';

const AUDIT_LOGS_PROCESS_MAX_SETUP_RETRIES = 5;

global.auditLogProcessRetries = 1;

const restartAlProcess = () => {
  global.auditLogProcess?.removeAllListeners();
  global.auditLogProcess?.killed || global.auditLogProcess?.kill?.();
  global.auditLogProcess = null;

  if (global.auditLogProcessRetries <= AUDIT_LOGS_PROCESS_MAX_SETUP_RETRIES) {
    logger.info(
      `[AL] Forked Audit Logs process retry #${global.auditLogProcessRetries}. Re-setup...`,
    );

    global.auditLogProcessRetries++;

    // up AL process again
    // eslint-disable-next-line no-use-before-define
    setupAl();
  }
};

export const setupAl = () => {
  if (AUDIT_LOG_AS_SEPARATE_PROCESS && AUDIT_LOG_AS_SEPARATE_PROCESS === 'true') {
    global.auditLogProcess = childProcess.fork(`${process.cwd()}/services/auditLog.js`);

    global.auditLogProcess.once('exit', restartAlProcess);
  }
};
