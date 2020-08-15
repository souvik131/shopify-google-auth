import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth from "@shopify/koa-shopify-auth";
import graphQLProxy, { ApiVersion } from "@shopify/koa-shopify-graphql-proxy";
import Koa from "koa";
import next from "next";
import Router from "koa-router";
import session from "koa-session";
import * as handlers from "./handlers/index";
import * as cacheShopify from "../cache/shopify"
import { init as routerInit}  from "../routers/app"
import * as config from  "../config"

dotenv.config();
const port = parseInt(process.env.PORT, 10) || config.port;
const host = config.host
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const { SHOPIFY_API_SECRET, SHOPIFY_API_KEY, SCOPES } = process.env;



(async()=>{
  await app.prepare();
  const server = new Koa();
  const router = new Router();
  server.use(
    session(
      {
        sameSite: "none",
        secure: true
      },
      server
    )
  );
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
  server.listen(port,host, () => console.log(`> Ready on http://${host}:${port}`));
})();


async function afterAuth(ctx) {
  //Auth token and shop available in session
  //Redirect to shop upon auth
  const { code,state } = ctx.query
  const { shop, accessToken, _expire } = ctx.session;
  const { name,url,email } = await getProfile(shop,accessToken);
  cacheShopify.set(shop,{ code, state ,shop, accessToken, _expire, name, url, email })

  ctx.cookies.set("shopOrigin", shop, {
    httpOnly: false,
    secure: true,
    sameSite: "none"
  });
  ctx.redirect("/");
}


async function getProfile(shop,accessToken){
  return new Promise(async (resolve,reject) => {
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
        resolve(profile.data.shop)
  })
}
