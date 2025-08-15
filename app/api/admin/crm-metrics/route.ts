import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // dias
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calcular datas
    const now = new Date();
    const end = endDate ? new Date(endDate) : now;
    const start = startDate ? new Date(startDate) : new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);

    // Métricas gerais de leads
    const [
      totalLeads,
      newLeads,
      convertedLeads,
      leadsByStatus,
      leadsBySource,
      leadsByCampaign,
      averageScore,
      topLeads,
    ] = await Promise.all([
      // Total de leads no período
      prisma.lead.count({
        where: {
          createdAt: { gte: start, lte: end }
        }
      }),
      
      // Novos leads no período
      prisma.lead.count({
        where: {
          createdAt: { gte: start, lte: end },
          status: 'NEW'
        }
      }),
      
      // Leads convertidos no período
      prisma.lead.count({
        where: {
          convertedAt: { gte: start, lte: end },
          status: 'CONVERTED'
        }
      }),
      
      // Leads por status
      prisma.lead.groupBy({
        by: ['status'],
        where: {
          createdAt: { gte: start, lte: end }
        },
        _count: {
          status: true
        }
      }),
      
      // Leads por fonte
      prisma.lead.groupBy({
        by: ['source'],
        where: {
          createdAt: { gte: start, lte: end }
        },
        _count: {
          source: true
        }
      }),
      
      // Leads por campanha
      prisma.lead.groupBy({
        by: ['campaign'],
        where: {
          createdAt: { gte: start, lte: end },
          campaign: { not: null }
        },
        _count: {
          campaign: true
        }
      }),
      
      // Score médio dos leads
      prisma.lead.aggregate({
        where: {
          createdAt: { gte: start, lte: end }
        },
        _avg: {
          score: true
        }
      }),
      
      // Top leads por score
      prisma.lead.findMany({
        where: {
          createdAt: { gte: start, lte: end }
        },
        orderBy: {
          score: 'desc'
        },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          score: true,
          status: true,
          source: true,
          createdAt: true,
          _count: {
            select: {
              activities: true,
              funnelSteps: true,
            }
          }
        }
      })
    ]);

    // Métricas de links de convite
    const [
      totalLinks,
      activeLinks,
      totalClicks,
      clicksByLink,
      clicksWithLeads,
    ] = await Promise.all([
      // Total de links
      prisma.inviteLink.count(),
      
      // Links ativos
      prisma.inviteLink.count({
        where: {
          isActive: true
        }
      }),
      
      // Total de cliques no período
      prisma.linkClick.count({
        where: {
          clickedAt: { gte: start, lte: end }
        }
      }),
      
      // Cliques por link
      prisma.linkClick.groupBy({
        by: ['linkId'],
        where: {
          clickedAt: { gte: start, lte: end }
        },
        _count: {
          linkId: true
        }
      }),
      
      // Cliques que geraram leads
      prisma.linkClick.count({
        where: {
          clickedAt: { gte: start, lte: end },
          leadId: { not: null }
        }
      })
    ]);

    // Métricas de funil
    const [
      funnelSteps,
      stepCompletion,
      averageTimePerStep,
    ] = await Promise.all([
      // Steps do funil
      prisma.funnelStep.groupBy({
        by: ['stepName'],
        where: {
          createdAt: { gte: start, lte: end }
        },
        _count: {
          stepName: true
        },
        _avg: {
          timeSpent: true
        }
      }),
      
      // Taxa de conclusão por step
      prisma.funnelStep.groupBy({
        by: ['stepName'],
        where: {
          createdAt: { gte: start, lte: end }
        },
        _count: {
          stepName: true
        }
      }),
      
      // Tempo médio por step
      prisma.funnelStep.aggregate({
        where: {
          createdAt: { gte: start, lte: end },
          timeSpent: { not: null }
        },
        _avg: {
          timeSpent: true
        }
      })
    ]);

    // Atividades recentes
    const recentActivities = await prisma.leadActivity.findMany({
      where: {
        createdAt: { gte: start, lte: end }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20,
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

    // Calcular taxas de conversão
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const clickToLeadRate = totalClicks > 0 ? (clicksWithLeads / totalClicks) * 100 : 0;

    // Preparar dados para gráficos
    const leadsByStatusChart = leadsByStatus.map(item => ({
      status: item.status,
      count: item._count.status
    }));

    const leadsBySourceChart = leadsBySource.map(item => ({
      source: item.source,
      count: item._count.source
    }));

    // Buscar steps completados para cada step do funil
    const completedStepsData = await Promise.all(
      funnelSteps.map(async (step) => {
        const completedSteps = await prisma.funnelStep.count({
          where: {
            stepName: step.stepName,
            completed: true,
            createdAt: { gte: start, lte: end }
          }
        });
        
        return {
          stepName: step.stepName,
          completedSteps,
          totalSteps: step._count.stepName,
          avgTime: step._avg.timeSpent || 0
        };
      })
    );

    const funnelChart = completedStepsData.map(data => {
      const completionRate = data.totalSteps > 0 ? 
        (data.completedSteps / data.totalSteps) * 100 : 0;
      
      return {
        step: data.stepName,
        total: data.totalSteps,
        completed: data.completedSteps,
        completionRate: Math.round(completionRate * 100) / 100,
        avgTime: Math.round(data.avgTime / 60) // em minutos
      };
    });

    return NextResponse.json({
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
        days: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      },
      leads: {
        total: totalLeads,
        new: newLeads,
        converted: convertedLeads,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averageScore: Math.round((averageScore._avg.score || 0) * 100) / 100,
        byStatus: leadsByStatusChart,
        bySource: leadsBySourceChart,
        byCampaign: leadsByCampaign.map(item => ({
          campaign: item.campaign,
          count: item._count.campaign
        })),
        topLeads
      },
      links: {
        total: totalLinks,
        active: activeLinks,
        totalClicks,
        clickToLeadRate: Math.round(clickToLeadRate * 100) / 100,
        byLink: clicksByLink.map(item => ({
          linkId: item.linkId,
          clicks: item._count.linkId
        }))
      },
      funnel: {
        steps: funnelChart,
        averageTimePerStep: Math.round((averageTimePerStep._avg.timeSpent || 0) / 60) // em minutos
      },
      activities: {
        recent: recentActivities
      }
    });

  } catch (error) {
    console.error('Erro ao buscar métricas do CRM:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
