import { NextResponse } from "next/server";

export async function GET() {
    try {
        return NextResponse.json({ 
            status: 'success',
            message: 'API is working!',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV
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

