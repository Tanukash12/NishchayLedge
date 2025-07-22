import dotenv from "dotenv";
dotenv.config();

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose, {Schema} from "mongoose";
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

const getProductById = asyncHandler(async (req, res) => {
    const {productId} = req.params;
    if(!productId || !mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid product ID.");
    }

    const product = await Product.findById(productId)
    if(!product){
        throw new ApiError(404, "Product not found.");
    }

    if(!product.isActive) {
        throw new ApiError(403, "Product is not active.");
    }

    return res 
    .status(200)
    .json(new ApiResponse(200, product, "Product retrieved successfully"));
})

const getManufacturerDetails = asyncHandler(async (req,res) => {
    const { productId } = req.params;
    if (!productId || !mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid product ID.");
    }

    const product = await Product.findById(productId).populate("manufacturer", "-password -refreshToken");
    if (!product) {
        throw new ApiError(404, "Product not found.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, product.manufacturer, "Manufacturer details retrieved successfully"));
})

const getCurrentLocation = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    if (!productId || !mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid product ID.");
    }

    const product = await Product.findById(productId).populate("manufacturer", "-password -refreshToken");
    if (!product) {
        throw new ApiError(404, "Product not found.");
    } 

    return res
        .status(200)
        .json(new ApiResponse(200, product.currentLocation, "Current Location retrieved successfully"));
})

const updateProductStatus = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { status } = req.body;

    if (!productId || !mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid product ID.");
    }

    if (!status) {
        throw new ApiError(400, "Status is required.");
    }

    const validStatuses = await Product.schema.path('status').enumValues;
    if (!validStatuses.includes(status)) {
        throw new ApiError(400, `Invalid status. Valid statuses are: ${validStatuses.join(", ")}`);
    }

    const product = await Product.findByIdAndUpdate(
        productId,
        { status },
        { new: true, runValidators: true }
    );

    if (!product) {
        throw new ApiError(404, "Product not found.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, product, "Product status updated successfully"));
})

const updateProductDetails = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { productName, description, sku, currentLocation } = req.body;

    if (!productId || !mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid product ID.");
    }

    const updateData = {};
    if (productName) updateData.productName = productName;
    if (description) updateData.description = description;
    if (sku) updateData.sku = sku.toUpperCase();
    if (currentLocation) updateData.currentLocation = currentLocation;

    const product = await Product.findByIdAndUpdate(
        productId,
        updateData,
        { new: true, runValidators: true }
    );

    if (!product) {
        throw new ApiError(404, "Product not found.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, product, "Product details updated successfully"));
})

const markProductAsDamaged = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    if (!productId || !mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid product ID.");
    }

    const product = await Product.findByIdAndUpdate(
        productId,
        { status: "DAMAGED" },
        { new: true, runValidators: true }
    );

    if (!product) {
        throw new ApiError(404, "Product not found.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, product, "Product marked as damaged successfully"));
})

const deleteProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    if (!productId || !mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid product ID.");
    }
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
        throw new ApiError(404, "Product not found.");
    }
    
    return res
        .status(200)
        .json(new ApiResponse(200, null, "Product deleted successfully"));
})

const getAllProducts =asyncHandler(async (req, res) => {
    const products = await Product.find().populate("manufacturer", "-password -refreshToken");
    if (!products || products.length === 0) {
        throw new ApiError(404, "No products found.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, products, "Products retrieved successfully"));
})

const trackProductHistory = asyncHandler(async (req, res) => {
    const { productId} = req.params;
    if (!productId || !mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid product ID.");
    }

    const product = await Product.findById(productId).populate("manufacturer", "-password -refreshToken");
    if (!product) {
        throw new ApiError(404, "Product not found.");
    }   
    
    const history = product.history || [];
    if (history.length === 0) {
        throw new ApiError(404, "No history found for this product.");
    }       
    return res
        .status(200)
        .json(new ApiResponse(200, history, "Product history retrieved successfully"));
})

export {
    createProduct,
    getProductById,
    getManufacturerDetails,
    getCurrentLocation,
    updateProductStatus,
    updateProductDetails,
    markProductAsDamaged,
    deleteProduct
}