const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixBlogData() {
  try {
    console.log('🔍 Verificando dados do blog...');

    // Buscar todos os posts do blog
    const posts = await prisma.blogPost.findMany();
    console.log(`📝 Encontrados ${posts.length} posts`);

    for (const post of posts) {
      console.log(`\n📄 Post: ${post.title}`);
      console.log(`   Tags originais: ${post.tags}`);
      
      // Verificar se as tags são válidas
      if (post.tags) {
        try {
          // Se já é um array, está ok
          if (Array.isArray(post.tags)) {
            console.log(`   ✅ Tags já são um array válido`);
            continue;
          }
          
          // Se é string, tentar fazer parse
          if (typeof post.tags === 'string') {
            const parsedTags = JSON.parse(post.tags);
            if (Array.isArray(parsedTags)) {
              console.log(`   ✅ Tags parseadas com sucesso: ${parsedTags.join(', ')}`);
              continue;
            }
          }
        } catch (error) {
          console.log(`   ❌ Erro ao parsear tags: ${error.message}`);
          
          // Tentar corrigir tags inválidas
          let fixedTags = [];
          
          if (typeof post.tags === 'string') {
            // Se parece ser uma string separada por vírgulas, converter para array
            if (post.tags.includes(',')) {
              fixedTags = post.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
            } else {
              // Se é uma única tag
              fixedTags = [post.tags.trim()];
            }
          }
          
          if (fixedTags.length > 0) {
            console.log(`   🔧 Corrigindo tags para: ${fixedTags.join(', ')}`);
            
            // Atualizar o post com as tags corrigidas
            await prisma.blogPost.update({
              where: { id: post.id },
              data: { tags: fixedTags }
            });
            
            console.log(`   ✅ Tags corrigidas!`);
          } else {
            console.log(`   ⚠️  Não foi possível corrigir as tags, definindo como array vazio`);
            await prisma.blogPost.update({
              where: { id: post.id },
              data: { tags: [] }
            });
          }
        }
      } else {
        console.log(`   ℹ️  Post sem tags`);
      }
    }

    console.log('\n✅ Verificação concluída!');
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixBlogData();



