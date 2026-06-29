import { getPendingUsersAction, getAdminWorkspacesAction } from "@/lib/actions/admin"
import { TeamClient } from "./team-client"

export default async function TeamPage() {
  const [pendingResult, workspacesResult] = await Promise.all([
    getPendingUsersAction(),
    getAdminWorkspacesAction(),
  ])

  const pendingUsers = "users" in pendingResult ? (pendingResult.users ?? []) : []
  const workspaces = "workspaces" in workspacesResult ? (workspacesResult.workspaces ?? []) : []

  return <TeamClient pendingUsers={pendingUsers} workspaces={workspaces} />
}
