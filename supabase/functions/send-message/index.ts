
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MessageRequest {
  customerId?: string;
  customerPhone: string;
  customerName?: string;
  messageType: "sms" | "whatsapp";
  templateId?: string;
  templateText?: string;
  variables?: Record<string, string>;
  eventReference?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the JWT token from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the authenticated user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the request body
    const { 
      customerId, 
      customerPhone, 
      customerName, 
      messageType, 
      templateId, 
      templateText, 
      variables, 
      eventReference 
    } = await req.json() as MessageRequest;

    if (!customerPhone) {
      return new Response(
        JSON.stringify({ error: "Customer phone number is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the template if templateId is provided
    let finalTemplateText = templateText || "";
    if (templateId) {
      const { data: template, error: templateError } = await supabaseClient
        .from("message_templates")
        .select("*")
        .eq("id", templateId)
        .eq("user_id", user.id)
        .single();

      if (templateError || !template) {
        return new Response(
          JSON.stringify({ error: "Template not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      finalTemplateText = template.template_text;
    }

    if (!finalTemplateText) {
      return new Response(
        JSON.stringify({ error: "Either templateId or templateText must be provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process template variables
    let processedMessage = finalTemplateText;
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        processedMessage = processedMessage.replace(new RegExp(`{{${key}}}`, "g"), value);
      });
    }

    // For this implementation, we'll simulate sending messages
    // In a production environment, you would integrate with Twilio or WhatsApp Business API
    console.log(`Simulating ${messageType} message to ${customerPhone}: ${processedMessage}`);
    
    // Log the message
    const { data: messageLog, error: logError } = await supabaseClient
      .from("message_logs")
      .insert({
        user_id: user.id,
        customer_id: customerId,
        template_id: templateId,
        channel: messageType,
        recipient: customerPhone,
        message_text: processedMessage,
        status: "sent", // In a real implementation, this would initially be 'queued'
        event_reference: eventReference
      })
      .select()
      .single();

    if (logError) {
      console.error("Error logging message:", logError);
      return new Response(
        JSON.stringify({ error: "Failed to log message" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Message sent successfully", 
        messageId: messageLog.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error in send-message function:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
