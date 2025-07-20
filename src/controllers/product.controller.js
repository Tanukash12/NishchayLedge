import dotenv from "dotenv";
dotenv.config();

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { generateQRCodeHash } from "../utils/qrCodeHash.js";

const createProduct = asyncHandler(async (req, res) => {
    const { productName, description, sku, manufacturer, currentLocation } = req.body;

    if( !productName || !description || !sku || !manufacturer || !currentLocation) {
        throw new ApiError(400, "All fields are required.");
    }

    const existingProduct = await Product.findOne({
        sku: sku.toUpperCase(),
        manufacturer: new mongoose.Types.ObjectId(manufacturer)
    })

    if (existingProduct) {
        throw new ApiError(409, "Product with given SKU already exists for this manufacturer.");
    }

    const qrData = `${productName}-${sku}-${manufacturer}`;
    const { qrCodeUrl, qrCodeHash } = await generateQRCodeHash(qrData, sku);

    const product = await Product.create({
        productName,
        description,
        sku: sku.toUpperCase(),
        manufacturer,
        currentLocation,
        qrCodeUrl,
        qrCodeHash,
    });

    return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
})


export {
    createProduct
}