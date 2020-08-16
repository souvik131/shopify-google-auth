import  passport from  'koa-passport'
// import convert from "koa-convert";
// import session from 'koa-generic-session';
import bodyParser from "koa-bodyparser"
import route from 'koa-route'
import session from "koa-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth2"
import * as config from "../config"
import dotenv from "dotenv";
import * as cacheGoogle from "../cache/google"
dotenv.config();
const { GOOGLE_ID,GOOGLE_SECRET,HOST} = process.env;


const passportAuth=(server)=>{
    server.proxy = true
    server.use(
    //   convert(
          session(
        {
          sameSite: "none",
          secure: true
        },
        server
      )
    //   )
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
            process.nextTick(_=> {
                console.log("AUTHORIZED GOOGLE");
                return done(null, profile);
            });
        }
    ))

    server.use(passport.initialize())
    server.use(passport.session())

    //Start Login by redirecting to Google
    server.use(route.get('/auth/google', passport.authenticate("google", {scope: config.googleScope})))

    //Google confoims login
    server.use(route.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/login',
            failureRedirect: '/'
        })
    ))
    const restrictAccess = (ctx, next) => {
        // if (!ctx.isAuthenticated()) ctx.redirect("/");
        next();
    };
    

    //Check authentication for all static requests
    server.use(route.get('/login',restrictAccess))
    server.use(route.get('/view', restrictAccess))


    //Logout google
    server.use(route.get('/logout', (ctx) => {
            ctx.logout()
            ctx.redirect('/')
    }))
}


export default passportAuth;