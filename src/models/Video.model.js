import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            type: String, //cloudinary url
            required: true
        },
        thumbnail: {
            type: String, //cloudinary url
            required: true
        },
        title: {
            type: String, 
            required: true
        },
        description: {
            type: String, 
            required: true
        },
        duration: {
            type: Number, 
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        // AI-generated content fields
        aiGeneratedThumbnail: {
            type: String, // AI-generated thumbnail URL
            default: null
        },
        captions: {
            type: [{
                start: Number,
                end: Number,
                text: String
            }],
            default: []
        },
        transcript: {
            type: String,
            default: ""
        },
        tags: {
            type: [String],
            default: []
        },
        socialMediaCaptions: {
            type: {
                instagram: String,
                twitter: String,
                linkedin: String,
                facebook: String,
                tiktok: String
            },
            default: {}
        },
        aiGeneratedDescription: {
            type: String,
            default: ""
        },
        language: {
            type: String,
            default: "en"
        }

    }, 
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)