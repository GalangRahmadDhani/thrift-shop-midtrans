import Midtrans from "midtrans-client";
import { NextResponse } from "next/server";

let snap = new Midtrans.Snap({
    isProduction: false,
    serverKey: process.env.NEXT_PUBLIC_MIDTRANS_SERVER_KEY,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
});

export async function POST(request) {
    try {
        const { 
            order_id,
            gross_amount,
            customer_details,
            items
        } = await request.json();

        let parameter = {
            transaction_details: {
                order_id: order_id,
                gross_amount: gross_amount
            },
            item_details: items.map(item => ({
                id: item.id,
                price: item.price,
                quantity: item.quantity,
                name: item.name
            })),
            customer_details: customer_details
        };

        const transaction = await snap.createTransaction(parameter);
        
        return NextResponse.json({ 
            token: transaction.token,
            redirect_url: transaction.redirect_url
        });
    } catch (error) {
        console.error("Error creating transaction:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}