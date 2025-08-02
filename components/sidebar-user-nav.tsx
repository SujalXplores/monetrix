'use client';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import {
  RiArrowUpSLine,
  RiKeyLine,
  RiMoonLine,
  RiSettings3Line,
  RiSunLine,
  RiUserLine,
} from '@remixicon/react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { ApiKeysModal } from '@/components/api-keys-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function SidebarUserNav() {
  const { setTheme, theme } = useTheme();
  const [isApiKeysModalOpen, setIsApiKeysModalOpen] = useState(false);

  return (
    <>
      <SidebarMenu>
        {/* Settings Dropdown */}
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="h-10 w-full hover:bg-sidebar-accent/50 transition-colors group"
              >
                <RiSettings3Line size={16} />
                <span>Settings</span>
                <RiArrowUpSLine
                  size={16}
                  className="ml-auto transition-transform duration-200 group-data-[state=open]:rotate-180"
                />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              className="w-[--radix-popper-anchor-width]"
            >
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'light' ? (
                  <RiMoonLine size={16} className="mr-2" />
                ) : (
                  <RiSunLine size={16} className="mr-2" />
                )}
                {`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <button
                  type="button"
                  className="w-full cursor-pointer flex items-center"
                  onClick={() => setIsApiKeysModalOpen(true)}
                >
                  <RiKeyLine size={16} className="mr-2" />
                  Configure API keys
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
        {/* User Menu Section */}
        <SignedIn>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="h-10 w-full">
              <UserButton
                showName
                appearance={{
                  elements: {
                    userButtonBox: 'flex items-center gap-2 w-full',
                    userButtonAvatarBox: 'w-5 h-5 order-1',
                    userButtonOuterIdentifier:
                      'text-sm font-medium order-2 text-foreground',
                    userButtonTrigger:
                      'flex items-center gap-2 w-full justify-start p-0 hover:bg-transparent',
                  },
                }}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SignedIn>
        <SignedOut>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="h-10 w-full" asChild>
              <SignInButton mode="modal">
                <div className="flex items-center gap-2">
                  <RiUserLine size={16} />
                  <span>Sign In</span>
                </div>
              </SignInButton>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SignedOut>
      </SidebarMenu>
      <ApiKeysModal
        open={isApiKeysModalOpen}
        onOpenChange={setIsApiKeysModalOpen}
      />
    </>
  );
}
