import Zones from "../models/Zones.js";
import { zonesGeoJSON } from "../data/zonesData.js";

/**
 * GET /api/v1/zones
 * Récupère toutes les zones
 */
export async function getZones(req, res) {
  try {
    const zones = await Zones.find();
    res.status(200).json(zones);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

/**
 * GET /api/v1/zones/:id
 * Récupère une zone par son ID
 * Le paramètre id est passé dans l'URL
 */

export async function getZoneById(req, res) {
  try {
    const { id } = req.params;

    // Vérification format ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const zone = await Zones.findById(id);

    if (!zone) {
      return res.status(404).json({ error: "Zone non trouvée" });
    }

    res.status(200).json(zone);
  } catch (err) {
    console.error("Erreur getZoneById:", err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération de la zone" });
  }
}

/**
 * GET /api/v1/zones/map
 * Renvoie les données GeoJSON des zones, pour la carte (front)
 */

export function getZonesForMap(req, res) {
  res.status(200).json(zonesGeoJSON);
}
