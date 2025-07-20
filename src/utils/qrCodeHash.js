import  QRCode  from 'qrcode';
import { createHash } from 'crypto';
import path from 'path';
import { uploadOnCloudinary } from './cloudinary.js';
import { ApiError } from './ApiError.js';
import fs from "fs"

const generateQRCodeHash = async (text, sku) => {
    try {
        const hash = createHash('sha256').update(text).digest('hex');

        const qrCodePath = path.join("public" , "temp", `${sku}.png`);

        await QRCode.toFile(qrCodePath, text )

        const cloudinaryRes = await uploadOnCloudinary(qrCodePath);

        return {
        qrCodeUrl: cloudinaryRes?.secure_url,
        qrCodeHash: hash,
        };

    }catch(err){
        throw new ApiError(500, "Error generating QR Code: " + err.message);

    }
} 

export {generateQRCodeHash}