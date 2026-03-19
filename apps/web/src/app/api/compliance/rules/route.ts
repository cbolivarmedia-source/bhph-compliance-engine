import { createServiceClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const stateCode = request.nextUrl.searchParams.get('stateCode');
  if (!stateCode) return NextResponse.json({ error: 'stateCode required' }, { status: 400 });

  const supabase = createServiceClient();

  // Get jurisdiction
  const { data: jurisdiction } = await supabase
    .from('jurisdictions')
    .select('id')
    .eq('state_code', stateCode)
    .single();

  if (!jurisdiction) return NextResponse.json({ error: 'State not found' }, { status: 404 });

  // Get rules with statute references via junction table
  const { data: rules, error } = await supabase
    .from('rules')
    .select(`
      *,
      rule_statute_links(
        statute_references(*)
      )
    `)
    .eq('jurisdiction_id', jurisdiction.id)
    .eq('is_active', true)
    .is('valid_until', null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rules });
}
