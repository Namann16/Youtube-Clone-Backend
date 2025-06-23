import { asyncHandler } from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import  {User} from '../models/User.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'

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
    const { fullName, email, username, password} = req.body
    console.log("email:", email)

    // validation - not empty

    // if(fullName === ""){
    //     throw new ApiError(400, "Full name is required")
    // }

    if(
        [fullName, email, username, password].some((field) => field?.trim() ==="")
        ){
        throw new ApiError("All fields are required");
    }

    // check if user already exists: email or username

    const existingUser = User.findOne(
        {
            $or: [{ username } , { email }] // checks if any one of these fields match
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
        fullName,
        avatar: avatar.url,
        coverImage: coverImage.url || "",
        email,
        password,
        username: username.tolowercase()
    })

    // remove password field and refreshToken field

    const createdUser = await User.findById(user._id).select(   // select function is used to exclude fields from the response
        "-password -refreshToken" // exclude password and refreshToken from the response
    ) 
    
    // check if user is created.

    if(createdUser){
        throw new ApiError(500, "User not created")
    }

    // return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered succesfully")
    )


} )


export {registerUser}