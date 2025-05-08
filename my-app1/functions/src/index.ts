// functions/src/index.ts

import * as functions from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import { Auth } from "@auth/core";            // named import
import CredentialsProvider from "@auth/core/providers/credentials"; // example provider

const { secret, trust_host } = functions.config().auth;

export const authHandler = onRequest(async (req, res) => {
  const fetchReq = new Request(req.url, {
    headers: new Headers(req.headers as any),
    method: req.method,
    body: req.rawBody,
  });

  const authRes = await Auth(fetchReq, {
    secret,
    trustHost: true,
    providers: [
      CredentialsProvider({
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
