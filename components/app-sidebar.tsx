'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusIcon } from '@/components/icons';
import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import { useQueryLoading } from '@/hooks/use-query-loading';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

type User =
  | {
      id: string;
    }
  | undefined;

export function AppSidebar({ user }: { user: User }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const { setQueryLoading } = useQueryLoading();

  return (
    <Sidebar className="group-data-[side=left]:border-r-0 bg-sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <Link
              href="/"
              onClick={() => {
                // Go to financialdatasets.ai
                window.location.href = 'https://financialdatasets.ai';
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center"
            >
              <span className="bg-clip-text text-xl font-bold px-2 text-primary">
                MONETRIX
              </span>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  type="button"
                  className="p-2 h-fit"
                  onClick={() => {
                    setOpenMobile(false);
                    setQueryLoading(false, []);
                    router.push('/');
                    router.refresh();
                  }}
                >
                  <PlusIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end">New Chat</TooltipContent>
            </Tooltip>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav />}</SidebarFooter>
    </Sidebar>
  );
}
