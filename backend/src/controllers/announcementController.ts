import { Request, Response } from 'express';
import { prisma } from '../index';

export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { title, text, district } = req.body;
    const authorId = req.user?.id;

    if (!authorId || (req.user?.role !== 'CM' && req.user?.role !== 'MINISTER')) {
      return res.status(403).json({ error: 'Only CM or Minister can create announcements' });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        text,
        district: district || 'All',
        authorId
      }
    });

    res.status(201).json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const { district } = req.query;
    let query: any = {};

    if (district && district !== 'All') {
      query = {
        OR: [
          { district: district as string },
          { district: 'All' }
        ]
      };
    }

    const announcements = await prisma.announcement.findMany({
      where: query,
      orderBy: { createdAt: 'desc' }
    });

    res.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
