import {v2 as cloudinary} from "cloudinary"
import fs from "fs" 



cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
})

const uploadOnCloudinary = async(FilePath) => {
    try {
        if(!FilePath) return null
        const response = await cloudinary.uploader.upload(FilePath, {
            resource_type:"auto"
        })
        console.log("File is uploaded on Cloudinary",
            response.url
        )
        fs.unlinkSync(FilePath)
        return response
    } 
    catch( error ) {
        fs.unlinkSync(FilePath) 
        return null
    }
}

export {uploadOnCloudinary}