import express ,  { Request, Response } from "express";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Admin } from "../db";
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

    const { username, email, password , role , secretKey} = parsed.data;

     if(role=== 'admin') {
            if(!secretKey || secretKey !== SECRET_KEY) {
                return res.status(401).json({
                    error : "Invalid or missing Secret key"
                })
            }
        }
      const existingUser =  await Admin.findOne({
                $or : [{username}, {email}]
            })
            console.log(existingUser);
    
            if(existingUser) {
                return  res.status(400).json({ error : "Username already taken" });
        }
    
        //continue logic: hasshed password, save user 
        const hashedPassword = await bcrypt.hash(password,10);

            //Create Admin with role 
            const newAdmin = await Admin.create({
                username,
                email,
                password: hashedPassword,
                role: role || "admin"  //Default to user if not specified 
            })
        
        
            const token = jwt.sign(
                {userId: newAdmin._id, username: newAdmin.username },
                 JWT_SECRET ,
                {expiresIn: "1h"}
            );
             if (role === 'admin') {
            res.status(201).json({
                message: "Admin account created successfully",
                token,
                user: {
                    id: newAdmin._id,
                    username: newAdmin.username,
                    role: newAdmin.role
                },
                redirectTo: '/admin/create-event'
            });
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
        const admin = await Admin.findOne({ username });
        if(!admin) {
           return  res.status(400).json({ error : "Invalid Credentials" });
        }
          const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Password credentials" });
        }

        const token = jwt.sign(
            { userId: admin._id, username: admin.username, role: admin.role },
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