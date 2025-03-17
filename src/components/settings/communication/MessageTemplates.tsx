
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, MessageSquare, Edit, Trash2 } from 'lucide-react';
import { useCommunication, MessageTemplate, EventType, MessageChannel } from '@/hooks/useCommunication';
import { TemplateDialog } from './TemplateDialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function MessageTemplates() {
  const { templates, fetchTemplates, deleteTemplate, isLoading } = useCommunication();
  const [activeChannel, setActiveChannel] = useState<MessageChannel>('sms');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const filteredTemplates = templates.filter(template => template.type === activeChannel);

  const handleAddTemplate = () => {
    setSelectedTemplate(null);
    setIsDialogOpen(true);
  };

  const handleEditTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setIsDialogOpen(true);
  };

  const confirmDelete = (templateId: string) => {
    setTemplateToDelete(templateId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTemplate = async () => {
    if (templateToDelete) {
      await deleteTemplate(templateToDelete);
      setIsDeleteDialogOpen(false);
      setTemplateToDelete(null);
      fetchTemplates();
    }
  };

  const getEventTypeName = (eventType: EventType) => {
    switch (eventType) {
      case 'sale_completed': return 'Sale Completed';
      case 'service_check_in': return 'Service Check-in';
      case 'service_in_progress': return 'Service In Progress';
      case 'service_ready': return 'Ready for Pickup';
      case 'service_completed': return 'Service Completed';
      default: return eventType;
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-2xl font-bold">
              <MessageSquare className="inline-block mr-2 h-5 w-5" />
              Message Templates
            </CardTitle>
            <CardDescription>
              Create and manage templates for automated customer messages
            </CardDescription>
          </div>
          <Button onClick={handleAddTemplate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Template
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={activeChannel} onValueChange={(value: string) => setActiveChannel(value as MessageChannel)}>
            <TabsList className="mb-4">
              <TabsTrigger value="sms">SMS Templates</TabsTrigger>
              <TabsTrigger value="whatsapp">WhatsApp Templates</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeChannel} className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-8 w-[100px]" />
                      </div>
                      <Skeleton className="h-4 w-1/4 mt-2" />
                      <Skeleton className="h-16 w-full mt-4" />
                    </div>
                  ))}
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No templates found</h3>
                  <p className="text-muted-foreground mb-4">
                    Create message templates to automate customer communications
                  </p>
                  <Button onClick={handleAddTemplate}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Your First Template
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredTemplates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">{template.name}</h3>
                          <Badge variant="outline" className="mt-1">
                            {getEventTypeName(template.event_type)}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditTemplate(template)}>
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive" onClick={() => confirmDelete(template.id)}>
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                        {template.template_text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <TemplateDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        template={selectedTemplate}
        defaultChannel={activeChannel}
        onSaved={fetchTemplates}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this message template. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
