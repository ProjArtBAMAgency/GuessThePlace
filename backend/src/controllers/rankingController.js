import User from "../models/User.js";
import Team from "../models/Teams.js";
import Guess from "../models/Guess.js";
import mongoose from "mongoose";

export const getRanking = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const teamId = req.query.team_id || null;

        // Pipeline de base : grouper les scores par user
        const pipeline = [
            {
                $group: {
                    _id: "$user",
                    totalScore: { $sum: "$score" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            { $unwind: "$userInfo" }
        ];

        // Filtrer par team si fourni (AVANT le project)
        if (teamId) {
            pipeline.push({
                $match: { "userInfo.team_id": new mongoose.Types.ObjectId(teamId) }
            });
        }

        // Continuer le pipeline
        pipeline.push(
            {
                $lookup: {
                    from: "teams",
                    localField: "userInfo.team_id",
                    foreignField: "_id",
                    as: "teamInfo"
                }
            },
            {
                $project: {
                    userId: "$_id",
                    pseudo: "$userInfo.pseudo",
                    teamId: "$userInfo.team_id",
                    team: { $arrayElemAt: ["$teamInfo.name", 0] },
                    totalScore: 1
                }
            }
        );

        // Trier par score décroissant
        pipeline.push({ $sort: { totalScore: -1 } });

        // Compter le total avant pagination
        const countPipeline = [...pipeline, { $count: "total" }];
        const countResult = await Guess.aggregate(countPipeline);
        const total = countResult[0]?.total || 0;
        const totalPages = Math.ceil(total / limit);

        // Ajouter le ranking (position globale) et paginer
        pipeline.push(
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit }
                    ]
                }
            }
        );

        const result = await Guess.aggregate(pipeline);
        
        // Ajouter le numéro de ranking à chaque résultat
        const data = result[0].data.map((user, index) => ({
            ...user,
            ranking: skip + index + 1
        }));

        res.status(200).json({
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });

    } catch (error) {
        next(error);
    }
}
