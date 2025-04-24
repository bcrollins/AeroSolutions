import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-golden-amber" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-sky-blue" />
          <span className="sr-only">{t('toggle_theme')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")} className={theme === 'light' ? 'bg-light-gray-tint' : ''}>
          <Sun className="mr-2 h-4 w-4 text-golden-amber" />
          <span>{t('light')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className={theme === 'dark' ? 'bg-light-gray-tint' : ''}>
          <Moon className="mr-2 h-4 w-4 text-sky-blue" />
          <span>{t('dark')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className={theme === 'system' ? 'bg-light-gray-tint' : ''}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>{t('system')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}