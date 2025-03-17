
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { AccountSettings } from '@/components/settings/AccountSettings';
import { GeneralSettings } from '@/components/settings/GeneralSettings';
import { UsersSettings } from '@/components/settings/UsersSettings';
import { CommunicationSettings } from '@/components/settings/CommunicationSettings';
import { cn } from '@/lib/utils';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cn(
      'space-y-6 p-2 sm:p-4 md:p-6 lg:p-8 transition-all duration-300',
      isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    )}>
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings, preferences, and team.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs
            defaultValue={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4 p-4 sm:p-6"
          >
            <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="communications">Communications</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="users">Team</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="py-4">
              <GeneralSettings />
            </TabsContent>

            <TabsContent value="communications" className="py-4">
              <CommunicationSettings />
            </TabsContent>
            
            <TabsContent value="account" className="py-4">
              <AccountSettings />
            </TabsContent>
            
            <TabsContent value="users" className="py-4">
              <UsersSettings />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
