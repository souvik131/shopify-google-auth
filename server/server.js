import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth from "@shopify/koa-shopify-auth";
import graphQLProxy, { ApiVersion } from "@shopify/koa-shopify-graphql-proxy";
import Koa from "koa";
import next from "next";
import Router from "koa-router";
import { init as routerInit}  from "./router"
import cache from "../cache/app"
import createGoogleAuth from "./auth/createGoogleAuth"
import  { registerWebhooks}  from './handlers/register-webhooks';
import jwt from 'jsonwebtoken'
const getSubscriptionUrl = require('./handlers/mutations/get-subscription-url');


dotenv.config();
const { SHOPIFY_API_SECRET, SHOPIFY_API_KEY, SCOPES ,HOST,JWT_SECRET,APP_NAME,LISTEN_IP,LISTEN_PORT} = process.env;
const port = parseInt(process.env.PORT, 10) || LISTEN_PORT;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();


(async()=>{
  await app.prepare();
  const server = new Koa();
  const router = new Router();
  createGoogleAuth(server);
  server.keys = [SHOPIFY_API_SECRET];
  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET,
      scopes: [SCOPES],
      afterAuth:afterAuth
    })
  );

  server.use(
    graphQLProxy({
      version: ApiVersion.October19
    })
  );
  routerInit(router,handle);
  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port,LISTEN_IP, () => console.log(`> Ready on http://${LISTEN_IP}:${port}`));
})();


async function afterAuth(ctx) {
  //Auth token and shop available in session
  //Redirect to shop upon auth
  const { code,state } = ctx.query
  const { shop, accessToken, _expire } = ctx.session;
  const { name,url,email } = await getProfile(shop,accessToken);
  cache.set(shop,{ code, state ,shop, accessToken, _expire, name, url, email })
  const jwtAccessToken = jwt.sign({shop:shop},JWT_SECRET)
  ctx.cookies.set("jwtAccessToken", jwtAccessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });
  ctx.cookies.set("shopOrigin", shop, {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });

  await registerWebhooks(
    shop,
    accessToken,
    'PRODUCTS_CREATE',
    `${HOST}/webhooks/products/create`,
    ApiVersion.October19
  ) 

  ctx.redirect(`https://${shop}/admin/apps/${APP_NAME}`);
  // await getSubscriptionUrl(ctx, accessToken, shop);
  // ctx.redirect("/");
}


async function getProfile(shop,accessToken){
    let reqUrl=`https://${shop}/admin/api/graphql.json`
    let result = await fetch(reqUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token":accessToken
      },
      body: JSON.stringify({
        query: `{
            shop {
              name
              url
              email
            }
          }`
      })
    })
    const profile = await result.json()
    return profile.data.shop
}