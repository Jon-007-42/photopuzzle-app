// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Læs environment-variabler
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_KEY;

// Opret klient
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
