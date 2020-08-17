
import { verifyRequest } from "@shopify/koa-shopify-auth";
import  {receiveWebhook}  from '@shopify/koa-shopify-webhooks';
import  koaBody from 'koa-body';

module.exports={
    init:(router,{SHOPIFY_API_SECRET_KEY,SHOP,APP_NAME},handle)=>{

        const webhook = receiveWebhook({secret: SHOPIFY_API_SECRET_KEY});

        router.post('/webhooks/products/create', webhook, (ctx) => {
          console.log('received webhook: ', ctx.state.webhook);
        });

        router.post('/init', koaBody(),(ctx) => {
                // => POST body
                
                ctx.body = JSON.stringify(ctx.request.headers.cookie.split('; ').reduce((prev, current) => {
                    const [name, value] = current.split('=');
                    prev[name] = value;
                    return prev
                  }, {}));
        });

        router.get("*", verifyRequest(), async ctx => {
            await handle(ctx.req, ctx.res);
            ctx.respond = false;
            ctx.res.statusCode = 200;
        });
    }

}