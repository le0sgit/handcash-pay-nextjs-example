import PaymentsRepository from "../../lib/repositories/PaymentsRepository";

export default function handler(req, res) {
    return res.status(200).json({
        items: PaymentsRepository.getAllPaymentsCompleted(),
    });
}
