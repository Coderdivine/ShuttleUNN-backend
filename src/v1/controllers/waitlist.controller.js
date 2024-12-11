const response = require("../utils/response");
const WaitListService = require("../services/waitlist.service");
const CustomError = require("../utils/custom-error");

class WaitListController {

    async joinWailist(req, res) {
            console.log(req);
            if (!req.body) throw new CustomError("An error occured.", 400);
            const result = await WaitListService.joinWaitList({ email: req.body.email });
            if(!result) throw new CustomError("Unable to join you to the waitlist at the moment.", 400);
            res.status(200).send(response("Thanks for Joining.", result));
    }

    async sendMessage(req, res) {
        if (!req.body) throw new CustomError("An error occured.", 400);
        const result = await WaitListService.sendMessage({ email: req.body.email, message: req.body.message });
        if(!result) throw new CustomError("Unable to send message.", 400);
        res.status(200).send(response("Mesage sent, we'll provide a response shortly.", result));
    }

}

module.exports = new WaitListController();
