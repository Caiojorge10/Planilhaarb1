import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verificar se o backend está online
    const healthCheck = await fetch('https://planilhaarb1.onrender.com/api/health', {
      method: 'GET',
      timeout: 5000,
    }).catch(() => null);

    if (!healthCheck || !healthCheck.ok) {
      return NextResponse.json({ 
        error: 'Backend temporariamente offline. Tente novamente em alguns minutos.' 
      }, { status: 503 });
    }
    
    const response = await fetch('https://planilhaarb1.onrender.com/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Erro no proxy:', error);
    return NextResponse.json({ 
      error: 'Backend temporariamente offline. Tente novamente em alguns minutos.' 
    }, { status: 503 });
  }
}