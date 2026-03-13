(function () {
  var config = window.__APP_RUNTIME_CONFIG__ || {};
  var defaultSupabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1amN0eGtrbHp4bm9nbmlpdmRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTc4MDIsImV4cCI6MjA4ODgzMzgwMn0.U8D72HAs1rzQPOnruReG7Q_h3gBDE0akaC8wDtkkYC8";
  var defaultSupabasePublishableKey = "sb_publishable_utSnDAPyeFLPrzYGfXzHaA_LOKNrIsJ";

  var supabaseUrl =
    config.supabaseUrl ||
    window.__SUPABASE_URL__ ||
    "https://rujctxkklzxnogniivdj.supabase.co";

  var anonKey =
    config.supabaseAnonKey ||
    window.__SUPABASE_ANON_KEY__ ||
    defaultSupabaseAnonKey;

  window.__SUPABASE_URL__ = supabaseUrl;
  window.__SUPABASE_ANON_KEY__ = anonKey;
  window.__SUPABASE_PUBLISHABLE_KEY__ =
    config.supabasePublishableKey ||
    window.__SUPABASE_PUBLISHABLE_KEY__ ||
    defaultSupabasePublishableKey;

  window.__KAMAL_CHATBOT_API_BASE__ =
    config.chatbotApiBase ||
    window.__KAMAL_CHATBOT_API_BASE__ ||
    supabaseUrl + "/functions/v1";

  window.__KAMAL_CHATBOT_SUPABASE_ANON_KEY__ =
    config.chatbotAnonKey ||
    window.__KAMAL_CHATBOT_SUPABASE_ANON_KEY__ ||
    anonKey;

  window.__ADMIN_DASHBOARD_FUNCTION_URL__ =
    config.adminDashboardFunctionUrl ||
    window.__ADMIN_DASHBOARD_FUNCTION_URL__ ||
    supabaseUrl + "/functions/v1/admin-dashboard";
})();
