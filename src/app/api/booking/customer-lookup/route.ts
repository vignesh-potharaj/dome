import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql, eq, or } from 'drizzle-orm';
import { customers } from '@/lib/db/schema';
import { formatPhoneForFirebase } from '@/lib/phone-utils';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const formattedPhone = formatPhoneForFirebase(phone);
    const barePhone = formattedPhone.replace(/^\+91/, '').replace(/^\+/, '');

    const result = await db.transaction(async (tx) => {
      // Bypass RLS for customer-facing lookup
      await tx.execute(sql`SELECT set_config('app.current_role', 'super_admin', true)`);

      // Match against full formatted phone, bare phone, or raw entered phone
      const matched = await tx.select()
        .from(customers)
        .where(
          or(
            eq(customers.phone, formattedPhone),
            eq(customers.phone, barePhone),
            eq(customers.phone, phone.trim())
          )
        )
        .limit(1);

      if (matched.length > 0) {
        const customer = matched[0];
        return {
          success: true,
          customer: {
            name: customer.name,
            email: customer.email,
            occasions: customer.occasions,
            marketingConsent: customer.marketingConsent,
          }
        };
      }

      return {
        success: true,
        customer: null
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in customer lookup:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to lookup customer' },
      { status: 500 }
    );
  }
}
