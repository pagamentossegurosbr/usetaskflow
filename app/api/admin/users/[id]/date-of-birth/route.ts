import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin (OWNER ou MODERATOR)
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!adminUser || (adminUser.role !== 'OWNER' && adminUser.role !== 'MODERATOR')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { dateOfBirth } = body;

    if (!dateOfBirth) {
      return NextResponse.json({ error: 'Data de nascimento é obrigatória' }, { status: 400 });
    }

    // Validar formato da data
    const date = new Date(dateOfBirth);
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Data de nascimento inválida' }, { status: 400 });
    }

    // Verificar se a data não é no futuro
    if (date > new Date()) {
      return NextResponse.json({ error: 'Data de nascimento não pode ser no futuro' }, { status: 400 });
    }

    // Verificar se a data não é muito antiga (mais de 120 anos)
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 120);
    if (date < minDate) {
      return NextResponse.json({ error: 'Data de nascimento inválida' }, { status: 400 });
    }

    // Buscar usuário a ser atualizado
    const user = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Atualizar data de nascimento (admin pode alterar sem restrições)
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        dateOfBirth: date,
        // Não alterar o contador de mudanças para o admin
      }
    });

    // Registrar a ação no log de atividades
    await prisma.activityLog.create({
      data: {
        userId: adminUser.id,
        action: 'ADMIN_UPDATE_DATE_OF_BIRTH',
        details: {
          targetUserId: params.id,
          targetUserEmail: user.email,
          oldDateOfBirth: user.dateOfBirth,
          newDateOfBirth: date,
          adminEmail: adminUser.email,
          timestamp: new Date().toISOString(),
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.ip || null,
        userAgent: request.headers.get('user-agent') || null,
      },
    });

    return NextResponse.json({ 
      message: 'Data de nascimento atualizada com sucesso pelo administrador',
      dateOfBirth: date,
      changeCount: updatedUser.dateOfBirthChangeCount
    });

  } catch (error) {
    console.error('Erro ao atualizar data de nascimento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
