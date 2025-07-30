import OpenAI from 'openai';
import { ApiError } from './ApiError.js';
import { uploadOnCloudinary } from './cloudinary.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * @param {string} videoUrl - Cloudinary video URL
 * @returns {Promise<Object>} - Generated captions with timestamps
 */
export const generateVideoCaptions = async (videoUrl) => {
    try {
        const response = await fetch(videoUrl);
        const videoBuffer = await response.arrayBuffer();
        
        const transcript = await openai.audio.transcriptions.create({
            file: new Blob([videoBuffer], { type: 'video/mp4' }),
            model: "whisper-1",
            response_format: "verbose_json",
            timestamp_granularities: ["word"]
        });

        return {
            success: true,
            captions: transcript.words,
            fullTranscript: transcript.text,
            language: transcript.language
        };
    } catch (error) {
        console.error('Error generating captions:', error);
        throw new ApiError(500, 'Failed to generate video captions');
    }
};

/**
 * Generate AI-powered thumbnail from video content
 * @param {string} videoUrl - Cloudinary video URL
 * @param {string} title - Video title for context
 * @returns {Promise<string>} - Generated thumbnail URL
 */
export const generateAIVideoThumbnail = async (videoUrl, title) => {
    try {
        // Extract key frames from video (simplified approach)
        // In production, you'd use FFmpeg or similar to extract frames
        
        // Generate thumbnail using DALL-E based on video title and content
        const prompt = `Create an engaging YouTube thumbnail for a video titled "${title}". 
        The thumbnail should be eye-catching, professional, and suitable for a video platform. 
        Include the title text prominently, use vibrant colors, and make it visually appealing. 
        Style: Modern, clean, with good contrast and readability.`;

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1280x720",
            quality: "standard",
            style: "vivid"
        });

        // Upload the generated image to Cloudinary
        const imageUrl = response.data[0].url;
        const thumbnail = await uploadOnCloudinary(imageUrl, 'thumbnails');

        return thumbnail.url;
    } catch (error) {
        console.error('Error generating AI thumbnail:', error);
        throw new ApiError(500, 'Failed to generate AI thumbnail');
    }
};

/**
 * Generate engaging social media captions for video sharing
 * @param {string} title - Video title
 * @param {string} description - Video description
 * @param {string} platform - Target platform (instagram, twitter, linkedin, etc.)
 * @returns {Promise<Object>} - Generated captions for different platforms
 */
export const generateSocialMediaCaptions = async (title, description, platform = 'all') => {
    try {
        const platforms = platform === 'all' 
            ? ['instagram', 'twitter', 'linkedin', 'facebook', 'tiktok']
            : [platform];

        const captions = {};

        for (const platform of platforms) {
            const prompt = `Create an engaging social media caption for a YouTube video.
            
            Video Title: "${title}"
            Video Description: "${description}"
            
            Platform: ${platform}
            
            Requirements:
            - Keep it engaging and authentic
            - Include relevant hashtags
            - Match the platform's tone and style
            - Include a call-to-action
            - Stay within platform character limits
            - Use emojis appropriately for the platform
            
            Generate a caption that will drive engagement and clicks.`;

            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are a social media expert who creates viral captions for video content."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 300,
                temperature: 0.8
            });

            captions[platform] = response.choices[0].message.content.trim();
        }

        return {
            success: true,
            captions
        };
    } catch (error) {
        console.error('Error generating social media captions:', error);
        throw new ApiError(500, 'Failed to generate social media captions');
    }
};

/**
 * Generate video tags using AI
 * @param {string} title - Video title
 * @param {string} description - Video description
 * @returns {Promise<Array>} - Generated tags
 */
export const generateVideoTags = async (title, description) => {
    try {
        const prompt = `Generate relevant tags for a YouTube video.
        
        Title: "${title}"
        Description: "${description}"
        
        Generate 10-15 relevant tags that would help with video discovery.
        Return only the tags separated by commas, no additional text.`;

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a YouTube SEO expert who generates relevant tags for video content."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 200,
            temperature: 0.7
        });

        const tags = response.choices[0].message.content
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

        return {
            success: true,
            tags
        };
    } catch (error) {
        console.error('Error generating video tags:', error);
        throw new ApiError(500, 'Failed to generate video tags');
    }
};

/**
 * Generate video description using AI
 * @param {string} title - Video title
 * @param {string} transcript - Video transcript (optional)
 * @returns {Promise<string>} - Generated description
 */
export const generateVideoDescription = async (title, transcript = '') => {
    try {
        const prompt = `Generate an engaging YouTube video description.
        
        Title: "${title}"
        ${transcript ? `Transcript: "${transcript.substring(0, 500)}..."` : ''}
        
        Create a compelling description that:
        - Hooks the viewer in the first few lines
        - Includes relevant keywords naturally
        - Has a clear structure with timestamps if applicable
        - Includes a call-to-action
        - Is optimized for YouTube SEO
        - Stays under 5000 characters`;

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a YouTube content creator who writes engaging video descriptions."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 800,
            temperature: 0.8
        });

        return {
            success: true,
            description: response.choices[0].message.content.trim()
        };
    } catch (error) {
        console.error('Error generating video description:', error);
        throw new ApiError(500, 'Failed to generate video description');
    }
}; 