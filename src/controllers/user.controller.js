const response = require("../utils/response");
const UserService = require("../services/user.service");
const CustomError = require("../utils/custom-error");

class UserContoller {

    async register(req, res){
            if(!req.body) throw new CustomError("No request body",404);
            if(!req.body.email) throw new CustomError("Email is required",404);
            if(!req.body.password) throw new CustomError("Password is required",404);
            console.log({ body:req.body })
            const result = await UserService.register(req.body);
            if(!result) throw new CustomError("Oops! Registration failed",500);
            res.status(201).send(response("Registration completed",result));
    }

    async login(req, res){
        if(!req.body) throw new CustomError("No request body",404);
        const result = await UserService.login(req.body);
        if(!result) throw new CustomError("Oops! Login failed",500);
        res.status(201).send(response("Login completed",result));
    }

    async dlt(req, res){
            if(!req.body) throw new CustomError("No request body",404);
            const result = await UserService.dlt(req.body.email);
            res.status(201).send(response(`Deleted user ${req.body.email}`,result));
    }

    async user_data(req, res){
            if(!req.params.user_id) throw new CustomError("User ID is required",404);
            const result = await UserService.user_data({user_id:req.params.user_id});
            if(!result) throw new CustomError("Oops! unable to get user data failed",500);
            res.status(201).send(response("User data",result));
    }
    
    async resetPassword(req, res){  
            if(!req.body) throw new CustomError("No body passed",400);
            const result = await UserService.resetPassword(req.body);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("OTP sent. Please check your email for the one-time password (OTP).",result));
    }

    async verifyResetToken(req, res){
            if(!req.body) throw new CustomError("No body passed",400);
            const result = await UserService.verifyResetToken(req.body);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("Password reset successful.",result));
    }

    async updateInfo(req, res){
   
            if(!req.body) throw new CustomError("No body passed",400);
            const result = await UserService.update(req.body.user_id,req.body);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("Info updated successfully.",result));
    }
    
    async suspendAccount(req, res){
            if(!req.body) throw new CustomError("The application is experiencing problems with sending your request. Please attempt again later or log in.",400);
            const result = await UserService.suspendAccount(req.body.user_id);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("Account Suspended",result));
       
    }

    async realeaseAccount(req, res){
            if(!req.body) throw new CustomError("The application is experiencing problems with sending your request. Please attempt again later or log in.",400);
            const result = await UserService.realeaseAccount(req.body.user_id);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("Account suspension lifted.",result));
       
    }

    async userBilling(req, res){
            if(!req.params) throw new CustomError("The application is experiencing problems with sending your request. Please attempt again later or log in.",400);
            const result = await UserService.userBilling(req.params.user_id);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("User billing listings.",result));
       
    }

    async addToUserbilling(req, res){
            if(!req.body) throw new CustomError("The application is experiencing problems with sending your request. Please attempt again later or log in.",400);
            const result = await UserService.addToUserbilling(req.body.user_id, req.body);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("User billing added.",result));
       
    }

    async getUserRoutine(req, res){
            if(!req.params) throw new CustomError("The application is experiencing problems with sending your request. Please attempt again later or log in.",400);
            const result = await UserService.getUserRoutine(req.params.user_id);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("User routine.",result));
    }

    async addToUserRoutine(req, res){
            if(!req.body) throw new CustomError("The application is experiencing problems with sending your request. Please attempt again later or log in.",400);
            const result = await UserService.addToUserRoutine(req.body.user_id, req.body.routine_name, req.body.time);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("Routine successfully added.",result));
       
    }

    async editUserRoutine(req, res){
            if(!req.body) throw new CustomError("The application is experiencing problems with sending your request. Please attempt again later or log in.",400);
            const result = await UserService.editUserRoutine(req.body.user_id, req.body.routine_id, req.body.updatedValue, req.body.updatedField);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("Routine updated successfully.",result));
    }

    async deleteFromUserRoutine(req, res){
            if(!req.body) throw new CustomError("The application is experiencing problems with sending your request. Please attempt again later or log in.",400);
            const result = await UserService.deleteFromUserRoutine(req.body.user_id, req.body.routine_id);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("Routine deleted successfully.",result));
    }

    
}

module.exports = new UserContoller();
