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
    
    async suspendAccount(req, res){
        try {
            if(!req.body) throw new CustomError("The application is experiencing problems with sending your request. Please attempt again later or log in.",400);
            const result = await UserService.suspendAccount(req.body.user_id);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("Account Suspended",result));
        } catch (error) {
            throw new CustomError(
                "An issue has arisen. Please try again later.",
                500
              );
        }
    }

    async realeaseAccount(req, res){
        try {
            if(!req.body) throw new CustomError("The application is experiencing problems with sending your request. Please attempt again later or log in.",400);
            const result = await UserService.realeaseAccount(req.body.user_id);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("Account suspension lifted.",result));
        } catch (error) {
            throw new CustomError(
                "An issue has arisen. Please try again later.",
                500
              );
        }
    }

    async userBilling(req, res){
        try {
            if(!req.body) throw new CustomError("The application is experiencing problems with sending your request. Please attempt again later or log in.",400);
            const result = await UserService.userBilling(req.body.user_id);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("User billing listings.",result));
        } catch (error) {
            throw new CustomError(
                "An issue has arisen. Please try again later.",
                500
              );
        }
    }

    async addToUserbilling(req, res){
        try {
            if(!req.body) throw new CustomError("The application is experiencing problems with sending your request. Please attempt again later or log in.",400);
            const result = await UserService.addToUserbilling(req.body.user_id, req.body);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("User billing added.",result));
        } catch (error) {
            throw new CustomError(
                "An issue has arisen. Please try again later.",
                500
              );
        }
    }

    async getUserRoutine(req, res){
        try {
            if(!req.body) throw new CustomError("The application is experiencing problems with sending your request. Please attempt again later or log in.",400);
            const result = await UserService.getUserRoutine(req.body.user_id);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("User routine.",result));
        } catch (error) {
            throw new CustomError(
                "An issue has arisen. Please try again later.",
                500
              );
        }
    }

    async addToUserRoutine(req, res){
        try {
            if(!req.body) throw new CustomError("The application is experiencing problems with sending your request. Please attempt again later or log in.",400);
            const result = await UserService.addToUserRoutine(req.body.user_id, req.body.routine_name);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("Routine successfully added.",result));
        } catch (error) {
            throw new CustomError(
                "An issue has arisen. Please try again later.",
                500
              );
        }
    }

    async editUserRoutine(req, res){
        try {
            if(!req.body) throw new CustomError("The application is experiencing problems with sending your request. Please attempt again later or log in.",400);
            const result = await UserService.editUserRoutine(req.body.user_id, req.body.routine_id, req.body.updatedValue, req.body.updatedField);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("Routine updated successfully.",result));
        } catch (error) {
            throw new CustomError(
                "An issue has arisen. Please try again later.",
                500
              );
        }
    }

    async deleteFromUserRoutine(req, res){
        try {
            if(!req.body) throw new CustomError("The application is experiencing problems with sending your request. Please attempt again later or log in.",400);
            const result = await UserService.deleteFromUserRoutine(req.body.user_id, req.body.routine_id);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("Routine deleted successfully.",result));
        } catch (error) {
            throw new CustomError(
                "An issue has arisen. Please try again later.",
                500
              );
        }
    }

    
}

module.exports = new UserContoller();
