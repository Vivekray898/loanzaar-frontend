export const runtime = 'nodejs';
import { createServerSupabase } from '@/config/supabaseServer';

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, formData, status = 'pending' } = body || {};

    if (!type || !formData) {
      return new Response(JSON.stringify({ error: 'Missing type or formData' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Map incoming type to table name (same mapping as client-side)
    const collectionMap = {
      loan: 'admin_loans',
      insurance: 'admin_insurance',
      contact: 'admin_messages',
      creditCard: 'other_data'
    };

    const table = collectionMap[type] || 'data_tmp';

    const supabase = createServerSupabase();

    const rowData = {
      type,
      form_data: formData,
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from(table).insert([rowData]).select().single();
    if (error) {
      console.error('Server insert error:', error);
      return new Response(JSON.stringify({ error: error.message || 'DB insert failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, id: data?.id }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Submit route error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
