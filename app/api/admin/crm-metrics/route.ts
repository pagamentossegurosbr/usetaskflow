import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptionsFixed } from '@/lib/auth-fixed';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptionsFixed);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30';
    
    // Calcular datas
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    const days = parseInt(period);

    // Buscar métricas de leads
    const leadsMetrics = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN created_at >= ${startDate} THEN 1 END) as new,
        COUNT(CASE WHEN status = 'CONVERTED' THEN 1 END) as converted,
        AVG(score) as average_score
      FROM leads
    `;

    // Buscar métricas de links
    const linksMetrics = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active,
        SUM(current_uses) as total_clicks
      FROM invite_links
    `;

    // Buscar leads por status
    const leadsByStatus = await prisma.$queryRaw`
      SELECT status, COUNT(*) as count
      FROM leads
      GROUP BY status
    `;

    // Buscar leads por fonte
    const leadsBySource = await prisma.$queryRaw`
      SELECT source, COUNT(*) as count
      FROM leads
      GROUP BY source
    `;

    // Buscar atividades recentes
    const recentActivities = await prisma.$queryRaw`
      SELECT 
        la.id,
        la.type,
        la.action,
        la.created_at as "createdAt",
        l.name as "leadName",
        l.email as "leadEmail",
        l.status as "leadStatus"
      FROM lead_activities la
      LEFT JOIN leads l ON la.lead_id = l.id
      ORDER BY la.created_at DESC
      LIMIT 10
    `;

    const metrics = leadsMetrics[0];
    const linksData = linksMetrics[0];

    const response = {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days: days
      },
      leads: {
        total: parseInt(metrics.total) || 0,
        new: parseInt(metrics.new) || 0,
        converted: parseInt(metrics.converted) || 0,
        conversionRate: metrics.total > 0 ? (parseInt(metrics.converted) / parseInt(metrics.total)) : 0,
        averageScore: parseFloat(metrics.average_score) || 0,
        byStatus: leadsByStatus,
        bySource: leadsBySource,
        byCampaign: [],
        topLeads: []
      },
      links: {
        total: parseInt(linksData.total) || 0,
        active: parseInt(linksData.active) || 0,
        totalClicks: parseInt(linksData.total_clicks) || 0,
        clickToLeadRate: 0,
        byLink: []
      },
      funnel: {
        steps: [],
        averageTimePerStep: 0
      },
      activities: {
        recent: recentActivities
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erro ao buscar métricas do CRM:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
