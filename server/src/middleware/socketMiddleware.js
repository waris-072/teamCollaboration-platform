import jwt from "jsonwebtoken";
import User from "../models/User.js";

function getTokenFromCookie(socket) {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
        return null;
    }

    const cookies = cookieHeader.split(";");
    for (const cookie of cookies) {
        const [name, ...valueParts] = cookie.trim().split("=");

        if (name === "token") {
            return decodeURIComponent(valueParts.join("="));
        }
    }
    return null;
}

export async function socketMiddleware(socket, next) {
    try {
        const token = getTokenFromCookie(socket);
        if (!token) {
            return next(new Error("Authentication required."));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return next(new Error("User not found."));
        }

        if (!user.isActive) {
            return next(new Error("User account is inactive."));
        }

        socket.user = user;
        next();
    } catch (error) {
        next(new Error("Invalid or expired token."));
    }
}