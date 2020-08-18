import  passport from  'koa-passport'
import bodyParser from "koa-bodyparser"
import route from 'koa-route'
import session from "koa-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth2"
import dotenv from "dotenv";
import cache from "../../cache/app"
import validateRequestAndGetShop from "./jwtAuthenticate"
dotenv.config();
const { GOOGLE_ID,GOOGLE_SECRET,HOST,GOOGLE_SCOPES} = process.env;


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
                    cachedData.accessToken = accessToken
                    cachedData.refreshToken = refreshToken
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
            const validatedData = await validateRequestAndGetShop(request)
            if(validatedData.validated){
                const shop = validatedData.data
                ctx.redirect(`https://${shop}/admin/apps/${APP_NAME}/view`);
                return
            }
        }
        ctx.redirect("/");
    };
    server.use(route.get('/login',restrictAccess))


    //Logout google
    server.use(route.get('/logout', (ctx) => {
            ctx.logout()
            ctx.redirect('/')
    }))
}



export default createGoogleAuth;