import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Users, UserPlus, Search, 
  Edit, AlertTriangle, CheckCircle, X, 
  MoreHorizontal, Shield, User, Pencil
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  verified: boolean;
  onboardingComplete: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface UsersPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const AdminUsersPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Fetch users with pagination
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'users', page, limit, searchQuery],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/admin/users?page=${page}&limit=${limit}&search=${searchQuery}`);
      return response.json();
    }
  });
  
  // Update user role mutation
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: string }) => {
      const response = await apiRequest('PUT', `/api/users/${userId}/role`, { role });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'User role updated',
        description: 'The user role has been updated successfully.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error) => {
      toast({
        title: 'Error updating user role',
        description: 'There was an error updating the user role. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Helper function to render pagination controls with simple buttons
  const renderPagination = (pagination: UsersPagination) => {
    const { page, pages } = pagination;
    
    return (
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          Previous
        </Button>
        
        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, pages) }, (_, i) => {
            const pageNumber = page <= 3 
              ? i + 1 
              : page >= pages - 2 
                ? pages - 4 + i 
                : page - 2 + i;
                
            if (pageNumber <= 0 || pageNumber > pages) return null;
            
            return (
              <Button 
                key={pageNumber}
                variant={page === pageNumber ? "default" : "outline"} 
                size="sm"
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </Button>
            );
          })}
          
          {pages > 5 && page < pages - 2 && (
            <span className="px-2">...</span>
          )}
          
          {pages > 5 && page < pages - 1 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setPage(pages)}
            >
              {pages}
            </Button>
          )}
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setPage(Math.min(pages, page + 1))}
          disabled={page >= pages}
        >
          Next
        </Button>
      </div>
    );
  };
  
  const handleUpdateRole = (userId: string, role: string) => {
    updateUserRole.mutate({ userId, role });
  };
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <AdminLayout title="User Management">
      <Helmet>
        <title>User Management | RXAI Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button disabled>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center py-8 text-destructive">
              <AlertTriangle className="mr-2" />
              <span>Error loading users</span>
            </div>
          ) : data && data.data ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.users.map((user: User) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                            {user.role === 'admin' ? (
                              <Shield className="h-4 w-4 text-primary" />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <div>{user.username || 'No username'}</div>
                            <div className="text-xs text-muted-foreground">
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}` 
                                : 'No name provided'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.verified ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            <CheckCircle className="h-3 w-3 mr-1" /> Verified
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                            <AlertTriangle className="h-3 w-3 mr-1" /> Unverified
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>{formatDate(user.lastLoginAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            
                            <DropdownMenuItem onClick={() => setEditingUser(user)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {user.role !== 'admin' ? (
                              <DropdownMenuItem 
                                onClick={() => handleUpdateRole(user.id, 'admin')}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Make Admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => handleUpdateRole(user.id, 'user')}
                              >
                                <User className="h-4 w-4 mr-2" />
                                Make Regular User
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem className="text-destructive">
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Disable Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {Math.min(data.data.pagination.total, (page - 1) * limit + 1)} to{' '}
                  {Math.min(data.data.pagination.total, page * limit)} of{' '}
                  {data.data.pagination.total} users
                </div>
                
                {renderPagination(data.data.pagination)}
              </div>
            </>
          ) : (
            <div className="flex justify-center py-8 text-muted-foreground">
              No users found
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Edit User Dialog */}
      {editingUser && (
        <AlertDialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit User</AlertDialogTitle>
              <AlertDialogDescription>
                Make changes to user details and permissions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  value={editingUser?.username || ''}
                  className="col-span-3"
                  readOnly
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={editingUser?.email || ''}
                  className="col-span-3"
                  readOnly
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Button
                    variant={editingUser?.role === 'user' ? 'default' : 'outline'}
                    onClick={() => setEditingUser({ ...editingUser, role: 'user' })}
                  >
                    User
                  </Button>
                  <Button
                    variant={editingUser?.role === 'admin' ? 'default' : 'outline'}
                    onClick={() => setEditingUser({ ...editingUser, role: 'admin' })}
                  >
                    Admin
                  </Button>
                </div>
              </div>
            </div>
            
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                if (editingUser) {
                  handleUpdateRole(editingUser.id, editingUser.role);
                  setEditingUser(null);
                }
              }}>
                Save Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </AdminLayout>
  );
};

export default AdminUsersPage;