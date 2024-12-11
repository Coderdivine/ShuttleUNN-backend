const response = require("../utils/response");
const TrackService = require("../services/track.service");
const CustomError = require("../utils/custom-error");

class TrackController {

    async trackPosture(req, res) {
            if (!req.body) throw new CustomError("No body passed.", 400);
            const result = await TrackService.trackPosture(req.body.user_id, req.body);
            if(!result) throw new CustomError("No result returned. Please make sure your device is activated.", 400);
            res.status(200).send(response("track information", result));
    }

    async lastBodyPartAffected(req, res) {
        if (!req.body) throw new CustomError("No body passed.", 400);
        const result = await TrackService.lastBodyPartAffected(req.body.user_id);
        if(!result) throw new CustomError("No result returned. Please make sure your device is activated.", 400);
        res.status(200).send(response("lastBodyPartAffected", result));    
    }
}

module.exports = new TrackController();
