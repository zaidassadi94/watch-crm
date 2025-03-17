
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MessageTemplates } from './communication/MessageTemplates';
import { MessageLogs } from './communication/MessageLogs';
import { useCommunication } from '@/hooks/useCommunication';
import { Button } from '@/components/ui/button';
import { BellRing, MessageSquare, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function CommunicationSettings() {
  const [activeTab, setActiveTab] = useState('notifications');
  const { isLoading, getNotificationSettings, updateNotificationSettings } = useCommunication();
  const [settings, setSettings] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await getNotificationSettings();
      setSettings(data);
    };
    
    loadSettings();
  }, []);

  const handleSettingsChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    await updateNotificationSettings(settings);
    setIsSaving(false);
  };

  return (
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="notifications">Notification Settings</TabsTrigger>
        <TabsTrigger value="templates">Message Templates</TabsTrigger>
        <TabsTrigger value="logs">Message Logs</TabsTrigger>
      </TabsList>
      
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BellRing className="mr-2 h-5 w-5" />
              Automated Notification Settings
            </CardTitle>
            <CardDescription>
              Configure when to automatically send SMS and WhatsApp messages to your customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || !settings ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-5 w-10" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sale-confirmation" className="text-base">Sale Confirmation</Label>
                      <p className="text-sm text-muted-foreground">
                        Send message after a sale is completed
                      </p>
                    </div>
                    <Switch 
                      id="sale-confirmation" 
                      checked={settings.sale_confirmation}
                      onCheckedChange={(checked) => handleSettingsChange('sale_confirmation', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="service-check-in" className="text-base">Service Check-in</Label>
                      <p className="text-sm text-muted-foreground">
                        Send message when a watch is checked in for service
                      </p>
                    </div>
                    <Switch 
                      id="service-check-in" 
                      checked={settings.service_check_in}
                      onCheckedChange={(checked) => handleSettingsChange('service_check_in', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="service-in-progress" className="text-base">Service In Progress</Label>
                      <p className="text-sm text-muted-foreground">
                        Send message when service status changes to "in progress"
                      </p>
                    </div>
                    <Switch 
                      id="service-in-progress" 
                      checked={settings.service_in_progress}
                      onCheckedChange={(checked) => handleSettingsChange('service_in_progress', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="service-ready" className="text-base">Ready for Pickup</Label>
                      <p className="text-sm text-muted-foreground">
                        Send message when service status changes to "ready for pickup"
                      </p>
                    </div>
                    <Switch 
                      id="service-ready" 
                      checked={settings.service_ready}
                      onCheckedChange={(checked) => handleSettingsChange('service_ready', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="service-completed" className="text-base">Service Completed</Label>
                      <p className="text-sm text-muted-foreground">
                        Send message when service is marked as completed
                      </p>
                    </div>
                    <Switch 
                      id="service-completed" 
                      checked={settings.service_completed}
                      onCheckedChange={(checked) => handleSettingsChange('service_completed', checked)}
                    />
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <Button 
                    onClick={saveSettings} 
                    disabled={isLoading || isSaving}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="templates">
        <MessageTemplates />
      </TabsContent>
      
      <TabsContent value="logs">
        <MessageLogs />
      </TabsContent>
    </Tabs>
  );
}
