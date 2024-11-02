import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import { UserModel } from "../models/user.model.js";

// /api/v1/users/register
const register = async(req, res) => {
    try {

        const {username, email, password} = req.body;

        //validaciones
        if(!username || !email ||!password) {
            return res.status(400).json({ 
                ok: false, 
                msg: "Please provide all required fields" 
            });
        }

        // verificando por medio del email si un usuario ya existe
        const user = await UserModel.findOneByEmail(email);
        if(user) {
            return res.status(409).json({ 
                ok: false, 
                msg: "The email is already registered" 
            });
        }

        //hashear the password with bcrypt
       /* const salt = bycore.genSaltSync(10);
        const hashedPassword = bycore.hashSync(password, salt);
       */
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // crear el nuevo usuario
        const newUser = await UserModel.create({email, password: hashedPassword, username });


        //modularizar con jwt
        const token = jwt.sign({ 
            email: newUser.email 
        }, 
            process.env.JWT_SECRET, 
            { 
                expiresIn: '1h' 
            }
        );

        return res.status(201).json({ok: true, msg: token})
    } catch (error) {
        console.log(error)
        return res.status(500).json({ 
            ok: false, 
            message: "Internal Server Error" 
        });
    }

}

// /api/v1/users/login
const login = async(req, res) => {
    try {

        const {email, password} = req.body; 

        //validaciones
        if(!email ||!password) {
            return res.status(400).json({ 
                ok: false, 
                msg: "Please provide all required fields" 
            });
        }
        
        // verrificamos por medio del email si ese usuario existe para poder logearse
        const user = await UserModel.findOneByEmail(email);
        if(!user){
            return res.status(404).json({ error: "User not found" });            
        }

        const isMatched = await bcryptjs.compare(password, user.password);
        if(!isMatched){
            return res.status(401).json({ error: "Invalid credentials" });            
        }

        // generar token
        const token = jwt.sign({ 
            email: user.email 
        }, 
            process.env.JWT_SECRET, 
            { 
                expiresIn: '1h' 
            }
        );

    return res.json({ok: true, msg: token})


    } catch (error) {
        console.log(error)
        return res.status(500).json({ 
            ok: false, 
            message: "Internal Server Error" 
        });
    }

}





export const UserController = {
    register,
    login
}