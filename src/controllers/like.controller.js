import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user.id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const existingLike = await Like.findOne({
    user: userId,
    video: videoId,
  });

  if (existingLike) {
    await existingLike.deleteOne();
    return res.status(200).json(new ApiResponse(200, null, "Video unliked"));
  }

  const like = await Like.create({ user: userId, video: videoId });
  return res.status(201).json(new ApiResponse(201, like, "Video liked"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const existingLike = await Like.findOne({
    user: userId,
    comment: commentId,
  });

  if (existingLike) {
    await existingLike.deleteOne();
    return res.status(200).json(new ApiResponse(200, null, "Comment unliked"));
  }

  const like = await Like.create({ user: userId, comment: commentId });
  return res.status(201).json(new ApiResponse(201, like, "Comment liked"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user.id;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const existingLike = await Like.findOne({
    user: userId,
    tweet: tweetId,
  });

  if (existingLike) {
    await existingLike.deleteOne();
    return res.status(200).json(new ApiResponse(200, null, "Tweet unliked"));
  }

  const like = await Like.create({ user: userId, tweet: tweetId });
  return res.status(201).json(new ApiResponse(201, like, "Tweet liked"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const likes = await Like.find({ user: userId, video: { $ne: null } })
    .populate("video");

  const likedVideos = likes.map((like) => like.video).filter(Boolean);

  return res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "Liked videos fetched"));
});

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
};
