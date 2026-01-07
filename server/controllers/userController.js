import { generateToken } from "../lib/utils.js";
import User from "../models/User.js"
import bcrypt from "bcryptjs"
// SignUp for a new User 

export const signup = async (req , res)=> {
    const {fullName , email , password , bio} = req.body;

    try {
        if (!fullName ||!email || !password || !bio){
            return res.json({succesfull: "false", message:"Missing Details"})
        }
        const user = await User.findOne({email});

        if(user){
            return res.json({succesfull: "false", message:"Account Already Exists"})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = await User.create({
            fullName, email, password, hashedPassword , bio
        });

        const token = generateToken

    } catch (error) {
        
    }
}