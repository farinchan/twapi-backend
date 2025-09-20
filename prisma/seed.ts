import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import * as bcrypt from 'bcrypt';

async function main() {
    const user = await prisma.user.upsert({
        where: { email: 'fajri@gariskode.com' },
        update: {},
        create: {
            email: 'fajri@gariskode.com',
            name: 'Fajri Rinaldi Chan',
            password: await bcrypt.hash('password', 10),
            role: 'ADMIN',
        },
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
