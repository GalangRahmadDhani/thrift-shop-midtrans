// app/api/payment/status/[orderId]/route.js
import Midtrans from "midtrans-client";
import { NextResponse } from "next/server";

let core = new Midtrans.CoreApi({
    isProduction: false,
    serverKey: process.env.NEXT_PUBLIC_MIDTRANS_SERVER_KEY,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
});

export async function GET(request, { params }) {
    try {
        const { orderId } = params;
        const status = await core.transaction.status(orderId);
        return NextResponse.json(status);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Opsional: Endpoint untuk notification handler dari Midtrans
export async function POST(request) {
    try {
        const notificationJson = await request.json();
        
        const statusResponse = await core.transaction.notification(notificationJson);
        
        let orderId = statusResponse.order_id;
        let transactionStatus = statusResponse.transaction_status;
        let fraudStatus = statusResponse.fraud_status;

        console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);

        // Handle berbagai status transaksi
        if (transactionStatus == 'capture') {
            if (fraudStatus == 'challenge') {
                // TODO: handle challenge transaction
            } else if (fraudStatus == 'accept') {
                // TODO: handle accepted transaction
            }
        } else if (transactionStatus == 'settlement') {
            // TODO: handle settlement transaction
        } else if (transactionStatus == 'cancel' ||
            transactionStatus == 'deny' ||
            transactionStatus == 'expire') {
            // TODO: handle failed transaction
        } else if (transactionStatus == 'pending') {
            // TODO: handle pending transaction
        }

        return NextResponse.json({ 
            status: 'success',
            message: 'Notification processed'
        });
        
    } catch (error) {
        console.error("Error processing notification:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}