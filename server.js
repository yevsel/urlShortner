const express = require('express')
const mongoose = require('mongoose')
const dns = require('dns')
const shortID = require('shortid')
const bodyParser = require('body-parser')
const url = require('url')

// Server
const app = express()

// DB
const DB = process.env.MONGO_URI
// DB schema
const urlSchema = new mongoose.Schema({
    original_url:{
        type:String,
        required:true
    },
    short_url:{
        type:String,
        required:true,
        default:()=>shortID.generate()
    }
})

const urlModel = mongoose.model('urlshortener',urlSchema)

// Middleware
app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}))

// DB connect
mongoose.connect(DB,()=>{
    console.log("DB is live....")
})


// Routes
app.post('/api/shorturl', (req,res)=>{
    try{
        const reqBody = req.body.url

	//Check if url exists
        dns.lookup(url.parse(reqBody).hostname,async (err,data)=>{
            if(err){
                return res.json({"error":"invalid url"})
            }
            const result = await urlModel.create({original_url:reqBody})
            res.json({
                original_url:result.original_url,
                short_url:result.short_url
            })
        })
    }catch(error){
        console.error(error)
    }
})

app.get('/api/shorturl/:short_url',async (req,res)=>{
    try{
        const result = await urlModel.findOne({short_url:req.params.short_url})
        if(result==null) return res.sendStatus(404)
        
        res.redirect(`https://www.${result.original_url}`)

    }catch(error){
        console.error(error)
    }
})



const PORT = process.env.PORT || 3000
// Listening
app.listen(PORT,()=>{
    console.log('Server listening....')
})