let inMemory = {
    "development":{
        'the-uncurbed.myshopify.com':{
            code: '92b36dbcbc603b7784e0c484b316a4d4',
            state: '159751774501400',
            shop: 'the-uncurbed.myshopify.com',
            accessToken: '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',
            _expire: 1597604039478,
            name: 'The Uncurbed',
            url: 'https://the-uncurbed.myshopify.com',
            email: 'souvik131@gmail.com',
            session: 'd7641a5380a7457e6caf27ef9dddfe26085a73198ac3c72f7153d59111088344',
            locale: 'en'
        }
    },
    "production":{
        'the-uncurbed.myshopify.com':{
            code: 'eaffaec329fc8186af010a981dade149',
            state: '159751832112200',
            shop: 'the-uncurbed.myshopify.com',
            accessToken: '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',
            _expire: 1597604528693,
            name: 'The Uncurbed',
            url: 'https://the-uncurbed.myshopify.com',
            email: 'souvik131@gmail.com',
            session: 'd7641a5380a7457e6caf27ef9dddfe26085a73198ac3c72f7153d59111088344',
            locale: 'en'
        }
    }
}
const env = process.env.NODE_ENV=== "production"?process.env.NODE_ENV:"development"

module.exports = {
    set:(key,data)=>{
        console.log(`Saving cache data for ${key}`)
        inMemory[env][key]=data
    },
    get:(key)=>{
        console.log(`Reading cache data for ${key}`)
        return inMemory[env][key]
    }
}