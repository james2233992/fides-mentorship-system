'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Bell, Calendar, Users, LogOut, User, Settings, MessageSquare, BookOpen, Target } from 'lucide-react'

export function Navbar() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { unreadCount } = useAppSelector((state) => state.notification)

  const handleLogout = () => {
    dispatch(logout())
    router.push('/login')
  }

  const getNavLinks = () => {
    if (!user) return []

    switch (user.role) {
      case 'admin':
        return [
          { href: '/admin', label: 'Dashboard', icon: Users },
          { href: '/admin/users', label: 'Usuarios', icon: Users },
          { href: '/admin/sessions', label: 'Sesiones', icon: Calendar },
        ]
      case 'mentor':
        return [
          { href: '/mentor', label: 'Dashboard', icon: Users },
          { href: '/sessions', label: 'Sesiones', icon: Calendar },
          { href: '/goals', label: 'Metas', icon: Target },
          { href: '/requests', label: 'Solicitudes', icon: Bell },
          { href: '/messages', label: 'Mensajes', icon: MessageSquare },
          { href: '/resources', label: 'Recursos', icon: BookOpen },
        ]
      case 'mentee':
        return [
          { href: '/mentee', label: 'Dashboard', icon: Users },
          { href: '/mentors', label: 'Buscar Mentores', icon: Users },
          { href: '/sessions', label: 'My Sessions', icon: Calendar },
          { href: '/goals', label: 'Metas', icon: Target },
          { href: '/messages', label: 'Mensajes', icon: MessageSquare },
          { href: '/resources', label: 'Recursos', icon: BookOpen },
        ]
      default:
        return []
    }
  }

  if (!user) return null

  const navLinks = getNavLinks()

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold">
              Fides Mentorship
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
                >
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profilePicture} alt={`${user.firstName} ${user.lastName}`} />
                    <AvatarFallback>
                      {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                      {user.lastName?.charAt(0)?.toUpperCase() || ''}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    <Badge variant="secondary" className="w-fit mt-1">
                      {user.role}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}