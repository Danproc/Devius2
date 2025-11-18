'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Users, Search } from 'lucide-react';

interface RegisteredUser {
  app_user: {
    id: string;
    github_username: string | null;
    name: string | null;
    image: string | null;
  };
  hackathon_registrations: {
    participation_type: 'solo' | 'team';
    registered_at: Date;
  };
}

// Helper to safely get display name
function getDisplayName(user: RegisteredUser['app_user']): string {
  return user.name || user.github_username || 'Unknown User';
}

// Helper to safely get username for link
function getUsername(user: RegisteredUser['app_user']): string | null {
  return user.github_username;
}

// Helper to safely get initials
function getInitials(user: RegisteredUser['app_user']): string {
  const name = getDisplayName(user);
  return name.slice(0, 2).toUpperCase();
}

interface RegisteredUsersListProps {
  users: RegisteredUser[];
  totalCount: number;
}

export function RegisteredUsersList({ users, totalCount }: RegisteredUsersListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Debug: log first user to see structure
  if (users.length > 0) {
    console.log('First registered user:', users[0]);
    console.log('Keys:', Object.keys(users[0]));
  }

  const filteredUsers = users.filter((item) => {
    const name = getDisplayName(item.app_user);
    const username = getUsername(item.app_user) || '';
    const search = searchTerm.toLowerCase();
    return name.toLowerCase().includes(search) || username.toLowerCase().includes(search);
  });

  return (
    <Card className="border-devcard-border bg-devcard-base">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-devcard-heading text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-devcard-green" />
            Registered Participants ({totalCount})
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-devcard-text" />
            <Input
              type="text"
              placeholder="Search participants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-devcard-base border-devcard-border text-devcard-heading"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-devcard-border hover:bg-transparent">
              <TableHead className="text-devcard-text">Participant</TableHead>
              <TableHead className="text-devcard-text">Username</TableHead>
              <TableHead className="text-devcard-text">Type</TableHead>
              <TableHead className="text-devcard-text">Registered</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow className="border-devcard-border">
                <TableCell colSpan={4} className="text-center text-devcard-text py-8">
                  {searchTerm ? 'No participants found matching your search' : 'No participants yet'}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((item) => (
                <TableRow
                  key={item.app_user.id}
                  className="border-devcard-border hover:bg-devcard-base/50"
                >
                  <TableCell>
                    {getUsername(item.app_user) ? (
                      <Link
                        href={`/${getUsername(item.app_user)}`}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={item.app_user.image || undefined}
                            alt={getDisplayName(item.app_user)}
                          />
                          <AvatarFallback className="bg-devcard-green text-black text-xs">
                            {getInitials(item.app_user)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-devcard-heading">
                          {getDisplayName(item.app_user)}
                        </span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={item.app_user.image || undefined}
                            alt={getDisplayName(item.app_user)}
                          />
                          <AvatarFallback className="bg-devcard-green text-black text-xs">
                            {getInitials(item.app_user)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-devcard-heading">
                          {getDisplayName(item.app_user)}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {getUsername(item.app_user) ? (
                      <Link
                        href={`/${getUsername(item.app_user)}`}
                        className="text-devcard-text hover:text-devcard-green transition-colors"
                      >
                        @{getUsername(item.app_user)}
                      </Link>
                    ) : (
                      <span className="text-devcard-text">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-devcard-green/30 text-devcard-green capitalize"
                    >
                      {item.hackathon_registrations.participation_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-devcard-text text-sm">
                    {new Date(item.hackathon_registrations.registered_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
