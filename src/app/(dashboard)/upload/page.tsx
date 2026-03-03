"use client";

import { useCallback, useState, useTransition } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { uploadCSV, type UploadResult } from "@/lib/actions/upload";

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith(".csv") || droppedFile.name.endsWith(".CSV"))) {
      setFile(droppedFile);
      setResult(null);
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        setResult(null);
      }
    },
    []
  );

  const handleUpload = useCallback(() => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const res = await uploadCSV(formData);
      setResult(res);
      if (res.success) {
        setFile(null);
      }
    });
  }, [file]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Import Data</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload AppFolio CSV exports to update your dashboard
        </p>
      </div>

      {/* Drop Zone */}
      <Card>
        <CardContent className="pt-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
          >
            <Upload className="mx-auto size-10 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Drop your CSV file here</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              or click to browse
            </p>
            <label>
              <input
                type="file"
                accept=".csv,.CSV"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button variant="outline" asChild>
                <span>Choose File</span>
              </Button>
            </label>
          </div>

          {/* Selected File */}
          {file && !result && (
            <div className="mt-4 flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <FileText className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button onClick={handleUpload} disabled={isPending}>
                {isPending ? "Importing..." : "Import"}
              </Button>
            </div>
          )}

          {/* Result */}
          {result && (
            <div
              className={`mt-4 flex items-start gap-3 rounded-lg border p-4 ${
                result.success
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="size-5 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                {result.success ? (
                  <>
                    <p className="text-sm font-medium text-green-800">
                      Import successful
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">
                      {result.rowCount} rows imported from{" "}
                      <Badge variant="secondary" className="text-xs">
                        {result.reportTypeLabel}
                      </Badge>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-red-800">
                      Import failed
                    </p>
                    <p className="text-xs text-red-700 mt-0.5">
                      {result.error}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supported Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Supported Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">Rent Roll</p>
              <p className="text-xs text-muted-foreground mt-1">
                Units, tenants, lease dates, rent amounts
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">Receipts Detail</p>
              <p className="text-xs text-muted-foreground mt-1">
                Payment records, dates, amounts, methods
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">Occupancy Summary</p>
              <p className="text-xs text-muted-foreground mt-1">
                Occupancy rates, unit counts over time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
