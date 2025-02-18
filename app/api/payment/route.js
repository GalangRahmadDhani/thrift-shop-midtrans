const midtransClient = require('midtrans-client');
import { NextResponse } from "next/server";

let snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.NEXT_PUBLIC_MIDTRANS_SERVER_KEY,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
});

// Add OPTIONS handler for CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

export async function POST(request) {
    try {
        // Add CORS headers to response
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };

        const { 
            order_id,
            gross_amount,
            first_name,
            last_name,
            email,
            phone
        } = await request.json();

        let parameter = {
            transaction_details: {
                order_id: order_id,
                gross_amount: gross_amount
            },
            credit_card: {
                secure: true
            },
            customer_details: {
                first_name: first_name,
                last_name: last_name,
                email: email,
                phone: phone
            }
        };

        const transaction = await snap.createTransaction(parameter);
        
        return NextResponse.json({ 
            token: transaction.token,
            redirect_url: transaction.redirect_url
        }, { headers });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: error.message },
            { 
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            }
        );
    }
}