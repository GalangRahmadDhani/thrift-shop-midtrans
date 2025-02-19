import Midtrans from "midtrans-client";
import { NextResponse } from "next/server";

// Pindahkan ke dalam function untuk menghindari error saat build time
function createSnapInstance() {
    return new Midtrans.Snap({
        isProduction: false,
        serverKey: Buffer.from(process.env.NEXT_PUBLIC_MIDTRANS_SERVER_KEY || '').toString('base64'),
        clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    });
}

export async function POST(request) {
    try {
        // Log untuk debugging
        console.log('Server Key:', process.env.NEXT_PUBLIC_MIDTRANS_SERVER_KEY);
        
        const snap = createSnapInstance();
        
        const { 
            order_id,
            gross_amount,
            first_name,
            last_name,
            email,
            phone,
            items
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

        try {
            const transaction = await snap.createTransaction(parameter);
            console.log('Transaction created:', transaction);
            return NextResponse.json(transaction);
        } catch (midtransError) {
            console.error('Midtrans Error:', midtransError);
            return NextResponse.json({
                error: 'Midtrans Error',
                details: midtransError.message,
                apiResponse: midtransError.ApiResponse
            }, { status: 401 });
        }
        
    } catch (error) {
        console.error("General Error:", error);
        return NextResponse.json(
            { 
                error: error.message,
                type: 'GeneralError',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}