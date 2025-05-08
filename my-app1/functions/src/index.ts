import * as functions from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import { Auth } from "@auth/core";
import CredentialsProvider from "@auth/core/providers/credentials";

const cfg = functions.config().auth;
console.log("auth config at startup:", cfg);

export const authHandler = onRequest(async (req, res) => {
  console.log("trust_host flag is:", cfg.trust_host);

  // build a Fetch-style Request for Auth.js
  const fetchReq = new Request(req.url, {
    headers: new Headers(req.headers as any),
    method: req.method,
    body: req.rawBody,
  });

  const authRes = await Auth(fetchReq, {
    secret: cfg.secret,
    // make sure we coerce the string to a boolean:
    trustHost: cfg.trust_host === "true",
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          username: { label: "Username", type: "text" },
          password: { label: "Password", type: "password" }
        },
        authorize: async creds => {
          // your logic…
          return creds.username === "foo" ? { id: "1", name: "Foo" } : null;
        }
      })
    ]
  });

  // forward Auth.js’s response
  res.status(authRes.status);
  authRes.headers.forEach((value, name) => res.setHeader(name, value));
  res.send(await authRes.text());
});
