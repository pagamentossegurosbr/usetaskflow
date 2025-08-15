import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        error: 'Tipo de arquivo inválido. Apenas imagens são permitidas.' 
      }, { status: 400 });
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'Arquivo muito grande. Máximo 5MB permitido.' 
      }, { status: 400 });
    }

    // Converter para base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Atualizar avatar no banco de dados
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: dataUrl }
    });

    // Log da atividade
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_AVATAR',
        details: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      avatar: dataUrl,
      message: 'Avatar atualizado com sucesso!' 
    });

  } catch (error) {
    console.error('Erro ao processar upload de avatar:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Remover avatar do banco de dados
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: null }
    });

    // Log da atividade
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'REMOVE_AVATAR',
        details: {}
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Avatar removido com sucesso!' 
    });

  } catch (error) {
    console.error('Erro ao remover avatar:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
} 