import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpiar datos existentes
  await prisma.notification.deleteMany();
  await prisma.history.deleteMany();
  await prisma.todo.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.solPedItem.deleteMany();
  await prisma.solPed.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.area.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Datos anteriores eliminados');

  // Hash de contraseñas
  const passwordHash = await bcrypt.hash('pass123', 10);

  // Crear usuarios
  const pedidor1 = await prisma.user.create({
    data: {
      username: 'pedidor1',
      password: passwordHash,
      email: 'pedidor1@empresa.com',
      fullName: 'Juan Pérez (Taller)',
      role: 'PEDIDOR'
    }
  });

  const adminCompras = await prisma.user.create({
    data: {
      username: 'admincompras1',
      password: passwordHash,
      email: 'compras@empresa.com',
      fullName: 'María García (Compras)',
      role: 'ADMINISTRACION'
    }
  });

  const validador = await prisma.user.create({
    data: {
      username: 'validador1',
      password: passwordHash,
      email: 'validador@empresa.com',
      fullName: 'Carlos López (Validador)',
      role: 'VALIDADOR'
    }
  });

  const admin = await prisma.user.create({
    data: {
      username: 'admin1',
      password: passwordHash,
      email: 'admin@empresa.com',
      fullName: 'Ana Rodríguez (Admin)',
      role: 'ADMIN'
    }
  });

  console.log('✅ Usuarios creados:');
  console.log('   - pedidor1 / pass123');
  console.log('   - admincompras1 / pass123');
  console.log('   - validador1 / pass123');
  console.log('   - admin1 / pass123');

  // Crear áreas
  const areaTaller = await prisma.area.create({
    data: { name: 'Taller Mecánico', description: 'Área de mantenimiento mecánico' }
  });

  const areaElectrica = await prisma.area.create({
    data: { name: 'Taller Eléctrico', description: 'Área de mantenimiento eléctrico' }
  });

  const areaAlmacen = await prisma.area.create({
    data: { name: 'Almacén', description: 'Área de almacenamiento' }
  });

  const areaProduccion = await prisma.area.create({
    data: { name: 'Producción', description: 'Área de producción' }
  });

  console.log('✅ Áreas creadas: Taller Mecánico, Taller Eléctrico, Almacén, Producción');

  // Crear unidades
  const unidades = [
    { name: 'Unidad', symbol: 'un' },
    { name: 'Metro', symbol: 'm' },
    { name: 'Kilogramo', symbol: 'kg' },
    { name: 'Litro', symbol: 'L' },
    { name: 'Caja', symbol: 'caja' },
    { name: 'Paquete', symbol: 'paq' },
    { name: 'Juego', symbol: 'jgo' },
    { name: 'Par', symbol: 'par' },
    { name: 'Lata', symbol: 'lata' },
    { name: 'Rollo', symbol: 'rollo' }
  ];

  for (const unidad of unidades) {
    await prisma.unit.create({ data: unidad });
  }

  console.log('✅ Unidades creadas: un, m, kg, L, caja, paq, jgo, par, lata, rollo');

  // Crear una SolPed de ejemplo
  const currentYear = new Date().getFullYear();
  const solPedId = `SP-${currentYear}-000001`;

  const solPed1 = await prisma.solPed.create({
    data: {
      id: solPedId,
      status: 'BORRADOR',
      priority: 'ALTA',
      createdById: pedidor1.id,
      areaId: areaTaller.id,
      neededBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días desde ahora
      workOrder: 'OT-2025-123',
      justification: 'Necesario para reparación de equipos críticos',
      observations: 'Urgente, equipos parados'
    }
  });

  // Obtener ID de unidad
  const unidadUn = await prisma.unit.findFirst({ where: { symbol: 'un' } });
  const unidadCaja = await prisma.unit.findFirst({ where: { symbol: 'caja' } });
  const unidadLitro = await prisma.unit.findFirst({ where: { symbol: 'L' } });

  // Crear items de la SolPed
  await prisma.solPedItem.create({
    data: {
      solPedId: solPed1.id,
      quantity: 2,
      unitId: unidadUn.id,
      name: 'Rodamiento SKF 6205',
      specification: 'Rodamiento rígido de bolas, diámetro 25mm',
      brand: 'SKF',
      observations: 'Verificar compatibilidad'
    }
  });

  await prisma.solPedItem.create({
    data: {
      solPedId: solPed1.id,
      quantity: 1,
      unitId: unidadCaja.id,
      name: 'Tornillos M8x40',
      specification: 'Tornillos hexagonales galvanizados',
      observations: 'Caja de 100 unidades'
    }
  });

  await prisma.solPedItem.create({
    data: {
      solPedId: solPed1.id,
      quantity: 5,
      unitId: unidadLitro.id,
      name: 'Aceite hidráulico ISO 68',
      specification: 'Aceite hidráulico mineral',
      brand: 'Shell o equivalente'
    }
  });

  console.log(`✅ SolPed de ejemplo creada: ${solPedId} con 3 items`);

  // Crear historial inicial
  await prisma.history.create({
    data: {
      solPedId: solPed1.id,
      userId: pedidor1.id,
      newStatus: 'BORRADOR',
      action: 'Solicitud creada'
    }
  });

  console.log('✅ Historial inicial creado');
  console.log('\n🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
