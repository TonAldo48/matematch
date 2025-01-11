'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Building2, UserCircle, History, Star, Settings, LogOut, Menu, X, MapPin, Search, Users } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface ProfileData {
  fullName: string;
  email: string;
  photoUrl?: string;
}

interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed = false, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      
      try {
        const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data() as ProfileData);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }

    fetchProfile();
  }, [user]);

  const navigation = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
    },
    {
      name: 'Housing',
      href: '/housing',
      icon: Building2,
    },
    {
      name: 'Shared Housing',
      href: '/shared-housing',
      icon: Users,
    },
    {
      name: 'Saved Listings',
      href: '/saved',
      icon: Star,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: UserCircle,
    },
  ];

  const toolsNavigation = [
    { name: 'Address Estimator', href: '/address-estimator', icon: MapPin },
    { name: 'Scraper Test', href: '/scraper-test', icon: Search },
  ];

  const SidebarContent = () => (
    <div className={cn("flex h-full flex-col border-r bg-muted/10", collapsed ? "w-16" : "w-64")}>
      {/* Header */}
      <div className="flex h-14 items-center border-b px-4 justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 rounded-md bg-primary/10">
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-xs font-semibold text-primary">M</span>
            </div>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-sm font-semibold">MateMatch</h1>
            </div>
          )}
        </div>
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCollapsedChange?.(!collapsed)}
            className="h-8 w-8"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={cn("transform transition-transform", collapsed ? "rotate-180" : "")}
            >
              <path
                d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        <div className="space-y-1">
          {!collapsed && (
            <h2 className="px-2 text-xs font-semibold text-muted-foreground">
              Platform
            </h2>
          )}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 flex-shrink-0",
                      isActive ? "text-foreground" : "text-muted-foreground group-hover:text-accent-foreground",
                      collapsed ? "mr-0" : "mr-3"
                    )}
                  />
                  {!collapsed && item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <h2 className="px-2 text-xs font-semibold text-muted-foreground">
              Tools
            </h2>
          )}
          <nav className="space-y-1">
            {toolsNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 flex-shrink-0",
                      isActive ? "text-foreground" : "text-muted-foreground group-hover:text-accent-foreground",
                      collapsed ? "mr-0" : "mr-3"
                    )}
                  />
                  {!collapsed && item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Profile */}
      <div className="border-t p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.photoUrl} />
              <AvatarFallback>
                {profile?.fullName?.charAt(0) || user?.email?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {profile?.fullName || 'User Name'}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {profile?.email || user?.email || 'user@example.com'}
                </p>
              </div>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowSignOutDialog(true)}
            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden fixed top-4 left-4 z-40"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        <Dialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign Out</DialogTitle>
              <DialogDescription>
                Are you sure you want to sign out?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSignOutDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleLogout();
                  setShowSignOutDialog(false);
                }}
              >
                Sign Out
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <SidebarContent />
      <Dialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Out</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSignOutDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleLogout();
                setShowSignOutDialog(false);
              }}
            >
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 