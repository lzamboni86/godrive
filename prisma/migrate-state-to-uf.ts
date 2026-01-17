import { PrismaClient } from '@prisma/client';

type IbgeState = {
  id: number;
  sigla: string;
  nome: string;
};

const prisma = new PrismaClient();

const IBGE_STATES_URL =
  'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome';

function normalize(s: string): string {
  return (s || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function looksLikeUf(value: string): boolean {
  const v = (value || '').trim();
  return /^[A-Z]{2}$/.test(v);
}

async function fetchIbgeStates(): Promise<IbgeState[]> {
  const res = await fetch(IBGE_STATES_URL);
  if (!res.ok) {
    throw new Error(`IBGE request failed: ${res.status}`);
  }
  return (await res.json()) as IbgeState[];
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');

  console.log('🔁 Migração Instructor.state: nome -> UF');
  console.log('🔎 Modo:', dryRun ? 'DRY RUN (sem atualizar banco)' : 'EXECUÇÃO (atualiza banco)');

  const ibgeStates = await fetchIbgeStates();
  const mapNameToUf = new Map<string, string>();
  for (const s of ibgeStates) {
    mapNameToUf.set(normalize(s.nome), s.sigla);
  }

  const instructors = await prisma.instructor.findMany({
    select: { id: true, state: true },
  });

  let total = 0;
  let migrated = 0;
  let skipped = 0;
  let unknown = 0;

  for (const inst of instructors) {
    total += 1;
    const current = (inst.state || '').trim();

    if (!current) {
      skipped += 1;
      continue;
    }

    if (looksLikeUf(current.toUpperCase())) {
      skipped += 1;
      continue;
    }

    const uf = mapNameToUf.get(normalize(current));
    if (!uf) {
      unknown += 1;
      console.log(`❓ Sem mapeamento: instructorId=${inst.id} state='${current}'`);
      continue;
    }

    migrated += 1;
    console.log(`✅ ${inst.id}: '${current}' -> '${uf}'`);

    if (!dryRun) {
      await prisma.instructor.update({
        where: { id: inst.id },
        data: { state: uf },
      });
    }
  }

  console.log('—');
  console.log('📊 Resumo');
  console.log('Total:', total);
  console.log('Migrados:', migrated);
  console.log('Ignorados:', skipped);
  console.log('Sem mapeamento:', unknown);

  if (dryRun) {
    console.log('ℹ️ Execute sem --dry-run para aplicar as alterações.');
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro na migração:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
