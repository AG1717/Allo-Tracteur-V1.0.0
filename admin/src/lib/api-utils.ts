import { NextResponse } from 'next/server';

// CORS headers pour permettre l'accès depuis l'app mobile
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Response helper avec CORS
export function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders,
  });
}

// Error response
export function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    { error: message },
    { status, headers: corsHeaders }
  );
}

// OPTIONS handler pour CORS preflight
export function optionsResponse() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
