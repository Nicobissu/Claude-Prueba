import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createTodo = async (req, res) => {
  try {
    const { solPedId, text, dueDate, assignedToId } = req.body;

    if (!solPedId || !text) {
      return res.status(400).json({ error: 'SolPed ID y texto son requeridos' });
    }

    const solPed = await prisma.solPed.findUnique({
      where: { id: solPedId }
    });

    if (!solPed) {
      return res.status(404).json({ error: 'SolPed no encontrada' });
    }

    const todo = await prisma.todo.create({
      data: {
        solPedId,
        text,
        createdById: req.user.id,
        assignedToId: assignedToId ? parseInt(assignedToId) : null,
        dueDate: dueDate ? new Date(dueDate) : null
      },
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
      }
    });

    // Crear notificación si se asigna a alguien
    if (assignedToId && assignedToId !== req.user.id) {
      await prisma.notification.create({
        data: {
          solPedId,
          forUserId: parseInt(assignedToId),
          createdById: req.user.id,
          message: `Nueva tarea asignada en ${solPedId}`,
          type: 'TODO'
        }
      });
    }

    res.status(201).json(todo);
  } catch (error) {
    console.error('Error creando todo:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, completed, dueDate, assignedToId } = req.body;

    const updateData = {};

    if (text !== undefined) updateData.text = text;
    if (completed !== undefined) updateData.completed = completed;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId ? parseInt(assignedToId) : null;

    const todo = await prisma.todo.update({
      where: { id: parseInt(id) },
      data: updateData,
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
      }
    });

    res.json(todo);
  } catch (error) {
    console.error('Error actualizando todo:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.todo.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Tarea eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando todo:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
