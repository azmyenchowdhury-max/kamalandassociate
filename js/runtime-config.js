(function () {
  var config = window.__APP_RUNTIME_CONFIG__ || {};

  var supabaseUrl =
    config.supabaseUrl ||
    window.__SUPABASE_URL__ ||
    "https://rujctxkklzxnogniivdj.supabase.co";

  var anonKey =
    config.supabaseAnonKey ||
    window.__SUPABASE_ANON_KEY__ ||
    "";

  window.__SUPABASE_URL__ = supabaseUrl;
  window.__SUPABASE_ANON_KEY__ = anonKey;
  window.__SUPABASE_PUBLISHABLE_KEY__ =
    config.supabasePublishableKey ||
    window.__SUPABASE_PUBLISHABLE_KEY__ ||
    "";

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
