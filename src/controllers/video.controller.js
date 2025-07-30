import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/Video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { generateAIVideoThumbnail } from "../utils/aiService.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = "desc", userId } = req.query;

    const filter = {
        isPublished: true,
        title: { $regex: query, $options: "i" }
    };

    if (userId && isValidObjectId(userId)) {
        filter.owner = userId;
    }

    const sort = {};
    sort[sortBy] = sortType === "asc" ? 1 : -1;

    const aggregate = Video.aggregate([{ $match: filter }, { $sort: sort }]);

    const videos = await Video.aggregatePaginate(aggregate, {
        page,
        limit,
        populate: { path: "owner", select: "username email" },
    });

    res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, useAITumbnail = false } = req.body;
    const videoFile = req.files?.videoFile?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0];

    if (!videoFile) {
        throw new ApiError(400, "Video file is required");
    }

    const uploadedVideo = await uploadOnCloudinary(videoFile.path, "video");
    const duration = uploadedVideo?.duration || 0;

    let thumbnailUrl;
    
    if (useAITumbnail) {
        // Generate AI thumbnail
        thumbnailUrl = await generateAIVideoThumbnail(uploadedVideo.url, title);
    } else if (thumbnailFile) {
        // Use uploaded thumbnail
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailFile.path);
        thumbnailUrl = uploadedThumbnail.url;
    } else {
        throw new ApiError(400, "Either thumbnail file or AI thumbnail generation is required");
    }

    const video = await Video.create({
        videoFile: uploadedVideo.url,
        thumbnail: thumbnailUrl,
        aiGeneratedThumbnail: useAITumbnail ? thumbnailUrl : null,
        title,
        description,
        duration,
        owner: req.user._id,
    });

    res.status(201).json(new ApiResponse(201, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId).populate("owner", "username email");

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const thumbnailFile = req.file;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (String(video.owner) !== String(req.user._id)) {
        throw new ApiError(403, "You are not allowed to update this video");
    }

    if (thumbnailFile) {
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailFile.path);
        video.thumbnail = uploadedThumbnail.url;
    }

    if (title) video.title = title;
    if (description) video.description = description;

    await video.save();

    res.status(200).json(new ApiResponse(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (String(video.owner) !== String(req.user._id)) {
        throw new ApiError(403, "You are not allowed to delete this video");
    }

    await video.deleteOne();

    res.status(200).json(new ApiResponse(200, null, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (String(video.owner) !== String(req.user._id)) {
        throw new ApiError(403, "You are not allowed to toggle publish status");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    res.status(200).json(new ApiResponse(200, video, `Video ${video.isPublished ? "published" : "unpublished"}`));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
