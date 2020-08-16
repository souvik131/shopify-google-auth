
import { verifyRequest } from "@shopify/koa-shopify-auth";
import * as cacheShopify from "../cache/shopify"
import  {receiveWebhook}  from '@shopify/koa-shopify-webhooks';

module.exports={
    init:(router,{SHOPIFY_API_SECRET_KEY,SHOP,APP_NAME},handle)=>{

        const webhook = receiveWebhook({secret: SHOPIFY_API_SECRET_KEY});

        router.post('/webhooks/products/create', webhook, (ctx) => {
          console.log('received webhook: ', ctx.state.webhook);
        });

        router.get("/_next/static/*", verifyRequest(), async ctx => {
            await handle(ctx.req, ctx.res);
            ctx.respond = false;
            ctx.res.statusCode = 200;
        });

        router.get("/app/login", verifyRequest(), async ctx => {
            await handle(ctx.req, ctx.res);
            ctx.redirect(`https://${SHOP}.myshopify.com/admin/apps/${APP_NAME}/app/view`);
        });

        router.get("*", verifyRequest(), async ctx => {
            await handle(ctx.req, ctx.res);
            if(ctx.query.shop){
                const {session,locale} = ctx.query
                let shopObject = cacheShopify.get(ctx.query.shop)
                shopObject.session = session
                shopObject.locale = locale
                cacheShopify.set(ctx.query.shop,shopObject)
                console.log(shopObject)
            }
            ctx.respond = false;
            ctx.res.statusCode = 200;
        });
    }

}