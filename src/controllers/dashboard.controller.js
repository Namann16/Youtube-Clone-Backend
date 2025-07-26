import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized: User not found in request");
  }

  const isValid = mongoose.Types.ObjectId.isValid(userId);
  if (!isValid) {
    throw new ApiError(400, "Invalid user ID");
  }

  const totalVideos = await Video.countDocuments({ owner: userId });

  const viewsAgg = await Video.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalViews: { $sum: "$views" },
      },
    },
  ]);
  const totalViews = viewsAgg[0]?.totalViews || 0;

  const totalSubscribers = await Subscription.countDocuments({ channel: userId });

  const videoIds = await Video.find({ owner: userId }).distinct("_id");
  const totalLikes = await Like.countDocuments({ video: { $in: videoIds } });

  return res.status(200).json(
    new ApiResponse(200, {
      totalVideos,
      totalViews,
      totalSubscribers,
      totalLikes,
    }, "Channel stats fetched")
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized: User not found in request");
  }

  const isValid = mongoose.Types.ObjectId.isValid(userId);
  if (!isValid) {
    throw new ApiError(400, "Invalid user ID");
  }

  const videos = await Video.find({ owner: userId }).sort({ createdAt: -1 });

  if (!videos || videos.length === 0) {
    throw new ApiError(404, "No videos found for this channel");
  }

  return res.status(200).json(new ApiResponse(200, videos, "Channel videos fetched"));
});

export {
  getChannelStats,
  getChannelVideos
};
