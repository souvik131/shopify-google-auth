import  passport from  'koa-passport'
import bodyParser from "koa-bodyparser"
import route from 'koa-route'
import session from "koa-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth2"
import dotenv from "dotenv";
import cache from "../../cache/operator"
import validateRequestAndGetShop from "./jwtAuthenticate"

dotenv.config();
const { GOOGLE_ID,GOOGLE_SECRET,HOST,GOOGLE_SCOPES,SHOPIFY_APP_NAME} = process.env;


const createGoogleAuth=(server)=>{
    server.proxy = true
    server.use(
        session(
            {
                sameSite: "none",
                secure: true
            },
            server
        )
    );
    server.use(bodyParser())
    passport.serializeUser(function(user, done) {
            done(null, user)
    })
    passport.deserializeUser(function(obj, done) {
            done(null, obj)
    })
    passport.use(new GoogleStrategy({
            clientID: GOOGLE_ID,
            clientSecret: GOOGLE_SECRET,
            callbackURL: `${HOST}/auth/google/callback`,
            passReqToCallback   : true
        },
        (request,accessToken,refreshToken,profile,done) =>{
            process.nextTick(async _=> {
                const validatedData = await validateRequestAndGetShop(request)
                if(validatedData.validated){
                    const shop = validatedData.data
                    let cachedData = cache.get(shop)
                    cachedData.googleAccessToken = accessToken
                    cachedData.googleRefreshToken = refreshToken
                    cachedData.profile = profile
                    cache.set(shop,cachedData)
                    console.log("AUTHORIZED GOOGLE",cache.get(shop));
                    return done(null, profile);
                }
                else{
                    return done(validatedData.data, null);
                }
            });
        }
    ))

    server.use(passport.initialize())
    server.use(passport.session())


    //Start Login by redirecting to Google
    server.use(route.get('/auth/google', (ctx,next)=>{
            passport.authenticate("google", {scope: GOOGLE_SCOPES.split(","), authType: 'rerequest', accessType: 'offline', prompt: 'consent', includeGrantedScopes: true})(ctx,next)
    }))

    //Google confirms login
    server.use(route.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/login',
            failureRedirect: '/'
        })
    ))
    
    //Check authentication for all static requests
    const restrictAccess = async(ctx) => {
        if (ctx.isAuthenticated()) {
            const validatedData = await validateRequestAndGetShop(ctx.request)
            if(validatedData.validated){
                const shop = validatedData.data
                ctx.cookies.set("google", "loggedIn", {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none"
                });
                ctx.redirect(`https://${shop}/admin/apps/${SHOPIFY_APP_NAME}/`);
                return
            }
        }
        ctx.redirect(`https://${shop}/admin/apps/${SHOPIFY_APP_NAME}/`);
    };
    server.use(route.get('/login',restrictAccess))


    //Logout google
    server.use(route.get('/logout', async(ctx) => {
        if (ctx.isAuthenticated()) {
            const validatedData = await validateRequestAndGetShop(ctx.request)
            if(validatedData.validated){
                const shop = validatedData.data
                let shopObj = cache.get(shop)
                shopObj.googleAccessToken = undefined
                shopObj.googleRefreshToken = undefined
                shopObj.profile = undefined
                cache.set(shop,shopObj)
                ctx.cookies.set("googleLogin", "loggedOut", {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none"
                });
                ctx.logout()
                ctx.redirect("/");
                return
            }
        }
        ctx.logout()
        ctx.redirect("/")
    }))
}



export default createGoogleAuth;