const response = require("../utils/response");
const UserService = require("../services/user.service");
const CustomError = require("../utils/custom-error");
const Excerise = require("../services/excerise.service");
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

    async registerNotifcationDevice(req, res) {
        const user_id = req.user_id || req.body.user_id || req.params.user_id;
        const { deviceName } = req.useragent;
        if(!deviceName) throw new CustomError("Can't register device", 400);
        const device_name = deviceName;
        const result = await UserService.registerNotifcationDevice(user_id,{...req.body, device_name});
        res.status(401).send(response("Device registered. Start recieving notifcation from DevSensor", result));
    }

    async googleAuthFailed(req, res){
        const result = await UserService.googleAuthFailed();
        res.status(401).send(response("Login failed", result));
    }

    async googleAuth(req, res) {
        const result = await UserService.googleAuthFailed(req?.user);
        res.status(201).send(response("Login completed using google.", result));
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

    async registerDeviceForNotification(req, res) {
            if(!req.body) throw new CustomError("There are issues with processing your request. Please try again later or log in.",400);
            const result = await UserService.registerDeviceForNotification(req.body.user_id, req.body);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("Device registered for notifications.",result));
    }

    async deleteRegisteredDevice(req, res) {
        if(!req.body) throw new CustomError("There are issues with processing your request. Please try again later or log in.",400);
        const result = await UserService.deleteRegisteredDevice(req.body.user_id, req.body);
        if(!result) throw new CustomError("Something went wrong. please try again later",400);
        res.status(201).send(response("Device token deleted successfully",result));
    }

    async realeaseAccount(req, res){
            if(!req.body) throw new CustomError("There are issues with processing your request. Please try again later or log in.",400);
            const result = await UserService.realeaseAccount(req.body.user_id);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("Account suspension lifted.",result));
       
    }

    async userBilling(req, res){
            if(!req.params) throw new CustomError("There are issues with processing your request. Please try again later or log in.",400);
            const result = await UserService.userBilling(req.params.user_id);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("User billing listings.",result));
       
    }

    async addToUserbilling(req, res){
            if(!req.body) throw new CustomError("There are issues with processing your request. Please try again later or log in.",400);
            const result = await UserService.addToUserbilling(req.body.user_id, req.body);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("User billing added.",result));
       
    }

    async getUserRoutine(req, res){
            if(!req.params) throw new CustomError("There are issues with processing your request. Please try again later or log in.",400);
            const result = await UserService.getUserRoutine(req.params.user_id);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("User routine.",result));
    }

    async addToUserRoutine(req, res){
            if(!req.body) throw new CustomError("There are issues with processing your request. Please try again later or log in.",400);
            const result = await UserService.addToUserRoutine(req.body.user_id, req.body.routine_name, req.body.time);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("Routine successfully added.",result));
       
    }

    async editUserRoutine(req, res){
            if(!req.body) throw new CustomError("There are issues with processing your request. Please try again later or log in.",400);
            const result = await UserService.editUserRoutine(req.body.user_id, req.body.routine_id, req.body.updatedValue, req.body.updatedField);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("Routine updated successfully.",result));
    }

    async deleteFromUserRoutine(req, res){
            if(!req.body) throw new CustomError("There are issues with processing your request. Please try again later or log in.",400);
            const result = await UserService.deleteFromUserRoutine(req.body.user_id, req.body.routine_id);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("Routine deleted successfully.",result));
    }

    async getWorkoutByUser_id(req, res) {
        if(!req.body) throw new CustomError("There are issues with processing your request. Please try again later or log in.",400);
            const result = await Excerise.getWorkoutByUser_id(req.body.user_id);
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("Workout requested.",result));
    }

    async getWorkout(req, res) {
        if(!req.body) throw new CustomError("There are issues with processing your request. Please try again later or log in.",400);
            const result = await Excerise.getWorkout(req.body.excerise_id);
            console.log({ result });
            if(!result) throw new CustomError("Something went wrong. please try again later",400);
            res.status(201).send(response("excerise requested.",result));
    }

    
}

module.exports = new UserContoller();
