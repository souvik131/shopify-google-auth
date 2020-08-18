

import dotenv from "dotenv";
import cache from "../../cache/app"
import  { registerWebhook }  from '@shopify/koa-shopify-webhooks';
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
    const jwtAccessToken = jwt.sign({shop:shop},JWT_SECRET)
    cache.set(shop,{ code, state ,shop, accessToken, _expire, name, url, email })
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
    const registration = await registerWebhook({
      address: `${HOST}/webhooks/products/create`,
      topic: 'PRODUCTS_CREATE',
      accessToken,
      shop,
      apiVersion: ApiVersion.October19
    });

    if (registration.success) {
      console.log('Successfully registered webhook!');
    } else {
      console.log('Failed to register webhook', registration.result);
    }

    ctx.redirect(`https://${shop}.myshopify.com/admin/apps/${APP_NAME}`);
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