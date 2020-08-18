import  passport from  'koa-passport'
import bodyParser from "koa-bodyparser"
import route from 'koa-route'
import session from "koa-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth2"
import * as config from "../config"
import dotenv from "dotenv";
import * as cache from "../cache/app"
dotenv.config();
const { GOOGLE_ID,GOOGLE_SECRET,HOST,JWT_SECRET} = process.env;


const passportAuth=(server)=>{
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
                console.log(request.headers.cookie)
                const cookies = request.headers.cookie.split('; ').reduce((prev, current) => {
                    const [name, value] = current.split('=');
                    prev[name] = value;
                    return prev
                  }, {})
                const { jwtAccessToken } = cookies
                if(jwtAccessToken){
                  try{
                    const shopObj = await verifyJWT(jwtAccessToken,JWT_SECRET)
                    let cachedData = cache.get(shopObj.shop)
                    cachedData.accessToken = accessToken
                    cachedData.refreshToken = refreshToken
                    cachedData.profile = profile
                    cache.set(shopObj.shop,cachedData)
                    console.log("AUTHORIZED GOOGLE",cache.get(shopObj.shop));
                    return done(null, profile);
                  }
                  catch(e){
                    return done(e, null);
                  }
                }
                else{
                    return done({message:"No JWT Token"}, null);
                }
            });
        }
    ))

    server.use(passport.initialize())
    server.use(passport.session())


    //Start Login by redirecting to Google
    server.use(route.get('/auth/google', (ctx,next)=>{
            passport.authenticate("google", {scope: config.googleScope, authType: 'rerequest', accessType: 'offline', prompt: 'consent', includeGrantedScopes: true})(ctx,next)
    }))

    //Google confirms login
    server.use(route.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/login',
            failureRedirect: '/'
        })
    ))
    
    //Check authentication for all static requests
    const restrictAccess = (ctx) => {
        if (!ctx.isAuthenticated()) {
            ctx.redirect("/");
        }
        else{
            ctx.redirect("/view");
        }
        // next();
    };
    server.use(route.get('/login',restrictAccess))


    //Logout google
    server.use(route.get('/logout', (ctx) => {
            ctx.logout()
            ctx.redirect('/')
    }))
}

function verifyJWT(jwtAccessToken,JWT_SECRET){
    return new Promise(async(resolve,reject)=>{
        jwt.verify(jwtAccessToken,JWT_SECRET,(err,shop)=>{
        if(err) reject(err)
        resolve(shop)
        })
    })

}

export default passportAuth;