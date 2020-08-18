
import dotenv from "dotenv";
import jwt from 'jsonwebtoken'
dotenv.config();
const { JWT_SECRET} = process.env;




function verifyJWT(jwtAccessToken,JWT_SECRET){
    return new Promise(async(resolve,reject)=>{
        jwt.verify(jwtAccessToken,JWT_SECRET,(err,shop)=>{
            if(err) reject(err)
            resolve(shop)
        })
    })

}


function validateRequestAndGetShop(request){
    return new Promise(async (resolve,reject)=>{
        
        const cookies = request.headers.cookie.split('; ').reduce((prev, current) => {
            const [name, value] = current.split('=');
            prev[name] = value;
            return prev
        }, {})
        const { jwtAccessToken } = cookies
        if(jwtAccessToken){
            try{
                const shopObj = await verifyJWT(jwtAccessToken,JWT_SECRET)
                resolve({validated:true,data:shopObj.shop})
            }
            catch(e){
                reject({validated:false,data:e})
            }
        }
        else{
            reject({validated:false,data:{message:"No JWT Token"}})
        }
    })
}

export default validateRequestAndGetShop