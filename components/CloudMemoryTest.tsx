import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Cloud, Database, RefreshCw } from 'lucide-react';
import { getSupabaseClient, supabaseEnvDiagnostics } from '../utils/supabaseClient';

interface MemoryRow {
  id: string;
  value: string;
  created_at: string;
}

type TestStatus = 'idle' | 'running' | 'success' | 'error';

export const CloudMemoryTest: React.FC = () => {
  const [status, setStatus] = useState<TestStatus>('idle');
  const [message, setMessage] = useState('Waiting to run live cloud test…');
  const [latestRow, setLatestRow] = useState<MemoryRow | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const envMessages = useMemo(() => {
    if (supabaseEnvDiagnostics.hasAllEnv) {
      return [`Supabase URL set`, `Anon key loaded (${supabaseEnvDiagnostics.supabaseAnonKeyMasked})`];
    }
    return supabaseEnvDiagnostics.missingEnv.map((env) => `${env} is missing`);
  }, []);

  useEffect(() => {
    if (supabaseEnvDiagnostics.hasAllEnv) {
      runLiveTest();
    } else {
      setStatus('error');
      setMessage('Supabase environment variables are missing.');
      setErrorDetail('Add SUPABASE_URL and SUPABASE_ANON_KEY to run the cloud memory test.');
    }
  }, []);

  const runLiveTest = async () => {
    setStatus('running');
    setMessage('Executing Supabase round-trip test…');
    setErrorDetail(null);

    const supabase = getSupabaseClient();
    if (!supabase) {
      const warning =
        'Supabase client not initialized. Verify SUPABASE_URL and SUPABASE_ANON_KEY in your environment.';
      setStatus('error');
      setMessage('Cannot reach Supabase because the client is undefined.');
      setErrorDetail(warning);
      console.error(warning);
      return;
    }

    const testValue = `live-test-${new Date().toISOString()}`;
    console.info('[Supabase] Writing test value to app_memory_test:', testValue);

    const insertResult = await supabase
      .from('app_memory_test')
      .insert<MemoryRow>([{ value: testValue }]);

    if (insertResult.error) {
      const errorText = `Insert failed: ${insertResult.error.message}`;
      const hint =
        'If the table does not exist yet, run supabase/app_memory_test.sql in your project SQL editor to create it.';
      setStatus('error');
      setMessage('Supabase write failed.');
      setErrorDetail(`${errorText} ${hint}`);
      console.error('[Supabase] Insert error', insertResult.error);
      return;
    }

    const selectResult = await supabase
      .from('app_memory_test')
      .select<MemoryRow>('*', {
        eq: { value: testValue },
        orderBy: { column: 'created_at', ascending: false },
        limit: 1,
      });

    if (selectResult.error) {
      const errorText = `Readback failed: ${selectResult.error.message}`;
      setStatus('error');
      setMessage('Supabase read failed.');
      setErrorDetail(errorText);
      console.error('[Supabase] Select error', selectResult.error);
      return;
    }

    const row = selectResult.data?.[0];
    if (!row) {
      setStatus('error');
      setMessage('Supabase returned no rows.');
      setErrorDetail('The cloud insert did not come back in the select query.');
      console.warn('[Supabase] Select returned no data');
      return;
    }

    setLatestRow(row);
    setStatus('success');
    setMessage('Supabase round-trip succeeded and cloud memory is working.');
    console.info('[Supabase] Cloud memory confirmed', row);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
          <Cloud size={18} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Supabase Cloud Memory Check</h3>
          <p className="text-sm text-slate-500">
            Writes a live row to <code>app_memory_test</code> and reads it back to prove cloud persistence across devices.
          </p>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status === 'success' ? (
              <CheckCircle2 className="text-emerald-600" size={18} />
            ) : status === 'error' ? (
              <AlertCircle className="text-amber-600" size={18} />
            ) : (
              <RefreshCw className="text-indigo-600 animate-spin" size={18} />
            )}
            <span className="font-medium text-slate-800">{message}</span>
          </div>
          <button
            onClick={runLiveTest}
            className="inline-flex items-center gap-2 text-sm text-indigo-700 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50"
          >
            <RefreshCw size={16} /> Re-run live test
          </button>
        </div>
        {errorDetail && <p className="text-sm text-amber-700 mt-2">{errorDetail}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-700">
            <Database size={16} />
            <span className="text-sm font-semibold">Environment</span>
          </div>
          <ul className="text-xs text-slate-500 mt-2 space-y-1">
            {envMessages.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-700">
            <Cloud size={16} />
            <span className="text-sm font-semibold">Latest write</span>
          </div>
          {latestRow ? (
            <dl className="text-xs text-slate-600 mt-2 space-y-1">
              <div className="flex justify-between"><dt className="font-medium">ID</dt><dd className="truncate max-w-[170px]">{latestRow.id}</dd></div>
              <div className="flex justify-between"><dt className="font-medium">Value</dt><dd className="truncate max-w-[170px]">{latestRow.value}</dd></div>
              <div className="flex justify-between"><dt className="font-medium">Timestamp</dt><dd>{latestRow.created_at}</dd></div>
            </dl>
          ) : (
            <p className="text-xs text-slate-500 mt-2">No cloud data yet.</p>
          )}
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-700">
            <AlertCircle size={16} />
            <span className="text-sm font-semibold">RLS / Access</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            If Row Level Security blocks the insert/select, the error will be shown above. Use anon read/write policies for
            <code> app_memory_test</code> to allow the test.
          </p>
        </div>
      </div>
    </div>
  );
};
