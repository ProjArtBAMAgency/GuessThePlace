import { getWsServer } from "./wsServer.js";
import { getTeamsPossession } from "../controllers/teamsController.js";

export async function publishTeamsPossession() {
  const ws = getWsServer();
  if (!ws) return;

  const payload = await computeTeamsPossession();
  if (!payload) return;

  ws.pub("possession", {
    type: "possession:update",
    payload,
  });

  console.log("WS publish possession:", payload);
}
