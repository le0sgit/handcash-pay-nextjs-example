const appId = process.env.NEXT_PUBLIC_APP_ID;
const appSecret = process.env.NEXT_PUBLIC_APP_SECRET;
const serverDomain = process.env.NEXT_PUBLIC_SERVER_DOMAIN;
const baseEndpoint = 'https://cloud.handcash.io/v2';

export default class HandCashService {
    static headers = {
        'app-id': appId,
        'app-secret': appSecret,
    };
    
    static async createPaymentRequest({sendAmount, notificationsEmail, chapterNumber }) {
        const response = await fetch(`${baseEndpoint}/paymentRequests`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                requestedUserData: ['email', 'paymail'],
                expirationType: 'onPaymentCompleted',
                product: {
                    name: `Think Like a SuperGM - ${chapterNumber}`,
                    description: `Chapter ${chapterNumber}`,
                    imageUrl: 'https://m.media-amazon.com/images/I/71FCTw0wGSL._SY342_.jpg',
                },
                receivers: [
                    { sendAmount, currencyCode: 'USD', destination: 'leens' },
                ],
                notifications: {
                    webhook: {
                        customParameters: {chapter: chapterNumber},
                        webhookUrl: `https://${serverDomain}/webhook/handcash`,
                    },
                    email: notificationsEmail || undefined,
                },
                expirationInSeconds: 300,
            })
        });
        return this.parseResponse(response);
    };
    static async deletePaymentRequest({id}) {
        const response = await fetch(`${baseEndpoint}/paymentRequests/${id}`, {
            method: 'DELETE',
            headers: this.headers,
        });
        return this.parseResponse(response);
    };

    static async parseResponse(response) {
        if (response.ok) {
            return response.json();
        } else {
            const errorMessage = await response.text();
            throw Error(errorMessage);
        }
    }
}
