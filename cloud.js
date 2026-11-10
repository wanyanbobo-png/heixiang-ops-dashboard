(() => {
  'use strict';

  const config = window.BLACKBOX_CLOUD;
  if (!config?.url || !config.publishableKey) return;

  let clientPromise;
  function client() {
    clientPromise ??= import('https://esm.sh/@supabase/supabase-js@2.105.4?bundle')
      .then(({ createClient }) => createClient(config.url, config.publishableKey))
      .catch(error => {
        clientPromise = undefined;
        throw error;
      });
    return clientPromise;
  }

  function result({ data, error }) {
    if (error) throw error;
    return data;
  }

  async function table() {
    return (await client()).from('dashboard_state');
  }

  window.dashboardCloud = {
    async session() {
      return result(await (await client()).auth.getSession()).session;
    },
    async signIn(email, password) {
      return result(await (await client()).auth.signInWithPassword({ email, password })).session;
    },
    async signOut() {
      result(await (await client()).auth.signOut({ scope: 'local' }));
    },
    async read(userId) {
      return result(await (await table()).select('revision,snapshot').eq('user_id', userId).maybeSingle());
    },
    async write(userId, revision, snapshot) {
      const rows = await table();
      const write = revision === null
        ? rows.upsert({ user_id: userId, revision: 1, snapshot }, { onConflict: 'user_id', ignoreDuplicates: true })
        : rows.update({ revision: revision + 1, snapshot }).eq('user_id', userId).eq('revision', revision);
      return result(await write.select('revision').maybeSingle());
    }
  };
})();
