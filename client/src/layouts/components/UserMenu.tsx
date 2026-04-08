import { IconUserCircle } from "@tabler/icons-react"

import DropdownPanel from "./DropdownPanel"

type UserMenuProps = {
  name: string
  onLogout: () => void
  onOpenChange: () => void
  onProfile: () => void
  isOpen: boolean
}

function UserMenu({
  isOpen,
  name,
  onLogout,
  onOpenChange,
  onProfile,
}: UserMenuProps) {
  return (
    <div className="relative">
      <button
        className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2 transition-colors hover:bg-accent"
        onClick={onOpenChange}
      >
        <IconUserCircle className="size-5" />
        <div className="text-left">
          <p className="text-sm font-medium">{name}</p>
        </div>
      </button>
      {isOpen ? (
        <DropdownPanel>
          <button
            className="w-full rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
            onClick={onProfile}
          >
            Profile
          </button>
          <button
            className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
            onClick={onLogout}
          >
            Logout
          </button>
        </DropdownPanel>
      ) : null}
    </div>
  )
}

export default UserMenu
