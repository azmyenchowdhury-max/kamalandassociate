# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Production Runtime Config

This project uses `js/runtime-config.js` to centralize browser runtime globals.

In production, define `window.__APP_RUNTIME_CONFIG__` before loading `js/runtime-config.js`.

Example (add in `<head>`):

```html
<script>
	window.__APP_RUNTIME_CONFIG__ = {
		supabaseUrl: "https://rujctxkklzxnogniivdj.supabase.co",
		supabaseAnonKey: "YOUR_SUPABASE_ANON_JWT",
		supabasePublishableKey: "YOUR_SUPABASE_PUBLISHABLE_KEY",
		chatbotApiBase: "https://rujctxkklzxnogniivdj.supabase.co/functions/v1",
		chatbotAnonKey: "YOUR_SUPABASE_ANON_JWT",
		adminDashboardFunctionUrl: "https://rujctxkklzxnogniivdj.supabase.co/functions/v1/admin-dashboard"
	};
</script>
<script src="js/runtime-config.js"></script>
```

Important:
- Do not put `service_role` keys in frontend code.
- Keep `supabaseAnonKey` and `chatbotAnonKey` synchronized unless you intentionally use different anon JWTs.
