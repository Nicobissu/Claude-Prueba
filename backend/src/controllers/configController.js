import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ÁREAS
export const getAllAreas = async (req, res) => {
  try {
    const areas = await prisma.area.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    });

    res.json(areas);
  } catch (error) {
    console.error('Error obteniendo áreas:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const createArea = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const area = await prisma.area.create({
      data: { name, description }
    });

    res.status(201).json(area);
  } catch (error) {
    console.error('Error creando área:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const updateArea = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, active } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (active !== undefined) updateData.active = active;

    const area = await prisma.area.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(area);
  } catch (error) {
    console.error('Error actualizando área:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const deleteArea = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.area.update({
      where: { id: parseInt(id) },
      data: { active: false }
    });

    res.json({ message: 'Área desactivada exitosamente' });
  } catch (error) {
    console.error('Error eliminando área:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// UNIDADES
export const getAllUnits = async (req, res) => {
  try {
    const units = await prisma.unit.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    });

    res.json(units);
  } catch (error) {
    console.error('Error obteniendo unidades:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const createUnit = async (req, res) => {
  try {
    const { name, symbol } = req.body;

    if (!name || !symbol) {
      return res.status(400).json({ error: 'Nombre y símbolo son requeridos' });
    }

    const unit = await prisma.unit.create({
      data: { name, symbol }
    });

    res.status(201).json(unit);
  } catch (error) {
    console.error('Error creando unidad:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, symbol, active } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (symbol !== undefined) updateData.symbol = symbol;
    if (active !== undefined) updateData.active = active;

    const unit = await prisma.unit.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(unit);
  } catch (error) {
    console.error('Error actualizando unidad:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.unit.update({
      where: { id: parseInt(id) },
      data: { active: false }
    });

    res.json({ message: 'Unidad desactivada exitosamente' });
  } catch (error) {
    console.error('Error eliminando unidad:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
