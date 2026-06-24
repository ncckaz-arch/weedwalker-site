import { NextResponse } from 'next/server';
import { EntertainmentActivityType } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

const strains = [
  { name: 'Focus Walker', vibe: 'clear conversation', method: 'Hydroponics Rockwool' },
  { name: 'Night Soil', vibe: 'slow evening ritual', method: 'Living Soil' },
  { name: 'Golden Coco', vibe: 'smooth daytime mood', method: 'Smooth Coco Line' },
  { name: 'Jedi Craft', vibe: 'creative session', method: 'Craft Cultivation' },
  { name: 'Aero Pulse', vibe: 'science-forward energy', method: 'Aeroponics' }
];

export async function POST() {
  if (process.env.ENABLE_RANDOM_PROMO !== 'true') {
    return NextResponse.json({ error: 'Random promo is disabled.' }, { status: 404 });
  }

  const user = await getCurrentUser();
  const result = strains[Math.floor(Math.random() * strains.length)];

  await prisma.entertainmentActivityLog.create({
    data: {
      userId: user?.id,
      activityType: EntertainmentActivityType.STRAIN_RANDOMIZER,
      payload: result
    }
  });

  return NextResponse.json({ result });
}
