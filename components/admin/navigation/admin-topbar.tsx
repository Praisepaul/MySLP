import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminAccountMenu } from "@/components/admin/account/admin-account-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface AdminTopbarProps {
  onMenuClick?: () => void;
}

export function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open admin navigation"
        >
          <Menu aria-hidden="true" className="size-5" />
        </Button>

        <div>
          <p className="text-sm font-medium">Admin workspace</p>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Manage your practice
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <AdminAccountMenu />
      </div>
    </header>
  );
}
