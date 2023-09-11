import QuickbooksServer from '../lib/soap.js';
import qbXMLHandler from './qbXMLHandler/index.js';

const quickbooksServer = new QuickbooksServer();
quickbooksServer.setQBXMLHandler(qbXMLHandler);

export default quickbooksServer;
