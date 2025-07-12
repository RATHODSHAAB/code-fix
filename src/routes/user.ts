const express  = require("express");

const bcrypt   = require("bcrypt");
const jwt      = require("jsonwebtoken");
const dotenv   = require("dotenv");
const { User } = require("../db");
const { z }    = require("zod");

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const router = express.Router();

//Sign- Up Route 
const signupBody = z.object({
    username:z.string(),
    email: z.string().email(),
    password: z.string(),
})


router.post("/signup", async(req :Request, res:Response)=> {
    const parsed = signupBody.safeParse(req.body);

    if(!parsed.success) {
        return res.status(400).json({ error : parsed.error })
    }

    const { username, email, password} = parsed.data;//directly accesing the value pf these para by req

     try {
        const existingUser =  await User.findOne({ username})
        console.log(existingUser);

     if(existingUser) {
        res.status(400).json({ error : "Username already taken" });
    }

    //continue logic: hasshed password, save user 
    const hashedPassword = await bcrypt.hash(password,10);

    const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
    })


    const token = jwt.sign(
        {userId: newUser._id, username: newUser.username },
         JWT_SECRET ,
        {expiresIn: "1h"}
    );

    res.status(200).json({
      message: "User created successfully",
      token,
    });
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
})

export default router;