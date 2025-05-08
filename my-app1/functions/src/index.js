"use strict";
// functions/src/index.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authHandler = void 0;
const functions = __importStar(require("firebase-functions"));
const https_1 = require("firebase-functions/v2/https");
const core_1 = require("@auth/core"); // named import
const credentials_1 = __importDefault(require("@auth/core/providers/credentials")); // example provider
const { secret, trust_host } = functions.config().auth;
exports.authHandler = (0, https_1.onRequest)(async (req, res) => {
    const fetchReq = new Request(req.url, {
        headers: new Headers(req.headers),
        method: req.method,
        body: req.rawBody,
    });
    const authRes = await (0, core_1.Auth)(fetchReq, {
        secret,
        trustHost: trust_host === "true",
        providers: [
            (0, credentials_1.default)({
                name: "Credentials",
                credentials: {
                    username: { label: "Username", type: "text" },
                    password: { label: "Password", type: "password" }
                },
                authorize: async (creds) => {
                    if (creds.username === "foo" && creds.password === "bar") {
                        return { id: "1", name: "Foo" };
                    }
                    return null;
                }
            }),
        ],
    });
    res.status(authRes.status);
    authRes.headers.forEach((value, name) => {
        res.setHeader(name, value);
    });
    const bodyText = await authRes.text();
    res.send(bodyText);
});
