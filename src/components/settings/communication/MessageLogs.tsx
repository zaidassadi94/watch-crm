
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCommunication, MessageLog } from '@/hooks/useCommunication';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export function MessageLogs() {
  const { logs, fetchLogs, isLoading } = useCommunication();
  const [activeChannel, setActiveChannel] = useState<'all' | 'sms' | 'whatsapp'>('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = activeChannel === 'all' 
    ? logs 
    : logs.filter(log => log.channel === activeChannel);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Clock className="h-3 w-3 mr-1" /> Sent</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" /> Delivered</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-2xl font-bold">
            <MessageSquare className="inline-block mr-2 h-5 w-5" />
            Message Logs
          </CardTitle>
          <CardDescription>
            View history of all sent customer messages
          </CardDescription>
        </div>
        <Button variant="outline" onClick={fetchLogs} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeChannel} onValueChange={(value: string) => setActiveChannel(value as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Messages</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeChannel} className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-1/4" />
                      <Skeleton className="h-6 w-[100px]" />
                    </div>
                    <Skeleton className="h-4 w-1/3 mt-2" />
                    <Skeleton className="h-10 w-full mt-3" />
                  </div>
                ))}
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No message logs found</h3>
                <p className="text-muted-foreground">
                  Message logs will appear here after you send messages to customers
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">
                            {log.recipient}
                          </h3>
                          <Badge variant="outline" className="capitalize">
                            {log.channel}
                          </Badge>
                          {getStatusBadge(log.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(log.sent_at), 'PPpp')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                      {log.message_text}
                    </div>
                    {log.error_message && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                        Error: {log.error_message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
