let wsServer = null;

export function setWsServer(instance) {
  wsServer = instance;
}

export function getWsServer() {
  return wsServer;
}
