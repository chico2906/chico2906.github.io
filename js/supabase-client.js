// Configuração do Supabase — WG Houses
// A "anon key" é pública por design (protegida pelas regras de RLS no banco),
// por isso pode ficar exposta aqui no código do site sem problema de segurança.
const SUPABASE_URL = 'https://ilmsdcjzerapavhdehxt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DnHm0PdqyNwvPLahcT2W7Q_Nh00XdhD';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.sb = sb;
