import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, stepName, stepOrder, completed, timeSpent, data, email, name, source, campaign } = body;

    if (!stepName || stepOrder === undefined) {
      return NextResponse.json(
        { error: 'Nome e ordem do step são obrigatórios' },
        { status: 400 }
      );
    }

    let lead = null;

    // Se não há leadId, tentar encontrar ou criar lead
    if (!leadId) {
      if (email) {
        // Tentar encontrar lead existente por email
        lead = await prisma.lead.findUnique({
          where: { email }
        });
      }

      // Se não encontrou lead, criar um novo
      if (!lead) {
        lead = await prisma.lead.create({
          data: {
            email,
            name,
            source: source || 'website',
            campaign,
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
            userAgent: request.headers.get('user-agent'),
            referrer: request.headers.get('referer'),
            // Capturar dados adicionais do onboarding
            ...(data && {
              onboardingData: JSON.parse(JSON.stringify(data))
            })
          }
        });
      } else {
        // Atualizar lead existente com dados do onboarding se disponível
        if (data) {
          await prisma.lead.update({
            where: { id: lead.id },
            data: {
              onboardingData: data
            }
          });
        }
      }
    } else {
      // Buscar lead existente
      lead = await prisma.lead.findUnique({
        where: { id: leadId }
      });

      if (!lead) {
        return NextResponse.json(
          { error: 'Lead não encontrado' },
          { status: 404 }
        );
      }
    }

    // Verificar se já existe um step com este nome para este lead
    const existingStep = await prisma.funnelStep.findFirst({
      where: {
        leadId: lead.id,
        stepName
      }
    });

    let funnelStep;

    if (existingStep) {
      // Atualizar step existente
      funnelStep = await prisma.funnelStep.update({
        where: { id: existingStep.id },
        data: {
          completed: completed !== undefined ? completed : existingStep.completed,
          timeSpent: timeSpent || existingStep.timeSpent,
          data: data ? JSON.parse(JSON.stringify(data)) : existingStep.data,
          completedAt: completed ? new Date() : existingStep.completedAt,
        },
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
            }
          }
        }
      });
    } else {
      // Criar novo step
      funnelStep = await prisma.funnelStep.create({
        data: {
          leadId: lead.id,
          stepName,
          stepOrder,
          completed: completed || false,
          timeSpent,
          data: data ? JSON.parse(JSON.stringify(data)) : null,
          completedAt: completed ? new Date() : null,
        },
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
            }
          }
        }
      });
    }

    // Se o step foi completado, atualizar score do lead
    if (completed && !existingStep?.completed) {
      const scoreIncrement = Math.max(1, Math.floor((stepOrder / 10) * 5)); // Score baseado na ordem do step
      
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          score: {
            increment: scoreIncrement
          }
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      funnelStep,
      leadId: lead.id
    });

  } catch (error) {
    console.error('Erro ao registrar step do funil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
