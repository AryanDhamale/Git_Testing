import express from 'express'
import jwt from 'jsonwebtoken'
import cors from 'cors'

const PORT=process.env.port || 8080 ;
const app = express();
const SECREAT_KEY = crypto.randomUUID();


const verify = (req,res,next)=>{
    let token = req.get('Authorization') ; 
    if(typeof token == 'undefined') {
        return res.status(401).json({error:'Unauthrozied!'});
    };

    token =  token.split(' ')[1];
    
    jwt.verify(token,SECREAT_KEY,(err,decoded)=>{
        if(err) {
            return res.status(401).json({error:'Unauthrozied!'});
        }
        req.userId=decoded?.userId;
        next();
    })
}

const start=()=>{

    // middleware //
    app.use(express.json());
    app.use(cors());

    // for testing // 
    app.get('/',(req,res)=>{
        res.send('Here we are going!');
    })

    // validate user credential // 

    const fakeUser = {
        name :  'coldmon',
        id : 1, 
        password :  '12345'
    }
    
    app.post('/login',(req,res)=>{
        try
        {
            const {username,id,password}=req.body;
            if (typeof username=='undefined' || typeof id =='undefined' || typeof password == 'undefined') {
                return res.status(400).json({error:'all credentials are required!'});
            }
            
            if(fakeUser.name!=username || fakeUser.id!=id || fakeUser.password !=password) {
                return res.status(401).json({error:'Unauthorized! '});
            }

            const payload = {userId:id,iat: Math.floor(Date.now()/1000)+1*60} ;
            jwt.sign(payload,SECREAT_KEY,(err,token)=>{
                if(err) {
                    throw new Error('Some thing went wrong while genrating token!');
                }

                return res.status(200).json({token});
            })

        }catch(err){
            return res.status(503).json({error:err?.message});
        }
    });

    // creating proteced route // 
    app.post('/protected',verify,(req,res)=>{
        res.status(200).json({message:'you can accessed'});
    })


    app.listen(PORT,(err)=>{
        if (err) {
            console.log(err?.message);
            process.exit(1);
        }
        console.log(`Listening at portno : ${PORT}`);
    })
}

start();

