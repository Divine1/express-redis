const express = require("express")
const fetch=require("node-fetch")
const redis = require("redis")

const app = express()

const client = redis.createClient(6379)

const setResponse = (userid,data)=>{
    console.log("in setResponse")
    return `iam ${userid} with public repos ${data}`
}
const cache = (req,res,next)=>{
    console.log("in cache")
    let userid = req.params.userid

    client.get(userid,(err,data)=>{
        if(err) throw err 

        if(data !=null){
            console.log("data not null")
            res.send(setResponse(userid,data))
        }
        else{
            console.log("data is null")
            next()
        }
    })
}

app.get("/users/:userid",cache,async (req,res)=>{
    let userid = req.params.userid

    let response=await fetch(`https://api.github.com/users/${userid}`)
    let json = await response.json()
    //console.log("json ",json)
    let public_repos = json.public_repos
    console.log("public_repos ",public_repos)
    client.setex(userid,3600,public_repos)
    res.send(setResponse(userid,public_repos))
})


app.listen(4000,()=>{
    console.log("nodejs server running on port 4000")
})


