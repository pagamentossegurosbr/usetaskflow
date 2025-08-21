const { PrismaClient } = require('@prisma/client');

console.log('🔤 CRIANDO ENUMS NO BANCO DE DADOS');
console.log('===================================\n');

async function createEnums() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conectado com sucesso');
    
    // SQL para criar o enum Role
    const createRoleEnum = `
      DO $$ BEGIN
        CREATE TYPE "Role" AS ENUM ('USER', 'MODERATOR', 'OWNER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    
    console.log('📝 Criando enum Role...');
    await prisma.$executeRawUnsafe(createRoleEnum);
    console.log('✅ Enum Role criado');
    
    // SQL para criar o enum LeadStatus
    const createLeadStatusEnum = `
      DO $$ BEGIN
        CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST', 'ARCHIVED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    
    console.log('📝 Criando enum LeadStatus...');
    await prisma.$executeRawUnsafe(createLeadStatusEnum);
    console.log('✅ Enum LeadStatus criado');
    
    // SQL para criar o enum InviteLinkType
    const createInviteLinkTypeEnum = `
      DO $$ BEGIN
        CREATE TYPE "InviteLinkType" AS ENUM ('GENERAL', 'PARTNER', 'AFFILIATE', 'REFERRAL', 'CAMPAIGN');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    
    console.log('📝 Criando enum InviteLinkType...');
    await prisma.$executeRawUnsafe(createInviteLinkTypeEnum);
    console.log('✅ Enum InviteLinkType criado');
    
    console.log('\n🎉 Todos os enums criados com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar enums:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar criação dos enums
createEnums();
