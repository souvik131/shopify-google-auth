

import dotenv from "dotenv";
import fs from 'fs';
import path from "path";
dotenv.config();
const { CACHE_FILE_NAME} = process.env;


let inMemory = JSON.parse(fs.readFileSync(path.resolve(__dirname, CACHE_FILE_NAME)));

const env = process.env.NODE_ENV=== "production"?process.env.NODE_ENV:"development"

module.exports = {
    set:(key,data)=>{
        console.log(`Saving cache data for ${key}`)
        inMemory[env][key]=data
        fs.writeFileSync(path.resolve(__dirname, CACHE_FILE_NAME), JSON.stringify(inMemory));
    },
    get:(key)=>{
        console.log(`Reading cache data for ${key}`)
        return inMemory[env][key]
    }
}

