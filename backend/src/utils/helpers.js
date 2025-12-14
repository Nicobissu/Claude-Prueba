import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const generateSolPedId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `SP-${currentYear}-`;

  // Buscar la última SolPed del año actual
  const lastSolPed = await prisma.solPed.findFirst({
    where: {
      id: {
        startsWith: prefix
      }
    },
    orderBy: {
      id: 'desc'
    }
  });

  let nextNumber = 1;

  if (lastSolPed) {
    const lastNumber = parseInt(lastSolPed.id.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  const paddedNumber = String(nextNumber).padStart(6, '0');
  return `${prefix}${paddedNumber}`;
};

export const canEditSolPed = (solPed, user) => {
  // El pedidor solo puede editar en BORRADOR y si es el creador
  if (user.role === 'PEDIDOR') {
    return solPed.status === 'BORRADOR' && solPed.createdById === user.id;
  }

  // Administración puede editar desde ENVIADA_ADMINISTRACION hasta ORDEN_COMPRA_GENERADA
  if (user.role === 'ADMINISTRACION') {
    const editableStatuses = [
      'ENVIADA_ADMINISTRACION',
      'EN_REVISION_COTIZANDO',
      'PENDIENTE_VALIDACION_PRECIO',
      'RECHAZADA_VALIDACION',
      'APROBADA_PARA_COMPRAR',
      'ORDEN_COMPRA_GENERADA',
      'COMPRADA'
    ];
    return editableStatuses.includes(solPed.status);
  }

  // Validador solo puede validar, no editar
  if (user.role === 'VALIDADOR') {
    return false;
  }

  // Admin puede editar cualquier cosa
  if (user.role === 'ADMIN') {
    return true;
  }

  return false;
};

export const getNextValidStatuses = (currentStatus, userRole) => {
  const transitions = {
    BORRADOR: {
      PEDIDOR: ['ENVIADA_ADMINISTRACION'],
      ADMINISTRACION: [],
      VALIDADOR: [],
      ADMIN: ['ENVIADA_ADMINISTRACION', 'CANCELADA']
    },
    ENVIADA_ADMINISTRACION: {
      PEDIDOR: [],
      ADMINISTRACION: ['EN_REVISION_COTIZANDO', 'CANCELADA'],
      VALIDADOR: [],
      ADMIN: ['EN_REVISION_COTIZANDO', 'CANCELADA']
    },
    EN_REVISION_COTIZANDO: {
      PEDIDOR: [],
      ADMINISTRACION: ['PENDIENTE_VALIDACION_PRECIO', 'CANCELADA'],
      VALIDADOR: [],
      ADMIN: ['PENDIENTE_VALIDACION_PRECIO', 'CANCELADA']
    },
    PENDIENTE_VALIDACION_PRECIO: {
      PEDIDOR: [],
      ADMINISTRACION: [],
      VALIDADOR: ['APROBADA_PARA_COMPRAR', 'RECHAZADA_VALIDACION'],
      ADMIN: ['APROBADA_PARA_COMPRAR', 'RECHAZADA_VALIDACION', 'CANCELADA']
    },
    RECHAZADA_VALIDACION: {
      PEDIDOR: [],
      ADMINISTRACION: ['EN_REVISION_COTIZANDO', 'CANCELADA'],
      VALIDADOR: [],
      ADMIN: ['EN_REVISION_COTIZANDO', 'CANCELADA']
    },
    APROBADA_PARA_COMPRAR: {
      PEDIDOR: [],
      ADMINISTRACION: ['ORDEN_COMPRA_GENERADA', 'CANCELADA'],
      VALIDADOR: [],
      ADMIN: ['ORDEN_COMPRA_GENERADA', 'CANCELADA']
    },
    ORDEN_COMPRA_GENERADA: {
      PEDIDOR: [],
      ADMINISTRACION: ['COMPRADA', 'CANCELADA'],
      VALIDADOR: [],
      ADMIN: ['COMPRADA', 'CANCELADA']
    },
    COMPRADA: {
      PEDIDOR: [],
      ADMINISTRACION: ['RECIBIDA_ENTREGADA'],
      VALIDADOR: [],
      ADMIN: ['RECIBIDA_ENTREGADA']
    },
    RECIBIDA_ENTREGADA: {
      PEDIDOR: [],
      ADMINISTRACION: [],
      VALIDADOR: [],
      ADMIN: []
    },
    CANCELADA: {
      PEDIDOR: [],
      ADMINISTRACION: [],
      VALIDADOR: [],
      ADMIN: []
    }
  };

  return transitions[currentStatus]?.[userRole] || [];
};

export const formatSolPedForResponse = (solPed) => {
  return {
    ...solPed,
    createdBy: solPed.createdBy ? {
      id: solPed.createdBy.id,
      username: solPed.createdBy.username,
      fullName: solPed.createdBy.fullName,
      role: solPed.createdBy.role
    } : null
  };
};
