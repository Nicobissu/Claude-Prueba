import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createComment = async (req, res) => {
  try {
    const { solPedId, text } = req.body;

    if (!solPedId || !text) {
      return res.status(400).json({ error: 'SolPed ID y texto son requeridos' });
    }

    const solPed = await prisma.solPed.findUnique({
      where: { id: solPedId },
      include: { createdBy: true }
    });

    if (!solPed) {
      return res.status(404).json({ error: 'SolPed no encontrada' });
    }

    const comment = await prisma.comment.create({
      data: {
        solPedId,
        userId: req.user.id,
        text
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true
          }
        }
      }
    });

    // Crear notificación para el creador si no es él quien comenta
    if (solPed.createdById !== req.user.id) {
      await prisma.notification.create({
        data: {
          solPedId,
          forUserId: solPed.createdById,
          createdById: req.user.id,
          message: `Nuevo comentario en ${solPedId}`,
          type: 'COMMENT'
        }
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creando comentario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const getCommentsBySolPed = async (req, res) => {
  try {
    const { solPedId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { solPedId },
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
    });

    res.json(comments);
  } catch (error) {
    console.error('Error obteniendo comentarios:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
