'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, Upload, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase, getCurrentHijriYear, getCurrentMasehiYear } from '@/lib/supabase';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

interface MuzakkiJSON {
  event_date?: string;
  muzakki?: string;
  jenis_pembayaran?: string;
  jumlah_jiwa?: number;
  nominal_fitrah?: number;
  nominal_maal?: number | null;
  nominal_infaq_in_zakat?: number | null;
  media_delivery?: string;
  petugas?: string;
}

interface MustahikJSON {
  'Nama Mustahiq'?: string;
  'Alamat Rumah'?: string;
  'No. Hp'?: string;
  'Kategori Mustahiq'?: string;
  'Nominal'?: string;
}

export default function ImportDataPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'muzakki' | 'mustahik'>('muzakki');
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [preview, setPreview] = useState<object[] | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);

      try {
        const text = await selectedFile.text();
        const json = JSON.parse(text);
        if (json.data && Array.isArray(json.data)) {
          setPreview(json.data.slice(0, 5));
        }
      } catch {
        setPreview(null);
      }
    }
  };

  const parseDate = (dateStr: string): string => {
    // Handle format "3/17/2025" -> "2025-03-17"
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const month = parts[0].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  };

  const parseNominal = (value: string | number | null | undefined): number | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return value;
    const cleaned = value.replace(/[,\s]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setResult(null);

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const data = json.data as (MuzakkiJSON | MustahikJSON)[];

      if (!data || !Array.isArray(data)) {
        throw new Error('Format JSON tidak valid. Pastikan ada field "data" yang berisi array.');
      }

      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      const tahunHijriah = getCurrentHijriYear();
      const tahunMasehi = getCurrentMasehiYear();

      if (importType === 'muzakki') {
        for (const item of data as MuzakkiJSON[]) {
          try {
            const jenisFitrah = item.jenis_pembayaran?.toLowerCase() === 'beras' ? 'beras' : 'uang';

            const { error } = await supabase.from('penerimaan').insert({
              tanggal_transaksi: item.event_date ? parseDate(item.event_date) : new Date().toISOString().split('T')[0],
              nama_muzakki: item.muzakki || 'Unknown',
              metode_bayar: item.media_delivery || 'Cash',
              jenis_fitrah: jenisFitrah,
              jumlah_jiwa: item.jumlah_jiwa || 1,
              nominal_fitrah: item.nominal_fitrah || 0,
              nominal_maal: item.nominal_maal || null,
              nominal_infaq: item.nominal_infaq_in_zakat || null,
              petugas: item.petugas || null,
              tahun_hijriah: tahunHijriah,
              tahun_masehi: tahunMasehi,
            });

            if (error) throw error;
            successCount++;
          } catch (err) {
            failedCount++;
            errors.push(`Gagal import ${item.muzakki}: ${(err as Error).message}`);
          }
        }
      } else {
        for (const item of data as MustahikJSON[]) {
          try {
            const { error } = await supabase.from('penyaluran').insert({
              tanggal_penyaluran: new Date().toISOString().split('T')[0],
              nama_mustahik: item['Nama Mustahiq'] || 'Unknown',
              alamat: item['Alamat Rumah'] || null,
              no_hp: item['No. Hp'] || null,
              kategori: item['Kategori Mustahiq'] || 'Fakir/Miskin',
              nominal_uang: parseNominal(item['Nominal']),
              tahun_hijriah: tahunHijriah,
              tahun_masehi: tahunMasehi,
            });

            if (error) throw error;
            successCount++;
          } catch (err) {
            failedCount++;
            errors.push(`Gagal import ${item['Nama Mustahiq']}: ${(err as Error).message}`);
          }
        }
      }

      setResult({
        success: successCount,
        failed: failedCount,
        errors: errors.slice(0, 5),
      });
    } catch (err) {
      setResult({
        success: 0,
        failed: 1,
        errors: [(err as Error).message],
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <FileUp className="w-7 h-7 text-orange-600" />
          Import Data
        </h1>
        <p className="mt-1 text-gray-500">
          Import data muzakki atau mustahik dari file JSON
        </p>
      </div>

      {/* Info */}
      <Card className="mb-6 p-4 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700">
            <p className="font-medium">Format File</p>
            <p className="mt-1">
              File harus berformat JSON dengan struktur yang sesuai. Data akan diimport ke tahun {getCurrentHijriYear()} H.
            </p>
          </div>
        </div>
      </Card>

      {/* Import Form */}
      <Card>
        <CardHeader>
          <CardTitle>Import Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Import Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Data
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="importType"
                  value="muzakki"
                  checked={importType === 'muzakki'}
                  onChange={(e) => setImportType(e.target.value as 'muzakki')}
                  className="mr-2"
                />
                <span>Data Muzakki (Penerimaan)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="importType"
                  value="mustahik"
                  checked={importType === 'mustahik'}
                  onChange={(e) => setImportType(e.target.value as 'mustahik')}
                  className="mr-2"
                />
                <span>Data Mustahik (Penyaluran)</span>
              </label>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File JSON
            </label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                {file ? (
                  <p className="text-sm text-gray-700 font-medium">{file.name}</p>
                ) : (
                  <p className="text-sm text-gray-500">Klik untuk pilih file JSON</p>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept=".json"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Preview */}
          {preview && preview.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview Data (5 data pertama)
              </label>
              <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto max-h-60">
                <pre className="text-xs text-gray-600">
                  {JSON.stringify(preview, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`p-4 rounded-lg ${
              result.failed === 0 ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {result.failed === 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  result.failed === 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.failed === 0 ? 'Import Berhasil!' : 'Import Selesai dengan Error'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Berhasil: {result.success} data | Gagal: {result.failed} data
              </p>
              {result.errors.length > 0 && (
                <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                  {result.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              onClick={handleImport}
              disabled={!file || isImporting}
            >
              <FileUp className="w-4 h-4 mr-2" />
              {isImporting ? 'Mengimport...' : 'Import Data'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Format Guide */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Format JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Muzakki</h4>
              <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto">
{`{
  "data": [
    {
      "event_date": "3/17/2025",
      "muzakki": "Pak H. Gunawan",
      "jenis_pembayaran": "Beras",
      "jumlah_jiwa": 4,
      "nominal_fitrah": 10,
      "nominal_maal": 1000000,
      "nominal_infaq_in_zakat": null,
      "media_delivery": "Cash",
      "petugas": "Pak Yayat"
    }
  ]
}`}
              </pre>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Mustahik</h4>
              <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto">
{`{
  "data": [
    {
      "Nama Mustahiq": "Dedi",
      "Alamat Rumah": "Jl. Lancar",
      "No. Hp": "08123456789",
      "Kategori Mustahiq": "Fakir/Miskin",
      "Nominal": "100,000.00"
    }
  ]
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
