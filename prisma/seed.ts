import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@igreja.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "trocar-esta-senha";
const TAGS = ["louvor", "adoração", "celebração", "ceia", "jovens"];

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: { name: "Administrador", email: ADMIN_EMAIL, passwordHash, role: "ADMIN" },
  });

  for (const nome of TAGS) {
    await prisma.tag.upsert({ where: { nome }, update: {}, create: { nome } });
  }

  console.log(`Usuário admin pronto: ${admin.email}`);
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log(`Senha inicial: ${ADMIN_PASSWORD} (troque após o primeiro login)`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
