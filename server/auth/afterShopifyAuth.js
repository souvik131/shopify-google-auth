

import dotenv from "dotenv";
import cache from "../../cache/app"
import  { registerWebhooks}  from '../handlers/register-webhooks';
import  { ApiVersion } from "@shopify/koa-shopify-graphql-proxy";
import jwt from 'jsonwebtoken'
import getSubscriptionUrl  from '../handlers/mutations/get-subscription-url';

dotenv.config();
const { HOST,JWT_SECRET,APP_NAME} = process.env;

async function afterShopifyAuth(ctx) {
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

export default afterShopifyAuth