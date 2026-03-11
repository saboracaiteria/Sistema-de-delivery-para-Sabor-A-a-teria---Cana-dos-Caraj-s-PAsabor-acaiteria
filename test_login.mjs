import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xrmazsqdzjwbgkujcazh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhybWF6c3Fkemp3YmdrdWpjYXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyODY5ODcsImV4cCI6MjA4MDg2Mjk4N30.QEb9bHJlHCnyo4Hwq9o0Aa3Vh8UholhRv3oZIITaAV0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'nildoxz@gmail.com',
  password: '12457812',
});

if (error) {
  console.error('Erro no login:', error.message);
  if (error.message.includes('Email not confirmed')) {
    console.log('-> O email precisa ser confirmado no Supabase. Voce precisa ir no painel Supabase -> Authentication -> Users e confirmar manualmente o email.');
  }
} else {
  console.log('Login bem-sucedido!');
  console.log('Email:', data.user?.email);
  console.log('ID:', data.user?.id);
}
