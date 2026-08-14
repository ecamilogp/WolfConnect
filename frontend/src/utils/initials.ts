/**
 * Two distinct initials shapes used across the app: one for entities with
 * separate first/last name fields (users, participants), one for a single
 * display-name string (chats, groups). Kept separate since the inputs
 * genuinely differ, not merged into one signature.
 */
export function getInitialsFromName(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function getInitialsFromFullName(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}
