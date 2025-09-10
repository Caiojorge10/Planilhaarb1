import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const entity = url.searchParams.get('entity');
    const id = url.searchParams.get('id');
    
    if (!entity || !id) {
      return NextResponse.json({ error: 'Entity e ID são obrigatórios' }, { status: 400 });
    }
    
    if (isNaN(Number(id))) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }
    
    const validEntities = ['casas', 'arbitragens', 'freebets', 'freespins', 'movimentacoes', 'ganhos', 'percas'];
    if (!validEntities.includes(entity)) {
      return NextResponse.json({ error: 'Entity inválida' }, { status: 400 });
    }
    
    const response = await fetch(`https://planilhaarb1.onrender.com/api/${entity}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
