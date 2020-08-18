import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth from "@shopify/koa-shopify-auth";
import graphQLProxy, { ApiVersion } from "@shopify/koa-shopify-graphql-proxy";
import Koa from "koa";
import next from "next";
import Router from "koa-router";
import { init as routerInit}  from "./router"
import createGoogleAuth from "./auth/createGoogleAuth"
import afterShopifyAuth from "./auth/afterShopifyAuth"

dotenv.config();
const { SHOPIFY_API_SECRET, SHOPIFY_API_KEY, SCOPES ,LISTEN_IP,LISTEN_PORT} = process.env;
const port = parseInt(process.env.PORT, 10) || LISTEN_PORT;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();


(async()=>{
  await app.prepare();
  const server = new Koa();
  const router = new Router();
  server.keys = [SHOPIFY_API_SECRET];
  
  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET,
      scopes: [SCOPES],
      afterAuth:afterShopifyAuth
    })
  );
  createGoogleAuth(server);

  server.use(
    graphQLProxy({
      version: ApiVersion.October19
    })
  );
  routerInit(router,process.env,handle);
  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port,LISTEN_IP, () => console.log(`> Ready on http://${LISTEN_IP}:${port}`));
})();


