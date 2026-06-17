import { NextResponse } from 'next/server';
import { cronTriggerCrmReminders } from '@/lib/db/admin-queries';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    // Secure the cron endpoint in production using Vercel CRON_SECRET
    if (process.env.NODE_ENV === 'production') {
      const cronSecret = process.env.CRON_SECRET;
      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized: Invalid cron secret' }, { status: 401 });
      }
    }

    // Trigger CRM campaign scheduler
    const result = await cronTriggerCrmReminders();

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error triggering CRM Cron reminders:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error occurred during cron execution' },
      { status: 500 }
    );
  }
}
