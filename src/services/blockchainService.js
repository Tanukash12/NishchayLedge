
import { ethers } from "ethers"; 
import dotenv from "dotenv";
dotenv.config(path, "../.env"); 


const BLOCKCHAIN_RPC_URL = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:7545"; // e.g., Ganache default
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; // The address where your ProductTracker.sol is deployed
const PRIVATE_KEY = process.env.PRIVATE_KEY; // A private key of an account on your blockchain network (e.g., Ganache account) that will send transactions. NEVER use real keys in public code!
// 🚨 IMPORTANT: Replace with the actual ABI of your deployed ProductTracker.sol contract
// You'll get this JSON array after compiling your Solidity contract (e.g., from Remix, Hardhat, Truffle build artifacts)
const CONTRACT_ABI = [
    // Example ABI snippet - REPLACE WITH YOUR ACTUAL ProductTracker.sol ABI
    {
        "inputs": [
            { "internalType": "string", "name": "_productId", "type": "string" },
            { "internalType": "string", "name": "_eventType", "type": "string" },
            { "internalType": "string", "name": "_location", "type": "string" },
            { "internalType": "string", "name": "_description", "type": "string" },
            { "internalType": "bytes32", "name": "_qrCodeHash", "type": "bytes32" } // Add this if you pass qrCodeHash to blockchain event
        ],
        "name": "recordProductEvent",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "string", "name": "_productId", "type": "string" }
        ],
        "name": "getProductEvents",
        "outputs": [
            {
                "components": [
                    { "internalType": "string", "name": "eventType", "type": "string" },
                    { "internalType": "string", "name": "location", "type": "string" },
                    { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
                    { "internalType": "string", "name": "description", "type": "string" },
                    { "internalType": "address", "name": "actorAddress", "type": "address" },
                    { "internalType": "bytes32", "name": "dataHash", "type": "bytes32" } // Or qrCodeHash if you track that directly
                ],
                "internalType": "struct ProductTracker.ProductEventStruct[]",
                "name": "",
                "type": "array"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    // Add other functions like verifyQRCodeHash from your ProductTracker.sol ABI
    {
        "inputs": [
            { "internalType": "bytes32", "name": "_qrCodeHash", "type": "bytes32" }
        ],
        "name": "verifyQRCodeHash",
        "outputs": [
            { "internalType": "bool", "name": "", "type": "bool" },
            { "internalType": "string", "name": "", "type": "string" } // Or string productId if it returns it
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// Setup Provider and Signer
const provider = new ethers.JsonRpcProvider(BLOCKCHAIN_RPC_URL);
// A wallet needed to sign transactions
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
// The contract instance to interact with
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

// =========================================================================
// Function to record an event on the blockchain
// =========================================================================
export const recordEventOnBlockchain = async (
    productId,
    eventType,
    location,
    description,
    qrCodeHash // The QR code hash associated with the event
) => {
    try {
        // The contract function expects bytes32 for qrCodeHash
        // Ensure qrCodeHash is exactly 32 bytes or convert it correctly.
        // For simplicity, if your qrCodeHash is a string, you might hash it or pad it.
        // Example: ethers.utils.id("your_string_hash") will convert to bytes32
        const hashBytes32 = ethers.keccak256(ethers.toUtf8Bytes(qrCodeHash));

        const tx = await contract.recordProductEvent(
            productId,
            eventType,
            location,
            description,
            hashBytes32 // Pass the bytes32 version of your QR code hash
        );
        await tx.wait(); // Wait for the transaction to be mined
        console.log(`Blockchain event recorded for product ${productId}. Tx Hash: ${tx.hash}`);
        return tx.hash; // Return the transaction hash for logging in MongoDB
    } catch (error) {
        console.error(`Error recording event for product ${productId} on blockchain:`, error);
        throw new Error("Failed to record event on blockchain.");
    }
};

// =========================================================================
// Function to get events from the blockchain
// =========================================================================
export const getEventsFromBlockchain = async (productId) => {
    try {
        const events = await contract.getProductEvents(productId);
        // Map the raw blockchain event data to a more readable format
        return events.map(event => ({
            eventType: event.eventType,
            location: event.location,
            timestamp: new Date(Number(event.timestamp) * 1000), // Convert Unix timestamp to Date object
            description: event.description,
            actorAddress: event.actorAddress,
            dataHash: event.dataHash // Or qrCodeHash
        }));
    } catch (error) {
        console.error(`Error getting events for product ${productId} from blockchain:`, error);
        return []; // Return empty array if retrieval fails
    }
};

// =========================================================================
// Function to verify QR code hash on blockchain (used by Java Robot via Express)
// =========================================================================
export const verifyQRCodeOnBlockchain = async (qrCodeHash) => {
    try {
        const hashBytes32 = ethers.keccak256(ethers.toUtf8Bytes(qrCodeHash));
        const [isValid, productId] = await contract.verifyQRCodeHash(hashBytes32);
        return { isValid, productId };
    } catch (error) {
        console.error(`Error verifying QR code hash ${qrCodeHash} on blockchain:`, error);
        return { isValid: false, productId: null };
    }
};