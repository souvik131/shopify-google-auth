
import { verifyRequest } from "@shopify/koa-shopify-auth";
import  {receiveWebhook}  from '@shopify/koa-shopify-webhooks';
import dotenv from "dotenv";
import validateRequestAndGetShop from "./auth/jwtAuthenticate"
import  koaBody from 'koa-body';
import cache from "../cache/operator"
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

        router.post('/checkGoogleLogin', koaBody(),async (ctx) => {
            const validatedData = await validateRequestAndGetShop(ctx.request)
            if(validatedData.validated){
                console.log(validatedData.data)
                const shopObj = cache.get(validatedData.data)
                console.log(shopObj)
                if(shopObj&&shopObj.googleRefreshToken){
                    ctx.cookies.set("googleLogin", "loggedIn", {
                        httpOnly: true,
                        secure: true,
                        sameSite: "none"
                    });
                    ctx.body = JSON.stringify({loggedIn:true});
                    return
                }
            }
            ctx.cookies.set("googleLogin", "loggedOut", {
                httpOnly: true,
                secure: true,
                sameSite: "none"
            });
            ctx.body = JSON.stringify({loggedIn:false});
        });


        router.get("*", verifyRequest(), async ctx => {
            await handle(ctx.req, ctx.res);
            ctx.respond = false;
            ctx.res.statusCode = 200;
        });
    }

}

