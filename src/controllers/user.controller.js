import { asyncHandler } from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import  {User} from '../models/User.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const generateAccessToken = user.generateAccessToken()
        const generateRefreshToken = user.generateRefreshToken()
        
        // save the refresh token in the user document
        user.refreshToken = refreshToken
        await user.Save({validateBeforeSave: false}) // validateBeforeSave: false is used to skip validation for the refreshToken field

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh or access token")
    }
}

const registerUser = asyncHandler ( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: email or username
    // check for images and avatar
    // upload them to cloudinary, check if avatar is uploaded or not
    // Create user object - create entry in db
    // remove password and refreshtoken field from response
    // check for user creation
    // return response


    // get user details from frontend
    const { fullname, emails, username, password} = req.body
    console.log("email:", emails)

    // validation - not empty

    // if(fullName === ""){
    //     throw new ApiError(400, "Full name is required")
    // }

    if(
        [fullname, emails, username, password].some((field) => field?.trim() ==="")
        ){
        throw new ApiError("All fields are required");
    }

    // check if user already exists: email or username

    const existingUser = await User.findOne(
        {
            $or: [{ username } , { emails }] // checks if any one of these fields match
        }
    )

    if(existingUser){
        throw new ApiError(400, "User already exists with this email or username")
    }
    // check for images and avatar
    const avatarLocalPath = req.files?.avatar[0]?.path // .files option is given by multer middleware
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath || !coverImageLocalPath){
        throw new ApiError(400, "Avatar or cover image is required")
    }

    // upload them to cloudinary, check if avatar is uploaded or not
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar || !coverImage){
        throw new ApiError(500, "Error uploading images to cloudinary")
    }

    // create user objecy - create entry in db

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage.url || "",
        emails,
        password,
        username: username.toLowerCase()
    })

    // remove password field and refreshToken field

    const createdUser = await User.findById(user._id).select(   // select function is used to exclude fields from the response
        "-password -refreshToken" // exclude password and refreshToken from the response
    ) 
    
    // check if user is created.

    if(!createdUser){
        throw new ApiError(500, "User not created")
    }

    // return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered succesfully")
    )


} )

const loginUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user exists: email or username
    // check for password
    // compare password with hashed password in db
    // create access token and refresh token
    // return response

    // validation - not empty
    const { emails, username, password} = req.body

    if(!username || !emails) {
        throw new ApiError ( 400, "userame or email is required")
    }

    // check if user exists: email or username
    const user = await User.findOne({
        $or: [{username}, {emails}]
    })

    if(!user) {
        throw new ApiError ( 404, "User does not exist")
    }

    //check for password
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(401, "Password is invalid")
    }

    //create access and refresh token
    const {accessTOken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", resfreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessTOken,
                refreshToken
            },
            "User logged in successfully"
        )
    )
})

const logoutUser = asyncHandler (async (req, res) => {
    // clear the cookies
    // remove the refresh token from the user document
    // return response
    await User.findByIdAndUpdate(
        req.user._id,
        {
           $set: 
           {
                refreshToken: undefined
           } 
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))

})

const refreshAccessToken = asyncHandler (async( req,res) => {
   const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken

   if(!incomingRefreshToken) {
        throw new ApiError (400, "Invalid Refresh Token")
   }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user) {
            throw new ApiError (401, "Invalid Refresh Token")
       }
    
       if(incomingRefreshToken != user?.refreshToken) {
            throw new ApiError(401, "Expired refresh Token")
       }
    
       const options = {
        httpOnly: true,
        secure: true
       }
    
       await generateAccessAndRefreshToken(user._id)
    
       return res
       .status(200)
       .cookie("accessToken" , accessToken, options)
       .cookie("refreshToken", refreshToken, options)
       .json(
        new ApiResponse(
            200,
            {accessToken, refreshToken: newRefreshTOken},
            "access token refreshed successfully"
        )
    )
    
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect) {
        throw new ApiError(401, "Old password is incorrect")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    )
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(200, req.user, "Current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullname, emails} = req.body

    if(!fullname || !emails) {
        throw new ApiError(400, "All fields are required")
    }

    const user = User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullname,
                email : emails,
            }
        },
        {new: true} // new: true returns the updated document
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200, user, "User details updated successfully"))

})

const updateUserAvatar = asyncHandler ( async(req, res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url) {
        throw new ApiError(400, "Error uploading avatar to cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password")
    
    return res.status(200)
    .json(new ApiResponse(200, user, "User cover image updated successfully"))
})

const updateUserCoverImage = asyncHandler ( async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url) {
        throw new ApiError(400, "Error uploading avatar to cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coveImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200, user, "User cover image updated successfully"))
})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}