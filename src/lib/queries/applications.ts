import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Explicit selects used to prevent overfetching and control returned fields
const applicationBaseSelect = {
  id: true,
  created_at: true,
  updated_at: true,
  full_name: true,
  mobile_number: true,
  email: true,
  city: true,
  state: true,
  pincode: true,
  product_category: true,
  product_type: true,
  application_stage: true,
  status: true,
  approval_status: true,
  source: true,
  metadata: true,
  address_line_1: true,
  address_line_2: true,
  assigned_to: true,
  ip: true,
  user_agent: true,
  profile_id: true,
  last_agent_action_at: true,
  last_agent_action_by: true,
} as const;

export async function getAdminApplications({
  where = {},
  skip = 0,
  take = 50,
  orderBy = { created_at: 'desc' as const }
}: {
  where?: Prisma.applicationsWhereInput
  skip?: number
  take?: number
  orderBy?: any
}) {
  const [data, total] = await Promise.all([
    prisma.applications.findMany({
      where,
      select: applicationBaseSelect,
      orderBy,
      skip,
      take
    }),
    prisma.applications.count({ where })
  ]);

  // Fetch related profiles for apps
  const profileIds = Array.from(new Set(data.map(d => d.profile_id).filter(Boolean) as string[]));
  const profiles = profileIds.length > 0 ? await prisma.profiles.findMany({ where: { id: { in: profileIds } }, select: { id: true, full_name: true, phone: true, email: true } }) : [];
  const profilesById = Object.fromEntries(profiles.map(p => [p.id, p]));

  // Fetch active assignments for these apps
  const appIds = data.map(d => d.id);
  const activeAssignments = appIds.length > 0 ? await prisma.application_assignments.findMany({ where: { application_id: { in: appIds }, is_active: true }, select: { id: true, application_id: true, agent_user_id: true, assigned_at: true } }) : [];
  const assignmentsByApp: Record<string, any> = {};
  for (const a of activeAssignments) assignmentsByApp[a.application_id] = a;

  // Buffer agent user ids
  const agentUserIds = Array.from(new Set(activeAssignments.map(a => a.agent_user_id)));
  const agents = agentUserIds.length > 0 ? await prisma.profiles.findMany({ where: { id: { in: agentUserIds } }, select: { id: true, full_name: true, phone: true } }) : [];
  const agentsById = Object.fromEntries(agents.map(a => [a.id, a]));

  // Attach related info to data
  const normalized = data.map(d => ({
    ...d,
    profile: d.profile_id ? profilesById[d.profile_id] ?? null : null,
    active_assignment: assignmentsByApp[d.id] ? { ...assignmentsByApp[d.id], agent_profile: agentsById[assignmentsByApp[d.id].agent_user_id] ?? null } : null
  }));

  return { data: normalized, total };
}

export async function getAdminApplicationById(applicationId: string) {
  const app = await prisma.applications.findUnique({
    where: { id: applicationId },
    select: applicationBaseSelect
  });
  if (!app) return null;

  // Profile
  const profile = app.profile_id ? await prisma.profiles.findUnique({ where: { id: app.profile_id }, select: { id: true, full_name: true, phone: true, email: true } }) : null;

  // Active assignment
  const assignment = await prisma.application_assignments.findFirst({ where: { application_id: applicationId, is_active: true }, select: { id: true, application_id: true, agent_user_id: true, assigned_at: true } });
  let agent_profile = null;
  if (assignment?.agent_user_id) {
    agent_profile = await prisma.profiles.findUnique({ where: { id: assignment.agent_user_id }, select: { id: true, full_name: true, phone: true } });
  }

  // Status history (descending)
  const statusHistory = await prisma.application_status_logs.findMany({ where: { application_id: applicationId }, orderBy: { created_at: 'desc' }, select: { id: true, from_status: true, to_status: true, actor_role: true, actor_user_id: true, created_at: true, reason: true } });

  // Map actor profiles
  const actorIds = Array.from(new Set(statusHistory.map(s => s.actor_user_id)));
  const actors = actorIds.length > 0 ? await prisma.profiles.findMany({ where: { id: { in: actorIds } }, select: { id: true, full_name: true, phone: true } }) : [];
  const actorsById = Object.fromEntries(actors.map(a => [a.id, a]));
  const statusWithActor = statusHistory.map(s => ({ ...s, actor: actorsById[s.actor_user_id] ?? null }));

  // Remarks (latest first)
  const remarks = await prisma.application_remarks.findMany({ where: { application_id: applicationId }, orderBy: { created_at: 'desc' }, select: { id: true, agent_user_id: true, remark: true, created_at: true, metadata: true } });
  const remarkAgentIds = Array.from(new Set(remarks.map(r => r.agent_user_id)));
  const remarkAgents = remarkAgentIds.length > 0 ? await prisma.profiles.findMany({ where: { id: { in: remarkAgentIds } }, select: { id: true, full_name: true, phone: true } }) : [];
  const remarkAgentsById = Object.fromEntries(remarkAgents.map(a => [a.id, a]));
  const remarksWithAgent = remarks.map(r => ({ ...r, agent: remarkAgentsById[r.agent_user_id] ?? null }));

  return {
    ...app,
    profile,
    active_assignment: assignment ? { ...assignment, agent_profile } : null,
    status_history: statusWithActor,
    remarks: remarksWithAgent
  };
}

