import  passport from  'koa-passport'
// import convert from "koa-convert";
// import session from 'koa-generic-session';
import bodyParser from "koa-bodyparser"
import route from 'koa-route'
import session from "koa-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth2"
import * as config from "../config"
import dotenv from "dotenv";
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
    function(request,accessToken,refreshToken,profile,done) {
        process.nextTick(function () {
            console.log("AUTHORIZED GOOGLE");
            console.log(profile)
            console.log(accessToken)
            return done(null, profile);
        });
    }
    ))
    server.use(passport.initialize())
    server.use(passport.session())
    server.use(route.post('/api/*', function(ctx, next) {
        if (ctx.isAuthenticated()) {
            return next()
        } else {
            ctx.redirect('/')
        }
    }))
    // server.use(route.get('/main', function(ctx) {
    //     if (!ctx.isAuthenticated()) {
    //         ctx.redirect('/')
    //     }
    // }))
    server.use(route.get('/logout', function(ctx) {
            ctx.logout()
            ctx.redirect('/')
    }))
    server.use(route.get('/auth/google', passport.authenticate("google", {scope: config.googleScope})))
    server.use(route.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/main',
            failureRedirect: '/'
        })
    ))
    // // Require authentication for now
    // server.use(function(ctx, next) {
    //     if (ctx.isAuthenticated()) {
    //         return next()
    //     } else {
    //         ctx.redirect('/')
    //     }
    // })
}


export default passportAuth;