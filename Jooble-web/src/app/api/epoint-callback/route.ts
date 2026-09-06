import { NextRequest, NextResponse } from 'next/server';

const EDGE_FUNCTION_URL = 'https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/epoint-callback';

export async function POST(request: NextRequest) {
    try {
        // Forward the request body and headers to the edge function
        const contentType = request.headers.get('content-type') || '';
        let body: BodyInit;

        if (contentType.includes('application/x-www-form-urlencoded')) {
            body = await request.text();
        } else {
            body = await request.text();
        }

        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': contentType,
            },
            body,
        });

        const responseText = await response.text();

        return new NextResponse(responseText, {
            status: response.status,
            headers: {
                'Content-Type': 'text/plain',
            },
        });
    } catch (error) {
        console.error('Epoint callback proxy error:', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}

// Also handle GET for health check
export async function GET() {
    return NextResponse.json({ status: 'ok', endpoint: 'epoint-callback' });
}
