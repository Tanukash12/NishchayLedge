import mongoose, {Schema} from "mongoose";

const productSchema = new Schema(
    {
        productName: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
        },
        sku: {
            type: String,
            required: true,
            unique: true,
            index: true,
            uppercase: true,
        },
        manufacturer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        currentLocation: {
            type: String,
            required: true,
            default: "factory",

        },
        status: {
            type: String,
            enum: ["CREATED", "IN_TRANSIT", "AT_WAREHOUSE", "DELIVERED", "RECALLED", "DAMAGED"],
            default: "CREATED",
        },
        qrCodeHash: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        qrCodeHash: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        qrCodeUrl: {
            type: String,
            required: true,
        },
        blockchainAddress: {
            type: String,
            default: null
        }

    }, {timestamps: true});

export const Product = mongoose.model("Product", productSchema)