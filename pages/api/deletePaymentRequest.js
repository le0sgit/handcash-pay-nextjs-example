import HandCashService from "../../lib/services/HandCashService";

export default async function handler(req, res) {
    const {id} = JSON.parse(req.body);
    try {
        await HandCashService.deletePaymentRequest({id});
        return res.status(200).json({});
    } catch (error) {
        console.error(error)
        return res.status(400).json({error: error.toString()});
    }
}
