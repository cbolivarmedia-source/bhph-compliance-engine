import { createServiceClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('jurisdictions')
    .select('id, state_code, state_name')
    .eq('is_active', true)
    .order('state_name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ jurisdictions: data });
}
