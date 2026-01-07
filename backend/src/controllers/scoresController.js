import User from "../models/User.js";
import Post from "../models/Post.js";

/**
 * GET /api/v1/scores/user/:id/posts
 * Calcule le score total des posts d'un utilisateur (500 points par post)
 */
export const getUserPostsScore = async (req, res, next) => {
    try {
        const userId = req.params.id;
        
        // Vérifier que l'utilisateur existe
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        
        // Compter le nombre de posts de l'utilisateur
        const postsCount = await Post.countDocuments({ userId });
        
        // Calculer le score (500 points par post)
        const postsScore = postsCount * 500;
        
        res.status(200).json({
            userId,
            postsCount,
            postsScore
        });
    }
    catch (error) {
        next(error);
    }
};
