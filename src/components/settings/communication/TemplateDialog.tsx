
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { MessageSquare, Save } from 'lucide-react';
import { MessageTemplate, EventType, MessageChannel } from '@/types/messages';

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: MessageTemplate | null;
  defaultChannel: MessageChannel;
  onSaved: () => void;
  saveTemplate: (template: Partial<MessageTemplate>) => Promise<boolean>;
}

export function TemplateDialog({ 
  open, 
  onOpenChange, 
  template, 
  defaultChannel, 
  onSaved,
  saveTemplate
}: TemplateDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    id?: string;
    name: string;
    type: MessageChannel;
    template_text: string;
    event_type: EventType;
  }>({
    name: '',
    type: defaultChannel,
    template_text: '',
    event_type: 'sale_completed'
  });

  useEffect(() => {
    if (template) {
      setFormData({
        id: template.id,
        name: template.name,
        type: template.type,
        template_text: template.template_text,
        event_type: template.event_type
      });
    } else {
      setFormData({
        name: '',
        type: defaultChannel,
        template_text: '',
        event_type: 'sale_completed'
      });
    }
  }, [template, defaultChannel, open]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.template_text) return;
    
    setIsLoading(true);
    const result = await saveTemplate(formData);
    setIsLoading(false);
    
    if (result) {
      onSaved();
      onOpenChange(false);
    }
  };

  const getPlaceholderVariables = () => {
    const commonVariables = [
      "{{customer_name}} - Customer's name",
      "{{phone}} - Customer's phone number",
    ];
    
    const eventSpecificVariables: Record<EventType, string[]> = {
      sale_completed: [
        "{{sale_amount}} - Total sale amount",
        "{{sale_date}} - Date of sale",
        "{{invoice_number}} - Invoice number"
      ],
      service_check_in: [
        "{{watch_brand}} - Watch brand",
        "{{watch_model}} - Watch model",
        "{{service_type}} - Type of service",
        "{{check_in_date}} - Check-in date"
      ],
      service_in_progress: [
        "{{watch_brand}} - Watch brand",
        "{{watch_model}} - Watch model",
        "{{estimated_completion}} - Estimated completion date"
      ],
      service_ready: [
        "{{watch_brand}} - Watch brand",
        "{{watch_model}} - Watch model",
        "{{ready_date}} - Date ready for pickup"
      ],
      service_completed: [
        "{{watch_brand}} - Watch brand",
        "{{watch_model}} - Watch model",
        "{{completion_date}} - Completion date",
        "{{service_amount}} - Service amount"
      ]
    };
    
    return [...commonVariables, ...eventSpecificVariables[formData.event_type]];
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            <MessageSquare className="inline-block mr-2 h-5 w-5" />
            {template ? 'Edit Message Template' : 'Create Message Template'}
          </DialogTitle>
          <DialogDescription>
            Create templates for automated customer messages. Use variables like {"{{customer_name}}"} to personalize your messages.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Template name"
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">Channel</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleChange('type', value as MessageChannel)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="event" className="text-right">Event Trigger</Label>
            <Select
              value={formData.event_type}
              onValueChange={(value) => handleChange('event_type', value as EventType)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sale_completed">Sale Completed</SelectItem>
                <SelectItem value="service_check_in">Service Check-in</SelectItem>
                <SelectItem value="service_in_progress">Service In Progress</SelectItem>
                <SelectItem value="service_ready">Ready for Pickup</SelectItem>
                <SelectItem value="service_completed">Service Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="template" className="text-right pt-2">Template</Label>
            <div className="col-span-3 space-y-2">
              <Textarea
                id="template"
                value={formData.template_text}
                onChange={(e) => handleChange('template_text', e.target.value)}
                placeholder="Enter your message template here..."
                className="min-h-[120px]"
              />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Available variables:</p>
                <ul className="space-y-1 list-disc pl-5">
                  {getPlaceholderVariables().map((variable, index) => (
                    <li key={index}>{variable}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !formData.name || !formData.template_text}
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
