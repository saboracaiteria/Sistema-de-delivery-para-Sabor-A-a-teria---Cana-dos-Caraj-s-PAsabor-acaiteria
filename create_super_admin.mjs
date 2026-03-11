import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xrmazsqdzjwbgkujcazh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhybWF6c3Fkemp3YmdrdWpjYXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyODY5ODcsImV4cCI6MjA4MDg2Mjk4N30.QEb9bHJlHCnyo4Hwq9o0Aa3Vh8UholhRv3oZIITaAV0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const { data, error } = await supabase.auth.signUp({
  email: 'nildoxz@gmail.com',
  password: '12457812',
});

if (error) {
  console.error('Erro ao criar usuario:', error.message);
} else {
  console.log('Usuario criado com sucesso!');
  console.log('ID:', data.user?.id);
  console.log('Email:', data.user?.email);
  console.log('Verifique o email para confirmar a conta (caso confirmacao esteja ativada no Supabase).');
}
