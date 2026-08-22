import type { Model } from "mongoose";
import * as modeldata from "../admin/model.register.js";

// Accepts either string or object for identifier
type Identifier = string | Record<string, any>;

async function login(
    model: keyof typeof modeldata.models, // TS now knows only valid models can be used
    uniqueIdentifier: Identifier,
    password: string
) {
    const Model: Model<any> = modeldata.models[model]; // cast to Model<any> to avoid TS errors
    if (!Model) {
        throw new Error("Model not found");
    }

    // If uniqueIdentifier is a string, assume it's an 'id' search
    const query = typeof uniqueIdentifier === "string"
        ? { id: uniqueIdentifier }
        : uniqueIdentifier;

    const user = await Model.findOne(query);
    if (!user) {
        throw new Error("User not found");
    }

    // Check password
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new Error("Password is not correct");
    }

    // Generate token
    const token = user.generateAccessToken();

    if (!token) {
        throw new Error("Token not generated");
    }
    return token;
}


export { login }
