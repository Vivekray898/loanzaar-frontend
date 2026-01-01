import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic'; // Prevent caching so stats are real-time
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    // Require admin auth
    const check = await requireAdmin(request)
    if (!check.ok) {
      return NextResponse.json({ success: false, error: check.message }, { status: check.status })
    }

    // 1. Setup Admin Client with Service Role Key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Service Role Key for Admin Stats API');
        return NextResponse.json({ success: false, error: 'Server Config Error: Missing Keys' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Run counts in parallel for performance
    // We use 'head: true' to fetch ONLY the count, not the data rows (saves bandwidth)
    const [apps, contacts, users, pendingApprovals, approvedApps, rejectedApps] = await Promise.all([
      supabaseAdmin.from('applications').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('contact_messages').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      // ✅ NEW: Count applications pending admin approval
      supabaseAdmin
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('approval_status', 'pending_admin_approval'),
      // ✅ NEW: Count approved applications
      supabaseAdmin
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('approval_status', 'approved'),
      // ✅ NEW: Count rejected applications
      supabaseAdmin
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('approval_status', 'rejected'),
    ]);

    // Optional: Log errors if specific tables fail
    if (apps.error) console.error('Stats Error (Apps):', apps.error);
    if (contacts.error) console.error('Stats Error (Contacts):', contacts.error);
    if (users.error) console.error('Stats Error (Users):', users.error);
    if (pendingApprovals.error) console.warn('Stats Warning (Pending Approvals):', pendingApprovals.error);
    if (approvedApps.error) console.warn('Stats Warning (Approved Apps):', approvedApps.error);
    if (rejectedApps.error) console.warn('Stats Warning (Rejected Apps):', rejectedApps.error);

    return NextResponse.json({
      success: true,
      data: {
        applications: apps.count || 0,
        contacts: contacts.count || 0,
        users: users.count || 0,
        // ✅ NEW: Approval workflow stats
        approvalWorkflow: {
          pendingApproval: pendingApprovals.count || 0,
          approved: approvedApps.count || 0,
          rejected: rejectedApps.count || 0,
        }
      }
    });

  } catch (error: any) {
    console.error('/api/admin/stats error', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}