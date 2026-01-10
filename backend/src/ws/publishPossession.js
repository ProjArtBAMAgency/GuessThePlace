import { getWsServer } from "./wsServer.js";
import { computeTeamsPossession } from "../controllers/teamsController.js";

export async function publishTeamsPossession() {
  const ws = getWsServer();
  if (!ws) return;

  const payload = await computeTeamsPossession();
  if (!payload) return;

  const result = ws.pub("possession", {
    type: "possession:update",
    payload,
  });

  console.log("WS publish possession worked:", result);
  console.log("WS publish possession:", payload);
}
