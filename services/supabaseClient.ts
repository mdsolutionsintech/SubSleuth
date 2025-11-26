import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://corguwbcolcxlhpfkehv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcmd1d2Jjb2xjeGxocGZrZWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMTIyNDYsImV4cCI6MjA3OTY4ODI0Nn0.W9GX5ijHGCddI_K0oUwThXLJSZfH5osX8S5aiUd15nc';

export const supabase = createClient(supabaseUrl, supabaseKey);