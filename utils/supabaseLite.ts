export interface SupabaseError {
  message: string;
  status?: number;
  hint?: string;
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: SupabaseError | null;
}

interface SelectOptions {
  eq?: Record<string, string | number | boolean>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
}

interface InsertOptions {
  returning?: 'representation' | 'minimal';
}

class SupabaseTableClient {
  constructor(private readonly supabaseUrl: string, private readonly supabaseKey: string, private readonly table: string) {}

  async insert<T>(values: Record<string, unknown>[], options: InsertOptions = {}): Promise<SupabaseResponse<T[]>> {
    const response = await fetch(`${this.supabaseUrl}/rest/v1/${this.table}`, {
      method: 'POST',
      headers: this.buildHeaders({ Prefer: `return=${options.returning ?? 'representation'}` }),
      body: JSON.stringify(values),
    });

    return this.parseResponse<T[]>(response);
  }

  async select<T = unknown>(columns = '*', options: SelectOptions = {}): Promise<SupabaseResponse<T[]>> {
    const url = new URL(`${this.supabaseUrl}/rest/v1/${this.table}`);
    url.searchParams.set('select', columns);

    if (options.eq) {
      Object.entries(options.eq).forEach(([key, value]) => {
        url.searchParams.append(key, `eq.${value}`);
      });
    }

    if (options.orderBy) {
      const { column, ascending = true } = options.orderBy;
      url.searchParams.append('order', `${column}.${ascending ? 'asc' : 'desc'}`);
    }

    if (options.limit) {
      url.searchParams.append('limit', `${options.limit}`);
    }

    const response = await fetch(url.toString(), {
      headers: this.buildHeaders(),
    });

    return this.parseResponse<T[]>(response);
  }

  private buildHeaders(extra: Record<string, string> = {}) {
    return {
      apikey: this.supabaseKey,
      Authorization: `Bearer ${this.supabaseKey}`,
      'Content-Type': 'application/json',
      ...extra,
    };
  }

  private async parseResponse<T>(response: Response): Promise<SupabaseResponse<T>> {
    const text = await response.text();
    const payload = text ? (JSON.parse(text) as T) : null;

    if (!response.ok) {
      const error: SupabaseError = {
        message: (payload as any)?.message || response.statusText,
        status: response.status,
        hint: (payload as any)?.hint,
      };
      return { data: null, error };
    }

    return { data: payload, error: null };
  }
}

export interface SupabaseClient {
  from: (table: string) => SupabaseTableClient;
}

export function createClient(supabaseUrl: string, supabaseKey: string): SupabaseClient {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and anon key are required to create a client.');
  }

  return {
    from: (table: string) => new SupabaseTableClient(supabaseUrl, supabaseKey, table),
  };
}
