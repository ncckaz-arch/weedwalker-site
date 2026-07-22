import { NextResponse } from 'next/server';

type CategoryKey = 'craft' | 'smooth-coco-line' | 'precision-hydro' | 'living-soil';
type ProductType = 'indica' | 'sativa' | 'hybrid' | 'indica-dominant' | 'sativa-dominant';

type MenuItem = {
  id: string;
  name: string;
  category: CategoryKey;
  type: ProductType;
  thc: string;
  price: string;
  flavors: string[];
  effects: string[];
};

const DEFAULT_MENU_SHEET_ID = '1C_tVvdwyvC2Dd08VR5U3so5B202W42W6oJ0lf6n5Ulo';
const DEFAULT_MENU_SHEET_NAME = 'Menu Items';

const categoryAliases: Record<string, CategoryKey> = {
  craft: 'craft',
  'craft cultivation': 'craft',
  'smooth coco': 'smooth-coco-line',
  'smooth coco line': 'smooth-coco-line',
  'smooth-coco-line': 'smooth-coco-line',
  hydro: 'precision-hydro',
  'precision hydro': 'precision-hydro',
  'precise line': 'precision-hydro',
  'precision-hydro': 'precision-hydro',
  'living soil': 'living-soil',
  'living-soil': 'living-soil'
};

const typeAliases: Record<string, ProductType> = {
  indica: 'indica',
  sativa: 'sativa',
  hybrid: 'hybrid',
  'indica hybrid': 'indica-dominant',
  'indica dominant': 'indica-dominant',
  'indica-dominant': 'indica-dominant',
  'sativa hybrid': 'sativa-dominant',
  'sativa dominant': 'sativa-dominant',
  'sativa-dominant': 'sativa-dominant'
};

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sheetsApiItems = await loadMenuFromSheetsApi();
    if (sheetsApiItems?.length) {
      return NextResponse.json(
        { items: sheetsApiItems, source: 'google-sheets-api' },
        { headers: menuCacheHeaders() }
      );
    }

    const csvUrl = menuCsvUrl();
    if (!csvUrl) {
      return NextResponse.json({ items: [] }, { headers: menuCacheHeaders() });
    }

    const response = await fetch(csvUrl, {
      headers: { accept: 'text/csv,text/plain,*/*' },
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      return NextResponse.json({ items: [] }, { headers: menuCacheHeaders() });
    }

    const text = await response.text();
    const items = parseMenuCsv(text);

    return NextResponse.json(
      { items, source: 'google-sheet' },
      { headers: menuCacheHeaders() }
    );
  } catch {
    return NextResponse.json({ items: [] }, { headers: menuCacheHeaders() });
  }
}

async function loadMenuFromSheetsApi() {
  const credentialsJson = process.env.GOOGLE_CLOUD_CREDENTIALS_JSON;
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialsJson && !keyFile) return null;

  try {
    const { GoogleAuth } = await import('google-auth-library');
    const credentials = credentialsJson ? parseGoogleCredentials(credentialsJson) : undefined;
    const auth = new GoogleAuth({
      credentials,
      keyFile: credentials ? undefined : keyFile,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });
    const client = await auth.getClient();
    const sheetName = process.env.MENU_SHEET_NAME || DEFAULT_MENU_SHEET_NAME;
    const range = encodeURIComponent(`${sheetName}!A1:K500`);
    const response = await client.request<{ values?: string[][] }>({
      url: `https://sheets.googleapis.com/v4/spreadsheets/${menuSheetId()}/values/${range}`
    });

    if (!response.data.values?.length) return null;
    return parseMenuRows(response.data.values);
  } catch {
    return null;
  }
}

function menuCsvUrl() {
  if (process.env.MENU_SHEET_CSV_URL) return process.env.MENU_SHEET_CSV_URL;

  const sheetId = menuSheetId();
  if (!sheetId) return '';

  const sheetName = process.env.MENU_SHEET_NAME || DEFAULT_MENU_SHEET_NAME;
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
    sheetName
  )}`;
}

function menuCacheHeaders() {
  return {
    'Cache-Control': 's-maxage=60, stale-while-revalidate=300'
  };
}

function parseMenuCsv(csv: string): MenuItem[] {
  return parseMenuRows(parseCsv(csv));
}

function parseMenuRows(rows: string[][]): MenuItem[] {
  const [headerRow, ...dataRows] = rows;
  if (!headerRow?.length) return [];

  const headers = headerRow.map((header) => normalizeHeader(header));

  return dataRows
    .map((row, index) => rowToMenuItem(headers, row, index))
    .filter((item): item is MenuItem & { sortOrder: number } => Boolean(item))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ sortOrder: _sortOrder, ...item }) => item);
}

function menuSheetId() {
  return process.env.MENU_SHEET_ID || DEFAULT_MENU_SHEET_ID;
}

function parseGoogleCredentials(value: string) {
  const credentials = JSON.parse(value);
  if (typeof credentials.private_key === 'string') {
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
  }
  return credentials;
}

function rowToMenuItem(headers: string[], row: string[], index: number) {
  const value = (name: string) => {
    const columnIndex = headers.indexOf(name);
    return columnIndex >= 0 ? (row[columnIndex] || '').trim() : '';
  };

  const visible = value('visible');
  if (['false', '0', 'no', 'hidden', 'hide'].includes(visible.toLowerCase())) {
    return null;
  }

  const category = categoryAliases[normalizeValue(value('category'))];
  const type = typeAliases[normalizeValue(value('type'))];
  const name = value('name');
  const id = value('id') || slugify(name);

  if (!id || !name || !category || !type) return null;

  return {
    sortOrder: Number(value('sort_order') || value('sort') || index + 1),
    id,
    name,
    category,
    type,
    thc: value('thc'),
    price: value('price'),
    flavors: splitList(value('flavors') || value('terps') || value('terpenes')),
    effects: splitList(value('effects'))
  };
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '_');
}

function normalizeValue(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function splitList(value: string) {
  return value
    .split(/[,|;\n]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseCsv(input: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(field);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}
