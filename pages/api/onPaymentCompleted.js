import PaymentsRepository from "../../lib/repositories/PaymentsRepository";
import {paymentStatus} from "../../lib/Entities";

const appSecret = process.env.NEXT_PUBLIC_APP_SECRET;

export default function handler(req, res) {
    try {
        const data = req.body;
        if (data.appSecret === appSecret) {
            const paymentRequest = PaymentsRepository.getById(data.paymentRequestId);
            const username = data.userData.paymail.split('@')[0];
            PaymentsRepository.setById(data.paymentRequestId, {
                status: paymentStatus.confirmed,
            })
            PaymentsRepository.addPaymentCompleted({
                transactionId: data.transactionId,
                status: paymentStatus.confirmed,
                paymentAmount: paymentRequest?.paymentAmount,
                confirmedAt: new Date(),
                userData: {
                    username,
                    avatarUrl: `https://cloud.handcash.io/v2/users/profilePicture/${username}`,
                },
            });
        }
        return res.status(200).json({});
    } catch (error) {
        console.error(error);
        return res.status(500).json({});
    }
}
