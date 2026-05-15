import 'server-only';

const BASE = process.env.FRAPPE_BASE_URL!;
const AUTH = `token ${process.env.FRAPPE_API_KEY}:${process.env.FRAPPE_API_SECRET}`;

type FrappeListParams = {
  fields?: string[];
  filters?: Array<[string, string, unknown]>;
  limit?: number;
  order_by?: string;
};

export async function frappeList<T>(
  doctype: string,
  params: FrappeListParams = {}
): Promise<T[]> {
  const url = new URL(`/api/resource/${doctype}`, BASE);
  if (params.fields) url.searchParams.set('fields', JSON.stringify(params.fields));
  if (params.filters) url.searchParams.set('filters', JSON.stringify(params.filters));
  if (params.limit) url.searchParams.set('limit_page_length', String(params.limit));
  if (params.order_by) url.searchParams.set('order_by', params.order_by);

  const res = await fetch(url, {
    headers: { Authorization: AUTH },
    next: { revalidate: 30, tags: [doctype] },
  });
  if (!res.ok) throw new Error(`Frappe list ${doctype} failed: ${res.status}`);
  const json = await res.json();
  return json.data as T[];
}

export async function frappeGet<T>(doctype: string, name: string): Promise<T> {
  const res = await fetch(
    `${BASE}/api/resource/${doctype}/${encodeURIComponent(name)}`,
    {
      headers: { Authorization: AUTH },
      next: { revalidate: 30, tags: [doctype, `${doctype}:${name}`] },
    }
  );
  if (!res.ok) throw new Error(`Frappe get ${doctype}/${name} failed: ${res.status}`);
  const json = await res.json();
  return json.data as T;
}

export async function frappeCreate<T>(
  doctype: string,
  payload: Partial<T>
): Promise<T> {
  const res = await fetch(`${BASE}/api/resource/${doctype}`, {
    method: 'POST',
    headers: { Authorization: AUTH, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Frappe create ${doctype} failed: ${res.status}`);
  const json = await res.json();
  return json.data as T;
}

export async function frappeUpdate<T>(
  doctype: string,
  name: string,
  payload: Partial<T>
): Promise<T> {
  const res = await fetch(
    `${BASE}/api/resource/${doctype}/${encodeURIComponent(name)}`,
    {
      method: 'PUT',
      headers: { Authorization: AUTH, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) throw new Error(`Frappe update ${doctype}/${name} failed: ${res.status}`);
  const json = await res.json();
  return json.data as T;
}

export async function frappeDelete(doctype: string, name: string): Promise<void> {
  const res = await fetch(
    `${BASE}/api/resource/${doctype}/${encodeURIComponent(name)}`,
    { method: 'DELETE', headers: { Authorization: AUTH } }
  );
  if (!res.ok) throw new Error(`Frappe delete ${doctype}/${name} failed: ${res.status}`);
}

export async function frappeUploadFile(
  file: File,
  attachedTo: { doctype: string; name: string; fieldname?: string }
): Promise<{ file_url: string; file_name: string }> {
  const form = new FormData();
  form.append('file', file);
  form.append('doctype', attachedTo.doctype);
  form.append('docname', attachedTo.name);
  if (attachedTo.fieldname) form.append('fieldname', attachedTo.fieldname);

  const res = await fetch(`${BASE}/api/method/upload_file`, {
    method: 'POST',
    headers: { Authorization: AUTH },
    body: form,
  });
  if (!res.ok) throw new Error(`Frappe upload failed: ${res.status}`);
  const json = await res.json();
  return json.message;
}

export async function frappeMethod<T>(
  method: string,
  args: Record<string, unknown> = {}
): Promise<T> {
  const res = await fetch(`${BASE}/api/method/${method}`, {
    method: 'POST',
    headers: { Authorization: AUTH, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(`Frappe method ${method} failed: ${res.status}`);
  const json = await res.json();
  return json.message as T;
}
