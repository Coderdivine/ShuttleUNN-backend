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
            throw new CustomError(
                "An issue has arisen. Please try again later.",
                500
              );
        }
    }
    
    async smth() {}

    
}

module.exports = new UserContoller();
