import { getPendingUsersAction } from "@/lib/actions/admin"
import { TeamClient } from "./team-client"

export default async function TeamPage() {
  const result = await getPendingUsersAction()
  const pendingUsers = "users" in result ? (result.users ?? []) : []

  return <TeamClient pendingUsers={pendingUsers} />
}
