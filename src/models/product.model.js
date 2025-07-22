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
            trim: true
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
            default: "Factory",

        },
        isActive: {
            type: Boolean,
            default: true,
        },
        status: {
            type: String,
            enum: ["CREATED", "IN_TRANSIT", "AT_WAREHOUSE", "DELIVERED", "RECALLED", "DAMAGED"],
            default: "CREATED",
        },
        history: {
            type: [{
                status: {
                    type: String,
                    enum: ["CREATED", "IN_TRANSIT", "AT_WAREHOUSE", "DELIVERED", "RECALLED", "DAMAGED"],
                    default: "CREATED",
                },
                timestamp: {
                    type: Date,
                    default: Date.now
                },
                blockchainTxHash: {
                    type: String,
                    default: null
                }
            }],
            default: []
        },
        qrCodeHash: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        qrCodeUrl: {
            type: String,
            required: false, 
            default: null 
        },
        blockchainAddress: {
            type: String,
            default: null
        }

    }, {timestamps: true});

export const Product = mongoose.model("Product", productSchema)