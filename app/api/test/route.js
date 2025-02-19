import { NextResponse } from "next/server";

export async function GET() {
    try {
        return NextResponse.json({ 
            status: 'success',
            message: 'API is working!',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            midtrans: {
                serverKeyExists: !!process.env.NEXT_PUBLIC_MIDTRANS_SERVER_KEY,
                clientKeyExists: !!process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
            }
        });
    } catch (error) {
        return NextResponse.json(
            { 
                status: 'error',
                message: error.message 
            },
            { status: 500 }
        );
    }
}

