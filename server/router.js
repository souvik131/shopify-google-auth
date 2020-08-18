
import { verifyRequest } from "@shopify/koa-shopify-auth";
import  {receiveWebhook}  from '@shopify/koa-shopify-webhooks';
import dotenv from "dotenv";
import validateRequestAndGetShop from "./auth/jwtAuthenticate"
import  koaBody from 'koa-body';
dotenv.config();

const { SHOPIFY_API_SECRET_KEY} = process.env;

module.exports={
    init:(router,handle)=>{

        const webhook = receiveWebhook({secret: SHOPIFY_API_SECRET_KEY});

        router.post('/webhooks/products/create', webhook, (ctx) => {
          console.log('received webhook: ', ctx.state.webhook);
        });

        router.post('/getMyShopOrigin', koaBody(),async (ctx) => {
                const validatedData = await validateRequestAndGetShop(ctx.request)
                ctx.body = JSON.stringify(validatedData);
        });

        router.get("*", verifyRequest(), async ctx => {
            await handle(ctx.req, ctx.res);
            ctx.respond = false;
            ctx.res.statusCode = 200;
        });
    }

}

