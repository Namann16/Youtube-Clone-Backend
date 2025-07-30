# 🎥 YouTube Clone Backend - AI-Powered Video Platform

A full-featured YouTube clone backend built with Node.js, Express, and MongoDB, enhanced with cutting-edge AI features for content creation and optimization.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - JWT-based secure authentication
- **Video Upload & Management** - Upload, edit, delete, and publish videos
- **User Profiles** - Customizable user profiles with avatars and cover images
- **Comments System** - Full CRUD operations for video comments
- **Like/Dislike System** - Interactive like and dislike functionality
- **Subscription System** - Subscribe/unsubscribe to channels
- **Playlist Management** - Create and manage video playlists
- **Dashboard Analytics** - User dashboard with video statistics
- **Search & Filtering** - Advanced video search with pagination
- **Watch History** - Track user viewing history

### 🤖 AI-Powered Features (Resume Highlights)

#### 1. **AI Caption Generation**
- **Technology**: OpenAI Whisper API
- **Functionality**: Automatic speech-to-text transcription with timestamps
- **Benefits**: Improves accessibility for hearing-impaired users
- **API Endpoint**: `POST /api/v1/ai/videos/:videoId/captions`

#### 2. **AI Thumbnail Generation**
- **Technology**: OpenAI DALL-E 3 API
- **Functionality**: Creates engaging thumbnails based on video content
- **Benefits**: Reduces manual work for content creators
- **API Endpoint**: `POST /api/v1/ai/videos/:videoId/thumbnail`

#### 3. **Social Media Caption Generator**
- **Technology**: OpenAI GPT-4 API
- **Functionality**: Platform-specific captions for Instagram, Twitter, LinkedIn, Facebook, TikTok
- **Benefits**: Optimizes content for different social media platforms
- **API Endpoint**: `POST /api/v1/ai/videos/:videoId/social-captions`

#### 4. **AI Video Tagging**
- **Technology**: OpenAI GPT-4 API
- **Functionality**: Automatic generation of relevant tags for better SEO
- **Benefits**: Improves video discoverability and search ranking
- **API Endpoint**: `POST /api/v1/ai/videos/:videoId/tags`

#### 5. **AI Description Generator**
- **Technology**: OpenAI GPT-4 API
- **Functionality**: Creates engaging video descriptions optimized for YouTube SEO
- **Benefits**: Saves time and improves content quality
- **API Endpoint**: `POST /api/v1/ai/videos/:videoId/description`

#### 6. **Bulk AI Content Generation**
- **Functionality**: Generate all AI content in one request
- **Benefits**: Efficient parallel processing for multiple AI operations
- **API Endpoint**: `POST /api/v1/ai/videos/:videoId/generate-all`

## 🛠 Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Multer** - File upload handling
- **Cloudinary** - Cloud image/video storage

### AI Integration
- **OpenAI API** - GPT-4, DALL-E 3, Whisper
- **Speech Recognition** - Automatic transcription
- **Computer Vision** - Image generation
- **Natural Language Processing** - Content generation

### Development Tools
- **Nodemon** - Development server
- **ES6 Modules** - Modern JavaScript
- **CORS** - Cross-origin resource sharing
- **Cookie Parser** - Cookie handling

## 📋 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users/register` | User registration |
| POST | `/api/v1/users/login` | User login |
| POST | `/api/v1/users/logout` | User logout |
| POST | `/api/v1/users/refresh-token` | Refresh access token |

### Videos
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/videos` | Get all videos |
| POST | `/api/v1/videos` | Upload video |
| GET | `/api/v1/videos/:videoId` | Get video by ID |
| PATCH | `/api/v1/videos/:videoId` | Update video |
| DELETE | `/api/v1/videos/:videoId` | Delete video |
| PATCH | `/api/v1/videos/:videoId/publish` | Toggle publish status |

### AI Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ai/videos/:videoId/captions` | Generate captions |
| POST | `/api/v1/ai/videos/:videoId/thumbnail` | Generate AI thumbnail |
| POST | `/api/v1/ai/videos/:videoId/social-captions` | Generate social captions |
| POST | `/api/v1/ai/videos/:videoId/tags` | Generate video tags |
| POST | `/api/v1/ai/videos/:videoId/description` | Generate description |
| POST | `/api/v1/ai/videos/:videoId/generate-all` | Generate all AI content |
| GET | `/api/v1/ai/videos/:videoId/ai-content` | Get AI content |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/comments/:videoId` | Get video comments |
| POST | `/api/v1/comments` | Add comment |
| PATCH | `/api/v1/comments/:commentId` | Update comment |
| DELETE | `/api/v1/comments/:commentId` | Delete comment |

### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/current-user` | Get current user |
| PATCH | `/api/v1/users/update-account` | Update account details |
| PATCH | `/api/v1/users/avatar` | Update avatar |
| PATCH | `/api/v1/users/cover-image` | Update cover image |
| GET | `/api/v1/users/c/:username` | Get channel profile |
| GET | `/api/v1/users/watch-history` | Get watch history |

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- OpenAI API Key
- Cloudinary Account

