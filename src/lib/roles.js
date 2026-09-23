export const ROLES = ['customer', 'staff', 'manager', 'administrator', 'super_admin']

export function roleRank(role) {
  return ROLES.indexOf(role)
}

export function atLeast(role, minRole) {
  return roleRank(role) >= roleRank(minRole)
}
