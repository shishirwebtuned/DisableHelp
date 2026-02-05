import cloudinary from "./cloudinary.js";
import streamifier from "streamifier";

export const uploadToCloudinary = (fileBuffer: Buffer, folder: string) => {
  return new Promise<{ url: string; public_id: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      },
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};