export async function getAgentApplications(agentUserId: string, { skip = 0, take = 50 } = {}) {
  // Find active assignments where agent_user_id = agentUserId
  const assignments = await prisma.application_assignments.findMany({ where: { agent_user_id: agentUserId, is_active: true }, select: { application_id: true, assigned_at: true, id: true } });
  const appIds = assignments.map(a => a.application_id);
  if (appIds.length === 0) return { data: [], total: 0 };

  const data = await prisma.applications.findMany({ where: { id: { in: appIds } }, select: {
    id: true,
    created_at: true,
    full_name: true,
    mobile_number: true,
    email: true,
    city: true,
    state: true,
    product_category: true,
    product_type: true,
    application_stage: true,
    status: true,
    approval_status: true,
    last_agent_action_at: true
  }, orderBy: { created_at: 'desc' }, skip, take });

  // Attach agent-specific assignment record and their remarks
  const appIdSet = data.map(d => d.id);
  const beAssignments = await prisma.application_assignments.findMany({ where: { application_id: { in: appIdSet }, agent_user_id: agentUserId }, select: { id: true, application_id: true, agent_user_id: true, assigned_at: true, is_active: true } });
  const remarks = await prisma.application_remarks.findMany({ where: { application_id: { in: appIdSet }, agent_user_id: agentUserId }, select: { id: true, application_id: true, agent_user_id: true, remark: true, created_at: true } });

  const beAssignmentsByApp = Object.fromEntries(beAssignments.map(a => [a.application_id, a]));
  const remarksByApp = appIdSet.reduce((acc: Record<string, any[]>, id) => { acc[id] = []; return acc; }, {} as Record<string, any[]>);
  for (const r of remarks) remarksByApp[r.application_id].push(r);

  const normalized = data.map(d => ({ ...d, assignment: beAssignmentsByApp[d.id] ?? null, remarks: remarksByApp[d.id] || [] }));
  const total = data.length;
  return { data: normalized, total };
}

export async function getAgentApplicationById(agentUserId: string, applicationId: string) {
  // Verify assignment exists for this agent
  const assignment = await prisma.application_assignments.findFirst({ where: { application_id: applicationId, agent_user_id: agentUserId } });
  if (!assignment) return null;

  // Fetch permitted fields for agent
  const app = await prisma.applications.findUnique({ where: { id: applicationId }, select: {
    id: true,
    created_at: true,
    full_name: true,
    mobile_number: true,
    email: true,
    city: true,
    state: true,
    product_category: true,
    product_type: true,
    application_stage: true,
    status: true,
    approval_status: true,
    last_agent_action_at: true,
    profile_id: true
  }});

  if (!app) return null;

  // Agent's own remarks and their assignment
  const agentRemarks = await prisma.application_remarks.findMany({ where: { application_id: applicationId, agent_user_id: agentUserId }, select: { id: true, remark: true, created_at: true } });

  // Status history where actor_role = 'agent'
  const statusHistory = await prisma.application_status_logs.findMany({ where: { application_id: applicationId, actor_role: 'agent' }, orderBy: { created_at: 'desc' }, select: { id: true, from_status: true, to_status: true, actor_user_id: true, actor_role: true, created_at: true, reason: true } });
  const actorIds = Array.from(new Set(statusHistory.map(s => s.actor_user_id)));
  const actors = actorIds.length > 0 ? await prisma.profiles.findMany({ where: { id: { in: actorIds } }, select: { id: true, full_name: true, phone: true } }) : [];
  const actorsById = Object.fromEntries(actors.map(a => [a.id, a]));
  const statusWithActor = statusHistory.map(s => ({ ...s, actor: actorsById[s.actor_user_id] ?? null }));

  return { ...app, assignment, remarks: agentRemarks, status_history: statusWithActor };
}
