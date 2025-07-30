import { Router } from "express";
import {
    generateCaptions,
    generateThumbnail,
    generateSocialCaptions,
    generateTags,
    generateDescription,
    generateAllAIContent,
    getAIContent
} from "../controllers/ai.controller.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router();

// Apply authentication middleware to all AI routes
router.use(verifyJwt);

// AI Content Generation Routes
router.post("/videos/:videoId/captions", generateCaptions);
router.post("/videos/:videoId/thumbnail", generateThumbnail);
router.post("/videos/:videoId/social-captions", generateSocialCaptions);
router.post("/videos/:videoId/tags", generateTags);
router.post("/videos/:videoId/description", generateDescription);

// Generate all AI content at once
router.post("/videos/:videoId/generate-all", generateAllAIContent);

// Get AI-generated content
router.get("/videos/:videoId/ai-content", getAIContent);

export default router; 