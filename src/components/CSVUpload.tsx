import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CSVUploadProps {
  onUploadComplete?: () => void;
}

export const CSVUpload: React.FC<CSVUploadProps> = ({ onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    imported?: number;
    total?: number;
    errors?: string[];
  } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResult(null);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      // Get admin session token from localStorage
      const token = localStorage.getItem('adminToken'); // Fixed: changed from 'admin_token' to 'adminToken'
      if (!token) {
        throw new Error('No admin session found. Please log in again.');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('token', token);

      const { data, error } = await supabase.functions.invoke('csv-upload', {
        body: formData,
      });

      if (error) {
        throw error;
      }

      setResult(data);
      if (data.success && onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Upload error:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          CSV Import
        </CardTitle>
        <CardDescription>
          Upload a CSV file to import multiple properties at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="csv-file" className="text-sm font-medium">
            Choose CSV File
          </label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {file && (
            <p className="text-sm text-muted-foreground">
              Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Expected CSV Format:</h4>
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
            <p>The CSV should have these columns in order:</p>
            <ol className="list-decimal list-inside mt-1 space-y-0.5">
              <li>Image URL</li>
              <li>Property Page URL</li>
              <li>Image Description</li>
              <li>Property ID</li>
              <li>Title</li>
              <li>Location (postal code, city)</li>
              <li>Price Type</li>
              <li>Price Value</li>
              <li>Area Value</li>
              <li>Area Label</li>
              <li>Additional Value (rooms)</li>
              <li>Additional Label</li>
            </ol>
          </div>
        </div>

        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload CSV
            </>
          )}
        </Button>

        {result && (
          <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              <div className="space-y-2">
                <p className={result.success ? 'text-green-800' : 'text-red-800'}>
                  {result.message}
                </p>
                {result.success && result.imported !== undefined && (
                  <p className="text-sm text-green-700">
                    Successfully imported {result.imported} out of {result.total} properties
                  </p>
                )}
                {result.errors && result.errors.length > 0 && (
                  <div className="text-sm">
                    <p className="font-medium text-red-700 mb-1">Errors:</p>
                    <ul className="text-red-600 space-y-1">
                      {result.errors.slice(0, 5).map((error, index) => (
                        <li key={index} className="text-xs">• {error}</li>
                      ))}
                      {result.errors.length > 5 && (
                        <li className="text-xs">... and {result.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};