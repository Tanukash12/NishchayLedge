// NishchayLedge/src/models/user.model.js

import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true, 
            lowercase: true,
            trim: true,
            index: true 
        },
        
        email: {
            type: String,
            required: true,
            unique: true, 
            lowercase: true,
            trim: true,
        },
       
        password: {
            type: String,
            required: [true, "Password is required"], // Make sure password is never empty
            minlength: [6, "Password must be at least 6 characters long"] 
        },
        
        role: {
            type: String,
            enum: ["manufacturer", "logistics", "inspector", "consumer"],
            default: "consumer" 
        },
        
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true 
    }
);

// Mongoose pre-save hook to hash password before saving
userSchema.pre("save", async function (next) {
    // Only hash password if it's new or has been modified
    if (!this.isModified("password")) {
        return next();
    }
    // Hash the password with a salt round of 10
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Custom method to compare provided password with the hashed password in DB
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Custom method to generate an Access Token for authentication
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            role: this.role // Include role in token for authorization middleware
        },
        process.env.ACCESS_TOKEN_SECRET || "default_access_secret", // Use env variable, provide fallback
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" // Use env variable, provide fallback
        }
    );
};

// Custom method to generate a Refresh Token (for token renewal)
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret", // Use env variable, provide fallback
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" // Use env variable, provide fallback
        }
    );
};

// Export the User model
export const User = mongoose.model("User", userSchema);