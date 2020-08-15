
import { verifyRequest } from "@shopify/koa-shopify-auth";
import * as cacheShopify from "../cache/shopify"

module.exports={
    init:(router,handle)=>{
        router.get("/_next/static/*", verifyRequest(), async ctx => {
            await handle(ctx.req, ctx.res);
            ctx.respond = false;
            ctx.res.statusCode = 200;
        });
        router.get("/", verifyRequest(), async ctx => {
            await handle(ctx.req, ctx.res);
            if(ctx.query.shop){
                const {session,locale} = ctx.query
                let shopObject = cacheShopify.get(ctx.query.shop)
                shopObject.session = session
                shopObject.locale = locale
                cacheShopify.set(ctx.query.shop,shopObject)
            }
            ctx.respond = false;
            ctx.res.statusCode = 200;
        });
    }

}