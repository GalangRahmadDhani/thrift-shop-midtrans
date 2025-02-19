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
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
                'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
            }
        });
    } catch (error) {
        return NextResponse.json(
            { 
                status: 'error',
                message: error.message 
            },
            { 
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
                    'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
                }
            }
        );
    }
}

