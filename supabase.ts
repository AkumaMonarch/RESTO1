
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const SUPABASE_URL = 'https://rfppmfygzrtlswdqawbv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcHBtZnlnenJ0bHN3ZHFhd2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NDMxNDQsImV4cCI6MjA4NTIxOTE0NH0.aP7BkryJwKhE9xr7_zi9SODFgiaagDfkf0lNrVhtGfQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
