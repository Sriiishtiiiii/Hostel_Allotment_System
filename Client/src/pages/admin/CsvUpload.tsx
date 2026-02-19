import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ParsedStudent {
  roll_no: string;
  name: string;
  email: string;
  department: string;
  gender: string;
  academic_year: number;
  cgpa: number | null;
  status: 'new' | 'existing' | 'error';
  error?: string;
}

interface Summary {
  total: number;
  new: number;
  existing: number;
  errors: number;
}

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-green-100 text-green-800',
  existing: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
};

export default function CsvUpload() {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<ParsedStudent[] | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState<{ inserted: number; updated: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setLoading(true);
    setPreview(null);
    setSummary(null);
    setDone(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await api.uploadCsvPreview(formData);
      setPreview(result.students);
      setSummary(result.summary);
    } catch (err: any) {
      toast.error(err.message || 'Failed to parse CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setImporting(true);
    try {
      const result = await api.confirmCsvImport(preview);
      setDone(result);
      setPreview(null);
      setSummary(null);
      toast.success(`Import complete: ${result.inserted} added, ${result.updated} updated`);
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload Student CSV</h1>
        <p className="text-muted-foreground mt-1">
          Import student results. Required columns: <code className="bg-muted px-1 rounded text-sm">roll_no, name, email, department, gender, academic_year, cgpa</code>
        </p>
      </div>

      {/* Drop zone */}
      {!preview && !done && (
        <Card
          className={`border-2 border-dashed cursor-pointer transition-colors ${dragging ? 'border-blue-500 bg-blue-50' : 'border-muted-foreground/30 hover:border-blue-400'}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="text-5xl">📂</div>
            <p className="text-lg font-medium">Drop your CSV here or click to browse</p>
            <p className="text-sm text-muted-foreground">Max 5MB · CSV files only</p>
            {loading && <p className="text-blue-600 animate-pulse">Parsing...</p>}
          </CardContent>
        </Card>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
      />

      {/* Success state */}
      {done && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-8 text-center space-y-3">
            <div className="text-5xl">✅</div>
            <p className="text-xl font-semibold text-green-800">Import Complete</p>
            <p className="text-green-700">
              {done.inserted} students added · {done.updated} students updated
            </p>
            <Button onClick={() => { setDone(null); if (inputRef.current) inputRef.current.value = ''; }}>
              Upload another file
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Preview table */}
      {preview && summary && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="flex gap-3 flex-wrap">
            <Badge variant="outline" className="text-sm px-3 py-1">Total: {summary.total}</Badge>
            <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1 hover:bg-green-100">New: {summary.new}</Badge>
            <Badge className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 hover:bg-yellow-100">Existing: {summary.existing}</Badge>
            {summary.errors > 0 && (
              <Badge className="bg-red-100 text-red-800 text-sm px-3 py-1 hover:bg-red-100">Errors: {summary.errors}</Badge>
            )}
          </div>

          {summary.errors > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="py-3 px-4">
                <p className="text-red-700 text-sm font-medium">
                  {summary.errors} row(s) have errors and will be skipped. Fix and re-upload if needed.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Preview ({preview.length} rows)</CardTitle>
              <CardDescription>Review before confirming the import</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      {['Roll No', 'Name', 'Email', 'Dept', 'Gender', 'Year', 'CGPA', 'Status'].map(h => (
                        <th key={h} className="text-left px-4 py-2 font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((s, i) => (
                      <tr key={i} className={`border-t ${s.status === 'error' ? 'bg-red-50' : ''}`}>
                        <td className="px-4 py-2 font-mono text-xs">{s.roll_no}</td>
                        <td className="px-4 py-2">{s.name}</td>
                        <td className="px-4 py-2 text-xs">{s.email}</td>
                        <td className="px-4 py-2 text-xs">{s.department}</td>
                        <td className="px-4 py-2">{s.gender}</td>
                        <td className="px-4 py-2">{s.academic_year}</td>
                        <td className="px-4 py-2">{s.cgpa ?? '—'}</td>
                        <td className="px-4 py-2">
                          {s.status === 'error' ? (
                            <span className="text-red-600 text-xs" title={s.error}>⚠ {s.error}</span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[s.status]}`}>
                              {s.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={handleConfirm}
              disabled={importing || summary.new + summary.existing === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {importing ? 'Importing...' : `Confirm Import (${summary.new + summary.existing} students)`}
            </Button>
            <Button variant="outline" onClick={() => { setPreview(null); setSummary(null); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* CSV format guide */}
      <Card className="bg-muted/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">CSV Format</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs font-mono text-muted-foreground">
{`roll_no,name,email,department,gender,academic_year,cgpa
21CS001,Arjun Kumar,arjun@nith.ac.in,Computer Science,Male,2021,8.90
21EC002,Priya Sharma,priya@nith.ac.in,Electronics,Female,2021,9.20`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
