import { PrismaClient } from '@prisma/client';
import { generateSolPedId, canEditSolPed, getNextValidStatuses } from '../utils/helpers.js';

const prisma = new PrismaClient();

export const createSolPed = async (req, res) => {
  try {
    const { areaId, priority, neededBy, workOrder, justification, observations, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Debe incluir al menos un ítem' });
    }

    const solPedId = await generateSolPedId();

    const solPed = await prisma.solPed.create({
      data: {
        id: solPedId,
        status: 'BORRADOR',
        priority: priority || 'MEDIA',
        createdById: req.user.id,
        areaId: areaId ? parseInt(areaId) : null,
        neededBy: neededBy ? new Date(neededBy) : null,
        workOrder,
        justification,
        observations,
        items: {
          create: items.map(item => ({
            quantity: parseFloat(item.quantity),
            unitId: parseInt(item.unitId),
            name: item.name,
            specification: item.specification,
            brand: item.brand,
            suggestedLink: item.suggestedLink,
            observations: item.observations,
            unitPrice: item.unitPrice ? parseFloat(item.unitPrice) : null
          }))
        },
        history: {
          create: {
            userId: req.user.id,
            newStatus: 'BORRADOR',
            action: 'Solicitud creada'
          }
        }
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true
          }
        },
        area: true,
        items: {
          include: {
            unit: true
          }
        }
      }
    });

    res.status(201).json(solPed);
  } catch (error) {
    console.error('Error creando SolPed:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const getAllSolPeds = async (req, res) => {
  try {
    const { status, priority, areaId, createdById, search } = req.query;

    const where = {};

    // Filtros según rol
    if (req.user.role === 'PEDIDOR') {
      where.createdById = req.user.id;
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (areaId) where.areaId = parseInt(areaId);
    if (createdById) where.createdById = parseInt(createdById);

    if (search) {
      where.OR = [
        { id: { contains: search } },
        { workOrder: { contains: search } },
        { justification: { contains: search } },
        { supplier: { contains: search } }
      ];
    }

    const solpeds = await prisma.solPed.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true
          }
        },
        area: true,
        items: {
          include: {
            unit: true
          }
        },
        _count: {
          select: {
            comments: true,
            todos: { where: { completed: false } }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(solpeds);
  } catch (error) {
    console.error('Error obteniendo SolPeds:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const getSolPedById = async (req, res) => {
  try {
    const { id } = req.params;

    const solPed = await prisma.solPed.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true
          }
        },
        area: true,
        items: {
          include: {
            unit: true
          },
          orderBy: {
            id: 'asc'
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        todos: {
          include: {
            createdBy: {
              select: {
                id: true,
                username: true,
                fullName: true
              }
            },
            assignedTo: {
              select: {
                id: true,
                username: true,
                fullName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        history: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        attachments: {
          orderBy: {
            uploadedAt: 'desc'
          }
        }
      }
    });

    if (!solPed) {
      return res.status(404).json({ error: 'SolPed no encontrada' });
    }

    // Verificar permisos
    if (req.user.role === 'PEDIDOR' && solPed.createdById !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para ver esta solicitud' });
    }

    res.json(solPed);
  } catch (error) {
    console.error('Error obteniendo SolPed:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const updateSolPed = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const solPed = await prisma.solPed.findUnique({
      where: { id }
    });

    if (!solPed) {
      return res.status(404).json({ error: 'SolPed no encontrada' });
    }

    if (!canEditSolPed(solPed, req.user)) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta solicitud' });
    }

    const dataToUpdate = {};

    // Campos que puede editar el pedidor
    if (req.user.role === 'PEDIDOR' && solPed.status === 'BORRADOR') {
      if (updateData.areaId !== undefined) dataToUpdate.areaId = updateData.areaId ? parseInt(updateData.areaId) : null;
      if (updateData.priority) dataToUpdate.priority = updateData.priority;
      if (updateData.neededBy !== undefined) dataToUpdate.neededBy = updateData.neededBy ? new Date(updateData.neededBy) : null;
      if (updateData.workOrder !== undefined) dataToUpdate.workOrder = updateData.workOrder;
      if (updateData.justification !== undefined) dataToUpdate.justification = updateData.justification;
      if (updateData.observations !== undefined) dataToUpdate.observations = updateData.observations;
    }

    // Campos que puede editar administración
    if (req.user.role === 'ADMINISTRACION' || req.user.role === 'ADMIN') {
      if (updateData.supplier !== undefined) dataToUpdate.supplier = updateData.supplier;
      if (updateData.supplierContact !== undefined) dataToUpdate.supplierContact = updateData.supplierContact;
      if (updateData.conditions !== undefined) dataToUpdate.conditions = updateData.conditions;
      if (updateData.totalPrice !== undefined) dataToUpdate.totalPrice = updateData.totalPrice ? parseFloat(updateData.totalPrice) : null;
      if (updateData.currency !== undefined) dataToUpdate.currency = updateData.currency;
      if (updateData.quotationDate !== undefined) dataToUpdate.quotationDate = updateData.quotationDate ? new Date(updateData.quotationDate) : null;
      if (updateData.purchaseOrder !== undefined) dataToUpdate.purchaseOrder = updateData.purchaseOrder;
      if (updateData.purchaseDate !== undefined) dataToUpdate.purchaseDate = updateData.purchaseDate ? new Date(updateData.purchaseDate) : null;
      if (updateData.estimatedDelivery !== undefined) dataToUpdate.estimatedDelivery = updateData.estimatedDelivery ? new Date(updateData.estimatedDelivery) : null;
      if (updateData.receivedDate !== undefined) dataToUpdate.receivedDate = updateData.receivedDate ? new Date(updateData.receivedDate) : null;
    }

    const updated = await prisma.solPed.update({
      where: { id },
      data: dataToUpdate,
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true
          }
        },
        area: true,
        items: {
          include: {
            unit: true
          }
        }
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error actualizando SolPed:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const updateSolPedStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'El nuevo estado es requerido' });
    }

    const solPed = await prisma.solPed.findUnique({
      where: { id },
      include: {
        createdBy: true
      }
    });

    if (!solPed) {
      return res.status(404).json({ error: 'SolPed no encontrada' });
    }

    const validStatuses = getNextValidStatuses(solPed.status, req.user.role);

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `No puedes cambiar de ${solPed.status} a ${status}`,
        validStatuses
      });
    }

    // Si es rechazo de validación, requerir motivo
    if (status === 'RECHAZADA_VALIDACION' && !notes) {
      return res.status(400).json({ error: 'Debe proporcionar un motivo de rechazo' });
    }

    const updated = await prisma.solPed.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === 'RECHAZADA_VALIDACION' ? notes : null,
        history: {
          create: {
            userId: req.user.id,
            previousStatus: solPed.status,
            newStatus: status,
            action: `Estado cambiado de ${solPed.status} a ${status}`,
            notes
          }
        }
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true
          }
        },
        area: true,
        items: {
          include: {
            unit: true
          }
        }
      }
    });

    // Crear notificación
    let notificationMessage = '';
    let notificationForUserId = null;

    if (status === 'ENVIADA_ADMINISTRACION') {
      notificationMessage = `Nueva solicitud ${id} enviada para revisión`;
      const adminUsers = await prisma.user.findMany({
        where: { role: 'ADMINISTRACION', active: true }
      });
      for (const admin of adminUsers) {
        await prisma.notification.create({
          data: {
            solPedId: id,
            forUserId: admin.id,
            createdById: req.user.id,
            message: notificationMessage,
            type: 'NEW'
          }
        });
      }
    } else if (status === 'PENDIENTE_VALIDACION_PRECIO') {
      notificationMessage = `Solicitud ${id} pendiente de validación de precio`;
      const validatorUsers = await prisma.user.findMany({
        where: { role: 'VALIDADOR', active: true }
      });
      for (const validator of validatorUsers) {
        await prisma.notification.create({
          data: {
            solPedId: id,
            forUserId: validator.id,
            createdById: req.user.id,
            message: notificationMessage,
            type: 'VALIDATION_REQUIRED'
          }
        });
      }
    } else {
      notificationMessage = `Solicitud ${id} cambió a estado: ${status}`;
      notificationForUserId = solPed.createdById;
      await prisma.notification.create({
        data: {
          solPedId: id,
          forUserId: notificationForUserId,
          createdById: req.user.id,
          message: notificationMessage,
          type: 'STATUS_CHANGE'
        }
      });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const updateSolPedItems = async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Debe incluir al menos un ítem' });
    }

    const solPed = await prisma.solPed.findUnique({
      where: { id }
    });

    if (!solPed) {
      return res.status(404).json({ error: 'SolPed no encontrada' });
    }

    if (!canEditSolPed(solPed, req.user)) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta solicitud' });
    }

    // Eliminar items existentes
    await prisma.solPedItem.deleteMany({
      where: { solPedId: id }
    });

    // Crear nuevos items
    const updated = await prisma.solPed.update({
      where: { id },
      data: {
        items: {
          create: items.map(item => ({
            quantity: parseFloat(item.quantity),
            unitId: parseInt(item.unitId),
            name: item.name,
            specification: item.specification,
            brand: item.brand,
            suggestedLink: item.suggestedLink,
            observations: item.observations,
            unitPrice: item.unitPrice ? parseFloat(item.unitPrice) : null
          }))
        }
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true
          }
        },
        area: true,
        items: {
          include: {
            unit: true
          }
        }
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error actualizando items:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const deleteSolPed = async (req, res) => {
  try {
    const { id } = req.params;

    const solPed = await prisma.solPed.findUnique({
      where: { id }
    });

    if (!solPed) {
      return res.status(404).json({ error: 'SolPed no encontrada' });
    }

    // Solo el creador puede eliminar si está en borrador, o admin puede eliminar cualquiera
    if (req.user.role === 'PEDIDOR') {
      if (solPed.createdById !== req.user.id || solPed.status !== 'BORRADOR') {
        return res.status(403).json({
          error: 'Solo puedes eliminar tus propias solicitudes en estado borrador'
        });
      }
    }

    await prisma.solPed.delete({
      where: { id }
    });

    res.json({ message: 'SolPed eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando SolPed:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const getStatistics = async (req, res) => {
  try {
    const where = {};

    if (req.user.role === 'PEDIDOR') {
      where.createdById = req.user.id;
    }

    const [
      total,
      borrador,
      enviadasAdmin,
      enRevision,
      pendientesValidacion,
      rechazadas,
      aprobadas,
      ordenCompra,
      compradas,
      recibidas,
      canceladas
    ] = await Promise.all([
      prisma.solPed.count({ where }),
      prisma.solPed.count({ where: { ...where, status: 'BORRADOR' } }),
      prisma.solPed.count({ where: { ...where, status: 'ENVIADA_ADMINISTRACION' } }),
      prisma.solPed.count({ where: { ...where, status: 'EN_REVISION_COTIZANDO' } }),
      prisma.solPed.count({ where: { ...where, status: 'PENDIENTE_VALIDACION_PRECIO' } }),
      prisma.solPed.count({ where: { ...where, status: 'RECHAZADA_VALIDACION' } }),
      prisma.solPed.count({ where: { ...where, status: 'APROBADA_PARA_COMPRAR' } }),
      prisma.solPed.count({ where: { ...where, status: 'ORDEN_COMPRA_GENERADA' } }),
      prisma.solPed.count({ where: { ...where, status: 'COMPRADA' } }),
      prisma.solPed.count({ where: { ...where, status: 'RECIBIDA_ENTREGADA' } }),
      prisma.solPed.count({ where: { ...where, status: 'CANCELADA' } })
    ]);

    res.json({
      total,
      byStatus: {
        BORRADOR: borrador,
        ENVIADA_ADMINISTRACION: enviadasAdmin,
        EN_REVISION_COTIZANDO: enRevision,
        PENDIENTE_VALIDACION_PRECIO: pendientesValidacion,
        RECHAZADA_VALIDACION: rechazadas,
        APROBADA_PARA_COMPRAR: aprobadas,
        ORDEN_COMPRA_GENERADA: ordenCompra,
        COMPRADA: compradas,
        RECIBIDA_ENTREGADA: recibidas,
        CANCELADA: canceladas
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
