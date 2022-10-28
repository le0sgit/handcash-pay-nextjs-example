export default class PaymentsRepository {
    static paymentsById = new Map();
    static paymentsCompleted = [];

    static getById(id) {
        return this.paymentsById.get(id);
    };

    static setById(id, paymentRequest) {
        this.paymentsById.set(id, paymentRequest);
    }

    static addPaymentCompleted(payment) {
        this.paymentsCompleted.push(payment);
    }

    static getAllPaymentsCompleted() {
        return [...this.paymentsCompleted].reverse();
    }
}
