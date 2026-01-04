import { getWsServer } from "./wsServer.js";
import { computeTeamsPossession } from "../controllers/teamsController.js";

export async function publishTeamsPossession() {
  const ws = getWsServer();
  if (!ws) return;

  const payload = await computeTeamsPossession();

  // WsMini: publish sur le channel "possession"
  ws.pub("possession", {
    type: "possession:update",
    payload,
  });
}
