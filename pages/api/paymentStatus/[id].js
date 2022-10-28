import PaymentsRepository from "../../../lib/repositories/PaymentsRepository";
import {paymentStatus} from "../../../lib/Entities";

export default function handler(req, res) {
  const {id} = req.query;
  const payment = PaymentsRepository.getById(id);
  return res.status(200).json({ status: payment?.status || paymentStatus.unknown });
}
