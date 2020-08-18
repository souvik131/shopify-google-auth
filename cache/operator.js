

const fs = require('fs');
const FILE_NAME = 'data.json'
let inMemory = JSON.parse(fs.readFileSync(FILE_NAME));

const env = process.env.NODE_ENV=== "production"?process.env.NODE_ENV:"development"

module.exports = {
    set:(key,data)=>{
        console.log(`Saving cache data for ${key}`)
        inMemory[env][key]=data
        fs.writeFileSync(FILE_NAME, JSON.stringify(inMemory));
    },
    get:(key)=>{
        console.log(`Reading cache data for ${key}`)
        return inMemory[env][key]
    }
}

