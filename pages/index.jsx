import {useEffect, useState} from "react";
import {paymentStatus} from "../lib/Entities";
import moment from "moment";
const appId = process.env.NEXT_PUBLIC_APP_ID;
const appSecret = process.env.NEXT_PUBLIC_APP_SECRET;

export default function Index() {
    const [inputAmount, setInputAmount] = useState(0);
    const [chapterNumber, setChapterNumber] = useState(1); // Inicializas chapterNumber con 1 u otro valor predeterminado
    const [paymentState, setPaymentState] = useState({
        status: paymentStatus.unknown,
    });
    const [recentPayments, setRecentPayments] = useState([]);

    let checkPaymentStatusInterval;

    useEffect(() => {
        getRecentPayments();
    }, []);

    const onSelectChapter = (event) => {
        const selectedChapter = parseInt(event.target.value);
        setChapterNumber(selectedChapter);
    };

    const onChangeInputAmount = (event) => {
        const value = parseFloat(event.target.value);
        if (!isNaN(value)) {
            setInputAmount(value);
        } else {
            setInputAmount(0);
        }
    };

    const onConfirmPaymentAmount = async () => {
        const response = await fetch(`api/createPaymentRequest`, {
            method: 'POST',
            body: JSON.stringify({
                sendAmount: inputAmount,
                chapterNumber: chapterNumber,
                currencyCode: 'USD',
            }),
        });
        if (response.ok) {
            const payment = await response.json();
            setPaymentState({
                paymentRequest: payment,
                status: paymentStatus.pending,
            });
            startCheckPaymentStatusInterval(payment.id);
        }
    };

    const onCancelPayment = async () => {
        clearInterval(checkPaymentStatusInterval);
        setPaymentState({
            status: paymentStatus.unknown,
        });
        if (!paymentState.paymentRequest) {
            return;
        }
        const response = await fetch(`/api/deletePaymentRequest`, {
            method: 'DELETE',
            body: JSON.stringify({
                id: paymentState.paymentRequest.id,
            }),
        });
        if (!response.ok) {
            console.error('Error deleting paymentRequest');
            console.error(await response.text());
        }
    };

    const getRecentPayments = async () => {
        const response = await fetch(`/api/getRecentPayments`);
        if (response.ok) {
            const data = await response.json();
            console.log(data?.items);
            setRecentPayments(data?.items);
        } else {
            console.error(await response.text());
        }
    };

    const checkPaymentStatus = async (id) => {
        const response = await fetch(`api/paymentStatus/${id}`, {
            method: 'GET',
        });
        if (response.ok) {
            const data = await response.json();
            setPaymentState((state) => {
                if ([paymentStatus.confirmed, paymentStatus.unknown].includes(data.status)) {
                    clearInterval(checkPaymentStatusInterval);
                    getRecentPayments();
                    return {
                        status: data.status,
                    };
                }
                const expirationInSeconds = (new Date(state?.paymentRequest?.expiresAt) - new Date()) / 1000;
                if (expirationInSeconds < 0) {
                    clearInterval(checkPaymentStatusInterval);
                    return {
                        status: paymentStatus.expired,
                    };
                }
                return {
                    ...state,
                    status: data.status,
                    expirationInSeconds,
                }
            });
        }
    };


    const startCheckPaymentStatusInterval = (id) => {
        clearInterval(checkPaymentStatusInterval);
        checkPaymentStatusInterval = setInterval(() => {
            checkPaymentStatus(id);
        }, 1000);
    }

    return (
        <div className="w-full grow flex flex-col md:flex-row justify-around gap-x-16 p-0 md:p-6">
            <div className="w-full h-full grow md:basis-1/2 flex md:justify-beginin">      
                <div
                    className="w-full grow md:max-w-[22rem] flex flex-col md:rounded-xl bg-darkBackground-800 md:shadow-sm shadow-white/10 justify-center items-center">
                    {paymentState?.status === paymentStatus.unknown &&
                        <div
                            className="flex flex-col grow gap-y-2 w-full p-6 rounded-xl items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                 strokeWidth={1.5}
                                 stroke="currentColor" className="w-32 h-32 text-white/40">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"/>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z"/>
                            </svg>
                            <p className="text-xl text-white/40">Enter an amount to generate a payment QR code. (1$ min)</p>
                            <div className="relative mt-10">
                                <label htmlFor="chapterNumber" className="text-white/70 text-3xl text-sm">
                                    Select a chapter:
                                </label>
                                    <select
                                        className="block w-full bg-darkBackground-800 border-0 border-t border-white/30 pr-2 pl-6 focus:text-indigo-400 focus:caret-indigo-400 focus:border-indigo-500 focus:ring-transparent text-3xl text-left"
                                        type="number"
                                        id="chapterNumber"
                                        min={1}
                                        max={10} // Ajusta el valor máximo según el número máximo de capítulos disponibles
                                        value={chapterNumber}
                                        onChange={onSelectChapter}
                                     > 
                                        <option value={1}>Chapter 1</option>
                                        <option value={2}>Chapter 2</option>
                                    </select>
                            </div>
                        </div>

                    }
                    {paymentState?.status === paymentStatus.confirmed &&
                        <div
                            className="flex flex-col grow gap-y-2 w-full p-6 rounded-xl items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                 className="w-24 h-24 text-green-500 motion-safe:animate-bounce">
                                <path fillRule="evenodd"
                                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                                      clipRule="evenodd"/>
                            </svg>
                            <h5 className="text-2xl">Payment confirmed</h5>
                            <p className="text-sm text-white/70">Thanks for your payment!</p>
                        </div>
                    }
                    {paymentState?.status === paymentStatus.pending &&
                        <div
                            className="flex flex-col grow gap-y-2 w-full p-6 rounded-xl items-center justify-center">
                            <p className="">Scan to pay</p>
                            <div className="p-1 bg-white w-72 h-72 rounded-xl">
                                <img src={paymentState?.paymentRequest?.paymentRequestQrCodeUrl}
                                     alt={"QR code for payment request"}
                                     className="w-full h-full"
                                />
                                <div className="flex flex-col grow gap-y-2 w-full p-6 rounded-xl items-center justify-center">
                                <a
                                    href={paymentState?.paymentRequest?.paymentRequestUrl}
                                    className="button"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    >Payment Link
                                </a>
                                </div>
                            </div>
                            {paymentState?.expirationInSeconds && paymentState.expirationInSeconds < 30 &&
                                <div
                                    className="flex items-center justify-center bg-red-100/10 text-red-300 border-red-300 rounded-full mt-1 pl-4 pr-6 py-2 gap-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                         strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
                                    </svg>
                                    <p className="text-xs">
                                        Expires
                                        in {((new Date(paymentState?.paymentRequest?.expiresAt) - new Date()) / 1000).toFixed(0)} seconds
                                    </p>
                                </div>
                            }
                            {paymentState?.status === paymentStatus.expired &&
                                <div
                                    className="flex items-center justify-center bg-red-100/10 text-red-300 border-red-300 rounded-full mt-1 pl-4 pr-6 py-2 gap-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                         strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <p className="text-xs">Payment expired</p>
                                </div>
                            }
                        </div>
                    }
                    <div className="w-full grow-0 fixed bottom-0 left-0 md:relative text-white/90">
                        <div className="relative">
                            <input
                                type="text"
                                name="amount"
                                id="amount"
                                disabled={paymentState?.status !== paymentStatus.unknown}
                                onInput= {onChangeInputAmount}
                                onKeyDown={(event) => event.key === 'Enter' && onConfirmPaymentAmount()}
                                className="block w-full bg-darkBackground-800 border-0 border-t border-white/30 pr-2 pl-6 focus:text-indigo-400 focus:caret-indigo-400 focus:border-indigo-500 focus:ring-transparent text-4xl"
                                placeholder="0.00"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-6">
                                <span className="text-4xl">USD</span>
                            </div>
                        </div>
                        {paymentState?.status === paymentStatus.unknown &&
                            <button
                                className="w-full bg-indigo-500 hover:opacity-90 text-3xl text-white/90 md:rounded-b-xl py-3"
                                disabled={inputAmount <= 0.01}
                                onClick={onConfirmPaymentAmount}
                            >Enter
                            </button>
                        }
                        {[paymentStatus.pending, paymentStatus.expired].includes(paymentState?.status) &&
                            <button
                                className="w-full bg-red-400 hover:opacity-90 text-3xl text-white/90 md:rounded-b-xl py-3"
                                onClick={onCancelPayment}
                            >Cancel
                            </button>
                        }
                        {paymentState?.status === paymentStatus.confirmed &&
                            <button
                                className="w-full bg-green-500 hover:opacity-90 text-3xl text-white/90 md:rounded-b-xl py-3"
                                onClick={onCancelPayment}
                            >Next
                            </button>
                        }
                    </div>
                </div>

                <div className="w-full grow hidden md:block basis-1/2 flex justify-start">
          {/*       <div className="flex flex-col max-w-[23rem] max-h-[32rem] items-start gap-y-2">
                    <div className="flew-grow w-full mb-2 flex justify-between">
                        <h3 className="text-md text-white/90 uppercase">Recent payments</h3>
                        <button
                            className="text-xs text-white/90 bg-indigo-500/40 px-3 py-1 rounded-full hover:ring-2 hover:ring-indigo-500"
                            onClick={getRecentPayments}
                        >Update
                        </button>
                    </div>
                    {
                        recentPayments.map((payment) => (
                            <a key={payment.transactionId}
                               target="_blank"
                               rel="noopener noreferrer"
                               href={`https://app.handcash.io/#/payment/${payment.transactionId}`}
                               className="w-full">
                                <div
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/30 hover:bg-indigo-500/10 hover:border-indigo-400/70">
                                    <div className="flex gap-x-4">
                                        <img src={payment.userData.avatarUrl}
                                             className="w-12 h-12 rounded-full"/>
                                        <div className="flex flex-col items-start justify-center">
                                            <p className="text-lg m-0 p-0">${payment.userData.username}</p>
                                            <p className="text-xs text-white/70 m-0 p-0">{moment(payment.confirmedAt).fromNow()}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xl font-medium text-indigo-400">+{payment.paymentAmount?.amount.toFixed(2)} {payment.paymentAmount?.currencyCode}</p>
                                    </div>
                                </div>
                            </a>
                        ))
                    }
                    {recentPayments.length === 0 &&
                        <div className="w-full h-full overflow-scroll flex-col flex gap-y-2">
                            {Array.from(Array(5).keys()).map((index) => (
                                <div
                                    key={index}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/10">
                                    <div className="flex gap-x-4">
                                        <div className="w-12 h-12 rounded-full bg-white/5"/>
                                        <div className="flex flex-col items-start justify-center gap-y-1">
                                            <div className="bg-white/5 rounded-full w-24 h-5"/>
                                            <div className="bg-white/5 rounded-full w-20 h-4"/>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="bg-white/5 rounded-full w-20 h-8"/>
                                    </div>
                                </div>
                            ))
                            }
                        </div>
                    }
                </div> */}
            </div>

                <div className="w-full md:max-w-[55rem] md:flex md:flex-col md:rounded-xl md:justify-center md:items-center">
                    <div className="image-info-container">
                    <img
                        src="https://m.media-amazon.com/images/I/71FCTw0wGSL._SY342_.jpg"
                        alt="Title of the Image"
                        className="image"
                        style={{ maxWidth: '100%', height: 'auto' }}
                    />
                    <h2 className="title">Title of the Image</h2>
                    <p className="description">Description of the image goes here.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
