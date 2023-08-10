const response = require("../utils/response");
const UserService = require("../services/user.service");
const CustomError = require("../utils/custom-error");

class UserContoller {

    async register(req, res){
        try{
            if(!req.body) throw new CustomError("No request body",404);
            if(!req.body.email) throw new CustomError("Email is required",404);
            if(!req.body.password) throw new CustomError("Password is required",404);
            console.log({ body:req.body })
            const result = await UserService.register(req.body);
            if(!result) throw new CustomError("Oops! Registration failed",500);
            res.status(201).send(response("Registration completed",result));
        }catch(error){
            throw new CustomError(error.message,500);
        }
    }

    async login(req, res){
        try{
            if(!req.body) throw new CustomError("No request body",404);
            const result = await UserService.login(req.body);
            if(!result) throw new CustomError("Oops! Login failed",500);
            res.status(201).send(response("Login completed",result));
        }catch(error){
            throw new CustomError(error.message,500);
        }
    }

    async dlt(req, res){
        try{
            if(!req.body) throw new CustomError("No request body",404);
            const result = await UserService.dlt(req.body.email);
            res.status(201).send(response(`Deleted user ${req.body.email}`,result));
        }catch(error){
            throw new CustomError(error.message,500);
        }

    }

    async user_data(req, res){
        try{
            if(!req.params.user_id) throw new CustomError("User ID is required",404);
            const result = await UserService.user_data({user_id:req.params.user_id});
            if(!result) throw new CustomError("Oops! unable to get user data failed",500);
            res.status(201).send(response("User data",result));
        }catch(error){
            throw new CustomError(error.message,500);
        }

    }
    
    async resetPassword(req, res){  
        try{
            if(!req.body) throw new CustomError("No body passed",400);
            const result = await UserService.resetPassword(req.body);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("OTP sent. Please check your email for the one-time password (OTP).",result));
        }catch(error){
            throw new CustomError(error.message,500);
        }
    }

    async verifyResetToken(req, res){
        try{
            if(!req.body) throw new CustomError("No body passed",400);
            const result = await UserService.verifyResetToken(req.body);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("Password reset successful.",result));
        }catch(error){
            throw new CustomError(error.message,500);
        }
    }

    async updateInfo(req, res){
        try{
            if(!req.body) throw new CustomError("No body passed",400);
            const result = await UserService.update(req.body.user_id,req.body);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("Info updated successfully.",result));
        }catch(error){
            throw new CustomError(error.message,500);
        }
    }
}

module.exports = new UserContoller();
