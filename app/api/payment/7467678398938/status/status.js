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
        
        // Get transaction status from Midtrans
        const status = await core.transaction.status(orderId);
        
        // Log untuk debugging
        console.log('Transaction status:', status);
        
        // Response berdasarkan status transaksi
        const responseData = {
            order_id: status.order_id,
            transaction_status: status.transaction_status,
            fraud_status: status.fraud_status,
            payment_type: status.payment_type,
            status_code: status.status_code,
            gross_amount: status.gross_amount,
            transaction_time: status.transaction_time
        };

        if (status.status_code === '404') {
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(responseData);
        
    } catch (error) {
        console.error("Error checking transaction status:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
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