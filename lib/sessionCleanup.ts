import { prisma } from "./prisma"

/**
 * Limpa sessões expiradas e corrompidas
 * Útil para resolver problemas com erro 431
 */
export async function cleanupExpiredSessions() {
  try {
    const now = new Date()
    
    // Limpar sessões expiradas
    const expiredSessions = await prisma.session.deleteMany({
      where: {
        expires: {
          lt: now
        }
      }
    })

    // Limpar tokens de verificação expirados
    const expiredTokens = await prisma.verificationToken.deleteMany({
      where: {
        expires: {
          lt: now
        }
      }
    })

    console.log(`Limpeza de sessões: ${expiredSessions.count} sessões e ${expiredTokens.count} tokens removidos`)
    
    return {
      sessionsRemoved: expiredSessions.count,
      tokensRemoved: expiredTokens.count
    }
  } catch (error) {
    console.error('Erro ao limpar sessões:', error)
    throw error
  }
}

/**
 * Limpa logs de atividade antigos para reduzir tamanho do banco
 */
export async function cleanupOldActivityLogs() {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const oldLogs = await prisma.activityLog.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    })

    console.log(`Limpeza de logs: ${oldLogs.count} logs antigos removidos`)
    
    return {
      logsRemoved: oldLogs.count
    }
  } catch (error) {
    console.error('Erro ao limpar logs:', error)
    throw error
  }
}

/**
 * Função principal para limpeza geral
 */
export async function performGeneralCleanup() {
  try {
    const [sessionsResult, logsResult] = await Promise.all([
      cleanupExpiredSessions(),
      cleanupOldActivityLogs()
    ])

    return {
      ...sessionsResult,
      ...logsResult
    }
  } catch (error) {
    console.error('Erro na limpeza geral:', error)
    throw error
  }
}
