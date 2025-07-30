import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/Video.model.js";
import { isValidObjectId } from "mongoose";
import {
    generateVideoCaptions,
    generateAIVideoThumbnail,
    generateSocialMediaCaptions,
    generateVideoTags,
    generateVideoDescription
} from "../utils/aiService.js";

/**
 * Generate captions for a video
 */
const generateCaptions = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (String(video.owner) !== String(req.user._id)) {
        throw new ApiError(403, "You can only generate captions for your own videos");
    }

    // Generate captions using AI
    const captionResult = await generateVideoCaptions(video.videoFile);

    // Update video with captions and transcript
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                captions: captionResult.captions,
                transcript: captionResult.fullTranscript,
                language: captionResult.language
            }
        },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Captions generated successfully")
    );
});

/**
 * Generate AI thumbnail for a video
 */
const generateThumbnail = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (String(video.owner) !== String(req.user._id)) {
        throw new ApiError(403, "You can only generate thumbnails for your own videos");
    }

    // Generate AI thumbnail
    const thumbnailUrl = await generateAIVideoThumbnail(video.videoFile, video.title);

    // Update video with AI-generated thumbnail
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                aiGeneratedThumbnail: thumbnailUrl
            }
        },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, { thumbnailUrl }, "AI thumbnail generated successfully")
    );
});

/**
 * Generate social media captions for a video
 */
const generateSocialCaptions = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { platform = 'all' } = req.query;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (String(video.owner) !== String(req.user._id)) {
        throw new ApiError(403, "You can only generate captions for your own videos");
    }

    // Generate social media captions
    const captionResult = await generateSocialMediaCaptions(video.title, video.description, platform);

    // Update video with social media captions
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                socialMediaCaptions: captionResult.captions
            }
        },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, captionResult.captions, "Social media captions generated successfully")
    );
});

/**
 * Generate video tags using AI
 */
const generateTags = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (String(video.owner) !== String(req.user._id)) {
        throw new ApiError(403, "You can only generate tags for your own videos");
    }

    // Generate video tags
    const tagResult = await generateVideoTags(video.title, video.description);

    // Update video with generated tags
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                tags: tagResult.tags
            }
        },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, { tags: tagResult.tags }, "Video tags generated successfully")
    );
});

/**
 * Generate AI-powered video description
 */
const generateDescription = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (String(video.owner) !== String(req.user._id)) {
        throw new ApiError(403, "You can only generate descriptions for your own videos");
    }

    // Generate AI description
    const descriptionResult = await generateVideoDescription(video.title, video.transcript);

    // Update video with AI-generated description
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                aiGeneratedDescription: descriptionResult.description
            }
        },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, { description: descriptionResult.description }, "AI description generated successfully")
    );
});

/**
 * Generate all AI content for a video (captions, thumbnail, tags, description, social captions)
 */
const generateAllAIContent = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (String(video.owner) !== String(req.user._id)) {
        throw new ApiError(403, "You can only generate AI content for your own videos");
    }

    try {
        // Generate all AI content in parallel
        const [
            captionResult,
            thumbnailUrl,
            socialCaptions,
            tagResult,
            descriptionResult
        ] = await Promise.all([
            generateVideoCaptions(video.videoFile),
            generateAIVideoThumbnail(video.videoFile, video.title),
            generateSocialMediaCaptions(video.title, video.description),
            generateVideoTags(video.title, video.description),
            generateVideoDescription(video.title)
        ]);

        // Update video with all AI-generated content
        const updatedVideo = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    captions: captionResult.captions,
                    transcript: captionResult.fullTranscript,
                    language: captionResult.language,
                    aiGeneratedThumbnail: thumbnailUrl,
                    socialMediaCaptions: socialCaptions.captions,
                    tags: tagResult.tags,
                    aiGeneratedDescription: descriptionResult.description
                }
            },
            { new: true }
        );

        return res.status(200).json(
            new ApiResponse(200, updatedVideo, "All AI content generated successfully")
        );
    } catch (error) {
        console.error('Error generating all AI content:', error);
        throw new ApiError(500, "Failed to generate all AI content");
    }
});

/**
 * Get AI-generated content for a video
 */
const getAIContent = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const aiContent = {
        captions: video.captions,
        transcript: video.transcript,
        language: video.language,
        aiGeneratedThumbnail: video.aiGeneratedThumbnail,
        socialMediaCaptions: video.socialMediaCaptions,
        tags: video.tags,
        aiGeneratedDescription: video.aiGeneratedDescription
    };

    return res.status(200).json(
        new ApiResponse(200, aiContent, "AI content retrieved successfully")
    );
});

export {
    generateCaptions,
    generateThumbnail,
    generateSocialCaptions,
    generateTags,
    generateDescription,
    generateAllAIContent,
    getAIContent
}; 