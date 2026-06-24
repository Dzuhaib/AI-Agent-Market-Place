'use client';

import Link from 'next/link';
import { useAuth } from './FirebaseProvider';
import { auth } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Bot, LayoutDashboard, PlusCircle, ShoppingBag, LogOut, Search, ShieldCheck } from 'lucide-react';
import { Input } from './ui/input';

export default function Navbar() {
  const { user, isSeller, isAdmin } = useAuth();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleLogout = () => signOut(auth);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card px-6">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight text-primary">AgentMarket</span>
          </Link>
          <div className="relative hidden w-80 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search for agents..." 
              className="h-9 border-border bg-background pl-10 text-sm focus-visible:ring-primary"
            />
          </div>
        </div>

        <nav className="flex items-center gap-6">
          <Link href="/marketplace" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Marketplace
          </Link>
          {user && (
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Admin
            </Link>
          )}
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {isSeller && (
                  <Button asChild variant="default" size="sm" className="hidden h-9 rounded-md px-4 sm:flex">
                    <Link href="/create">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      List Agent
                    </Link>
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full border-2 border-primary p-0">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                        <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/marketplace">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Marketplace
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={handleLogin}>Sign In</Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
