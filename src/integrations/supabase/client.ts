// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dnjdglqovdwdpxqgenkn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuamRnbHFvdmR3ZHB4cWdlbmtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNjYzMTAsImV4cCI6MjA1NzY0MjMxMH0.EKzLKRO4Jpc_HOatTmkMXPzRKafmBij7-JM0roYNdbA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);