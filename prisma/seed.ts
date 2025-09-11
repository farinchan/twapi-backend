import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.upsert({
        where: { email: 'fajri@example.com' },
        update: {},
        create: { email: 'fajri@example.com', name: 'Fajri Rinaldi Chan', password: 'password' },
    });

    await prisma.post.create({
        data: {
            title: 'First Post',
            slug: 'first-post',
            thumbnail: 'https://via.placeholder.com/150',
            excerpt: 'This is the excerpt of the first post.',
            content: 'This is the content of the first post.',
            authorId: user.id,
            published: true
        },
    });
}
main().finally(() => prisma.$disconnect());
