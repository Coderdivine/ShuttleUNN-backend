const response = require("../utils/response");
const PostureService = require("../services/posture.service");
const CustomError = require("../utils/custom-error");

class PostureController {

    async linkDevSensorId(req, res){
        try {
            if(!req.body) throw new CustomError("Invalid request", 400);
            const result = await PostureService.linkDevSensorId(req.body);
            if(!result) throw new CustomError("No result was found.", 400);
            res.status(201).send(response("Dev Sensor device linked.",result));
        } catch (error) {
            throw new CustomError("An error occurred. Please attempt again later.", 500)
        }
    }

    async getAllPostures(req, res){
        try {
            const result = await PostureService.getAllPostures();
            if(!result) throw new CustomError("Oops! couldn't fetch postures",500);
            res.status(201).send(response("Posture fetched.",result));
        } catch (error) {
            throw new CustomError("An error occurred. Please attempt again later.",500)
        }
    }

    async addPostures(req, res){
        try {
            if(!req.body) throw new CustomError("No request found.", 400);
            const result = await PostureService.addPosture(req.body);
            if(!result) throw new CustomError("Oops! couldn't add posture", 400);
            res.status(201).send(response("Posture added.",result));
        } catch (error) {
            throw new CustomError("An error occurred. Please attempt again later.", 500)
        }
    }

    async getUserPostures(req, res){
        try {
            if(!req.params) throw new CustomError("No request params passed.",400);
            const result = await PostureService.getUserPostures(req.params.user_id, req.params.timeInterval);
            if(!result) throw new CustomError("Oops! couldn't fetch postures",500);
            res.status(201).send(response("User posture fetched.",result));
        } catch (error) {
            throw new CustomError("An error occurred. Please attempt again later.",500)
        }
    }

    async getPostureSummaryOfTheDay(req, res){
        try {
            if(!req.body) throw new CustomError("No request body passed.",400);
            const result = await PostureService.getPostureSummaryOfTheDay(req.body.user_id);
            if(!result) throw new CustomError("Oops! couldn't fetch postures",500);
            res.status(201).send(response("Posture summary of the year.",result));
        } catch (error) {
            throw new CustomError("An error occurred. Please attempt again later.",500)
        }
    }

    async getPostureSummaryOfTheWeek(req, res){
        try {
            if(!req.body) throw new CustomError("No request body passed.",400);
            const result = await PostureService.getPostureSummaryOfTheWeek(req.body.user_id);
            if(!result) throw new CustomError("Oops! couldn't fetch postures",500);
            res.status(201).send(response("Posture summary of the year.",result));
        } catch (error) {
            throw new CustomError("An error occurred. Please attempt again later.",500)
        }
    }

    async getPostureSummaryOfTheMonth(req, res){
        try {
            if(!req.body) throw new CustomError("No request body passed.",400);
            const result = await PostureService.getPostureSummaryOfTheMonth(req.body.user_id);
            if(!result) throw new CustomError("Oops! couldn't fetch postures",500);
            res.status(201).send(response("Postutre Summary of the month.",result));
        } catch (error) {
            throw new CustomError("An error occurred. Please attempt again later.",500)
        }
    }

    async getPostureSummaryOfTheYear(req, res){
        try {
            if(!req.body) throw new CustomError("No request body passed.",400);
            const result = await PostureService.getPostureSummaryOfTheYear(req.body.user_id);
            if(!result) throw new CustomError("Oops! couldn't fetch postures",500);
            res.status(201).send(response("Posture summary of the year.",result));
        } catch (error) {
            throw new CustomError("An error occurred. Please attempt again later.",500)
        }
    }

    async getPostureSummaryOfTheYear(req, res){
        try {
            if(!req.body) throw new CustomError("No request body passed.",400);
            const result = await PostureService.getPostureSummaryOfTheYear(req.body.user_id);
            if(!result) throw new CustomError("Oops! couldn't fetch postures",500);
            res.status(201).send(response("Posture summary.",result));
        } catch (error) {
            throw new CustomError("An error occurred. Please attempt again later.",500)
        }
    }

    async lastSixPosturesImage(req, res){
        try {
            if(!req.body) throw new CustomError("No request body passed.",400);
            const result = await PostureService.lastSixPosturesImage(req.body.user_id);
            if(!result) throw new CustomError("Oops! couldn't fetch postures",500);
            res.status(201).send(response("Last six postures fetched.",result));
        } catch (error) {
            throw new CustomError("An error occurred. Please attempt again later.",500)
        }
    }

    async fiveCommonPostures(req, res){
        try {
            if(!req.body) throw new CustomError("No request body passed.",400);
            const result = await PostureService.fiveCommonPostures(req.body.user_id, req.body.period);
            if(!result) throw new CustomError("Oops! couldn't fetch postures",500);
            res.status(201).send(response("Five common posture fetched.",result));
        } catch (error) {
            throw new CustomError("An error occurred. Please attempt again later.",500)
        }
    }

    async groupPosturesByPeriod(req, res){
        try {
            const result = await PostureService.groupPosturesByPeriod(req.body.user_id, req.body.period);
            if(!result) throw new CustomError("An error occurred. Please attempt again later.", 400)
            res.status(201).send(response("Posture fetched.",result));
        } catch (error) {
            throw new CustomError("An error occurred. Please attempt again later.", 500)
        }
    }

    async  predictWorkout(req, res){
        try {
            const result = await PostureService.predictWorkout(req.body.user_id, req.body.period);
            if(!result) throw new CustomError("An error occurred. Please attempt again later.", 400)
            res.status(201).send(response("Predicted workout.",result));
        } catch (error) {
            throw new CustomError("An error occurred. Please attempt again later.", 500);
        }
    }

}

module.exports = new PostureController();
