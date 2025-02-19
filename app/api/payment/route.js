import Midtrans from "midtrans-client";
import { NextResponse } from "next/server";

const snap = new Midtrans.Snap({
    isProduction: false,
    serverKey: process.env.NEXT_PUBLIC_MIDTRANS_SERVER_KEY,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
});

export async function POST(request) {
    try {
        const { 
            order_id,
            gross_amount,
            first_name,
            last_name,
            email,
            phone,
            items // tambahan untuk items
        } = await request.json();

        const parameter = {
            transaction_details: {
                order_id: order_id,
                gross_amount: gross_amount
            },
            customer_details: {
                first_name,
                last_name,
                email,
                phone
            },
            item_details: items.map(item => ({
                id: item.id,
                price: item.price,
                quantity: item.quantity,
                name: item.name,
                brand: item.brand,
                category: item.category
            }))
        };

        const transaction = await snap.createTransaction(parameter);
        
        return NextResponse.json(transaction);
        
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}