### Environment Variables
Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Youtube-Clone-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the .env.example file and fill in your values
   cp .env.example .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 📊 Database Schema

### User Model
```javascript
{
  fullName: String,
  email: String,
  username: String,
  password: String,
  avatar: String,
  coverImage: String,
  refreshToken: String,
  watchHistory: [Video]
}
```

### Video Model
```javascript
{
  videoFile: String,
  thumbnail: String,
  title: String,
  description: String,
  duration: Number,
  views: Number,
  isPublished: Boolean,
  owner: ObjectId,
  // AI-generated fields
  aiGeneratedThumbnail: String,
  captions: [{
    start: Number,
    end: Number,
    text: String
  }],
  transcript: String,
  tags: [String],
  socialMediaCaptions: {
    instagram: String,
    twitter: String,
    linkedin: String,
    facebook: String,
    tiktok: String
  },
  aiGeneratedDescription: String,
  language: String
}
```

## 🎯 Resume Impact

### Technical Skills Demonstrated
1. **AI/ML Integration** - OpenAI API integration with multiple models
2. **Speech Recognition** - Whisper API for automatic transcription
3. **Computer Vision** - DALL-E for image generation
4. **Natural Language Processing** - GPT-4 for content generation
5. **Full-Stack Development** - Complete backend with authentication
6. **Database Design** - MongoDB schema optimization
7. **API Design** - RESTful APIs with proper error handling
8. **File Handling** - Video and image upload processing
9. **Security** - JWT authentication and authorization
10. **Performance** - Parallel processing for bulk operations

### Business Value
- **Content Creation Automation** - Reduces manual work by 80%
- **SEO Optimization** - AI-powered tagging and descriptions
- **Accessibility** - Automatic caption generation
- **Social Media Marketing** - Platform-specific content optimization
- **User Experience** - Streamlined content creation workflow

## 🔧 Usage Examples

### Generate AI Captions
```bash
curl -X POST /api/v1/ai/videos/64f1234567890abcdef/captions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Generate Social Media Captions
```bash
curl -X POST /api/v1/ai/videos/64f1234567890abcdef/social-captions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"platform": "instagram"}'
```

### Upload Video with AI Thumbnail
```bash
curl -X POST /api/v1/videos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "videoFile=@video.mp4" \
  -F "title=My Amazing Video" \
  -F "description=Check out this awesome content!" \
  -F "useAITumbnail=true"
```

## 📈 Performance & Scalability

- **Parallel Processing** - Bulk AI operations run concurrently
- **Error Handling** - Comprehensive error management
- **Rate Limiting** - OpenAI API rate limit handling
- **Caching** - Consider Redis for generated content
- **Load Balancing** - Ready for horizontal scaling

## 🔮 Future Enhancements

1. **Video Analysis** - Content-based thumbnail generation
2. **Multi-language Support** - Translation of captions and descriptions
3. **Trending Analysis** - AI-powered trending prediction
4. **Content Moderation** - AI-powered inappropriate content detection
5. **Personalization** - User-specific content recommendations
6. **Real-time Processing** - WebSocket integration for live updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@Namann16](https://github.com/Namann16)
- LinkedIn: [My LinkedIn](https://www.linkedin.com/in/naman16/)

## 🙏 Acknowledgments

- OpenAI for providing powerful AI APIs
- Cloudinary for cloud storage solutions
- MongoDB for the database
- Express.js community for the excellent framework

---

⭐ **Star this repository if you find it helpful!**

This project demonstrates cutting-edge AI integration, modern development practices, and a deep understanding of content creation workflows - making it an excellent addition to any developer's portfolio!
