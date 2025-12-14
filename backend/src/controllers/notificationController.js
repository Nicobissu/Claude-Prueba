import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMyNotifications = async (req, res) => {
  try {
    const { unreadOnly } = req.query;

    const where = {
      forUserId: req.user.id
    };

    if (unreadOnly === 'true') {
      where.read = false;
    }

    const notifications = await prisma.notification.findMany({
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
        solPed: {
          select: {
            id: true,
            status: true,
            priority: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { read: true }
    });

    res.json(notification);
  } catch (error) {
    console.error('Error marcando notificación como leída:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        forUserId: req.user.id,
        read: false
      },
      data: { read: true }
    });

    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('Error marcando todas las notificaciones como leídas:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: {
        forUserId: req.user.id,
        read: false
      }
    });

    res.json({ count });
  } catch (error) {
    console.error('Error obteniendo contador de notificaciones:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
