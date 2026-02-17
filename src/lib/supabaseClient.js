import { createClient } from '@supabase/supabase-js';

// Replace these with your actual keys from the Supabase dashboard
const supabaseUrl = 'https://jhdcopamctltiwuxwdiv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZGNvcGFtY3RsdGl3dXh3ZGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NDE4NzEsImV4cCI6MjA4NjExNzg3MX0.OCUotLQcK0TqGeqycUTLaHu_w7lYa3_5W7XJ-xIXH7A';

export const supabase = createClient(supabaseUrl, supabaseKey);