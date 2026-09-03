(function () {
	console.log('!!!!!');

	const SUPABASE_URL = 'https://zojzhbwwqrsuvpvjomwy.supabase.co'
	const SUPABASE_ANON_KEY = 'sb_publishable_JEwm1VmdMqi_N-2QyMGEFA_YkH7cVeX'

	window.supabaseClient = window.supabase.createClient(
		SUPABASE_URL,
		SUPABASE_ANON_KEY
	)
})()