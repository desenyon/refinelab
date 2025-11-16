'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  LogOut,
  Check,
  Moon,
  Sun
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

interface SettingsClientProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const [notifications, setNotifications] = useState({
    emailAnalysis: true,
    emailWeekly: true,
    emailGoals: false,
    pushAnalysis: false
  })
  const { theme, setTheme } = useTheme()
  const [saving, setSaving] = useState(false)

  const initials = user.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U'

  const handleSaveNotifications = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Notification preferences saved')
    setSaving(false)
  }

  const handleDeleteAccount = () => {
    toast.error('Account deletion not yet implemented')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card className="animate-slide-up hover-lift transition-all hover:shadow-md" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Your personal information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-lg">{user.name || 'User'}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <Badge className="mt-2" variant="secondary">Free Plan</Badge>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={user.name || ''} placeholder="Your name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user.email || ''} disabled />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
              </div>

              <Button className="w-full sm:w-auto">
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Appearance Section */}
          <Card className="animate-slide-up hover-lift" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Palette className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize your interface</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-3 block">Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    className="justify-start"
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    className="justify-start"
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    className="justify-start"
                    onClick={() => setTheme('system')}
                  >
                    <Database className="mr-2 h-4 w-4" />
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card className="animate-slide-up hover-lift" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Bell className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage your notification preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Essay Analysis Complete</div>
                    <div className="text-sm text-muted-foreground">Get notified when analysis finishes</div>
                  </div>
                  <Button
                    variant={notifications.emailAnalysis ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNotifications({ ...notifications, emailAnalysis: !notifications.emailAnalysis })}
                  >
                    {notifications.emailAnalysis ? 'On' : 'Off'}
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Weekly Progress Report</div>
                    <div className="text-sm text-muted-foreground">Get weekly summary of your growth</div>
                  </div>
                  <Button
                    variant={notifications.emailWeekly ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNotifications({ ...notifications, emailWeekly: !notifications.emailWeekly })}
                  >
                    {notifications.emailWeekly ? 'On' : 'Off'}
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Goal Achievements</div>
                    <div className="text-sm text-muted-foreground">Get notified when you reach goals</div>
                  </div>
                  <Button
                    variant={notifications.emailGoals ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNotifications({ ...notifications, emailGoals: !notifications.emailGoals })}
                  >
                    {notifications.emailGoals ? 'On' : 'Off'}
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Push Notifications</div>
                    <div className="text-sm text-muted-foreground">Receive browser push notifications</div>
                  </div>
                  <Button
                    variant={notifications.pushAnalysis ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNotifications({ ...notifications, pushAnalysis: !notifications.pushAnalysis })}
                  >
                    {notifications.pushAnalysis ? 'On' : 'Off'}
                  </Button>
                </div>
              </div>

              <Button className="w-full sm:w-auto" onClick={handleSaveNotifications} disabled={saving}>
                {saving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="animate-slide-up hover-lift border-red-200 dark:border-red-900" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <CardTitle>Privacy & Security</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Sign Out</h4>
                  <p className="text-sm text-muted-foreground mb-3">Sign out from all devices</p>
                  <Button variant="outline" onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2 text-red-600 dark:text-red-400">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
