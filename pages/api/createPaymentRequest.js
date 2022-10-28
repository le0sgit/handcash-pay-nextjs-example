import PaymentsRepository from "../../lib/repositories/PaymentsRepository";
import {paymentStatus} from "../../lib/Entities";
import HandCashService from "../../lib/services/HandCashService";

export default async function handler(req, res) {
    try {
        const {sendAmount, destination, currencyCode, businessName, notificationsEmail} = JSON.parse(req.body);
        const data = await HandCashService.createPaymentRequest({
            businessName,
            sendAmount,
            destination,
            currencyCode,
            notificationsEmail
        });
        PaymentsRepository.setById(data.id, {
            status: paymentStatus.pending,
            paymentAmount: data.paymentAmount,
        });
        return res.status(200).json(data);
    } catch (error) {
        console.error(error);
        return res.status(400).json({error: error.toString()});
    }
}
