import express ,  { Request, Response } from "express";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../db";
import { z } from "zod";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET!;
const SECRET_KEY = process.env.SECRET_KEY!;

const router = express.Router();

//Sign- Up Route 
const signupBody = z.object({
    username:z.string(),
    email: z.string().email(),
    password: z.string(),
    role: z.string(),
    secretKey: z.string().optional()
})


router.post("/signup", async(req :Request, res:Response)=> {
    const parsed = signupBody.safeParse(req.body);

    if(!parsed.success) {
        return res.status(400).json({ error : parsed.error })
    }

    const { username, email, password , role , secretKey} = parsed.data; //directly accesing the value of these para by req
    
    
     try {
        //checking if user existing or not?
        const existingUser =  await User.findOne({
            $or : [{username}, {email}]
        })
        console.log(existingUser);

        if(existingUser) {
          return  res.status(400).json({ error : "Username already taken" });
    }

    //continue logic: hasshed password, save user 
    const hashedPassword = await bcrypt.hash(password,10);


    //Create User with role 
    const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        role: role || 'user'  //Default to user if not specified 
    })


    const token = jwt.sign(
        {userId: newUser._id, username: newUser.username },
         JWT_SECRET ,
        {expiresIn: "1h"}
    );

     if (role === 'user') {
            res.status(201).json({
                message: "User account creared suucessfully",
                token,
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    role: newUser.role
                },
                redirectTo: '/'
            })
        }
} 
 catch (error) {
        console.error("error");
        res.status(500).json({ error : "Server error"})
     }
})



//Sign-In Route 
const signinBody = z.object({
    username: z.string(),
    password: z.string(),
    role: z.string()
})

router.post('/signin', async (req :Request, res:Response)=> {
    const parsed = signinBody.safeParse(req.body);
    console.log("Request Body", req.body)
    if(!parsed.success){
        return res.status(401).json({error: parsed.error})
    }

    const {username, password,   role } = parsed.data;
    


    try {
        const user = await User.findOne({ username });
        if(!user) {
           return  res.status(400).json({ error : "Invalid Credentials" });
        }
          const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Password credentials" });
        }

        const token = jwt.sign(
            { userId: user._id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
        });

        
    } catch (error) {
        res.status(201).json({error: "Not found auny user"})
    }
})

export default router;