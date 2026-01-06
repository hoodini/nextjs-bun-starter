'use client';

import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Mail, User } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    redirect('/');
  }

  const user = session.user;

  return (
    <div className="container mx-auto px-6 py-20 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="w-32 h-32">
              <AvatarImage src={user?.image || ''} alt={user?.name || 'User'} />
              <AvatarFallback className="text-3xl">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-3xl">{user?.name || 'User'}</CardTitle>
          <CardDescription>{user?.email || 'No email'}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{user?.name || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email || 'Not provided'}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Signed in with Google OAuth. Profile data comes directly from your Google account.
            </p>
            <Button variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}