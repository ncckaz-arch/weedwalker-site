import { NextResponse } from 'next/server';

import {
  getAdminCustomerDetail,
  serializeAdminCustomerDetail,
} from '@/lib/admin-customers';
import { requireCurrentAdminUser } from '@/lib/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    await requireCurrentAdminUser();

    const customer = await getAdminCustomerDetail(params.id);

    if (!customer) {
      return NextResponse.json({ error: 'CUSTOMER_NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json(serializeAdminCustomerDetail(customer));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';

    if (message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
    }

    if (message === 'ADMIN_REQUIRED') {
      return NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 });
    }

    console.error('[admin-customers] failed to load customer detail', error);
    return NextResponse.json({ error: 'CUSTOMER_DETAIL_FAILED' }, { status: 500 });
  }
}
