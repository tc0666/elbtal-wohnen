import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

interface XLSXUploadProps {
  onUploadComplete?: () => void;
}

export const XLSXUpload: React.FC<XLSXUploadProps> = ({ onUploadComplete }) => {
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
    if (selectedFile && (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || selectedFile.name.endsWith('.xlsx'))) {
      setFile(selectedFile);
      setResult(null);
    } else {
      alert('Please select a valid XLSX file');
    }
  };

  const parseXLSXFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      // Get admin session token from localStorage
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No admin session found. Please log in again.');
      }

      // Parse XLSX file using the new structure
      const xlsxData = await parseXLSXFile(file);
      
      if (xlsxData.length < 2) {
        throw new Error('XLSX file must have at least a header row and one data row');
      }

      // Convert to JSON format with column headers
      const workbook = XLSX.read(await file.arrayBuffer());
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log('XLSX Data:', jsonData);

      const properties = [];
      const errors = [];

      // Process each row
      for (let i = 0; i < jsonData.length; i++) {
        try {
          const row = jsonData[i] as any;
          
          console.log(`Processing row ${i + 1}:`, row);

          // Skip empty rows
          if (!row['Title'] && !row['postcode-city']) continue;

          // Parse postcode-city field
          let postalCode = '';
          let cityName = '';
          if (row['postcode-city']) {
            const postcodeCity = row['postcode-city'].toString().trim();
            const match = postcodeCity.match(/^(\d{5})\s+(.+)$/);
            if (match) {
              postalCode = match[1];
              cityName = match[2];
            } else {
              // Fallback: try to split by space and assume first part is postcode
              const parts = postcodeCity.split(' ');
              if (parts.length >= 2 && /^\d{5}$/.test(parts[0])) {
                postalCode = parts[0];
                cityName = parts.slice(1).join(' ');
              } else {
                cityName = postcodeCity;
              }
            }
          }

          // Parse available date
          let availableFrom = new Date().toISOString().split('T')[0];
          if (row['Verfügbar']) {
            try {
              const verfugbarDate = new Date(row['Verfügbar']);
              if (!isNaN(verfugbarDate.getTime())) {
                availableFrom = verfugbarDate.toISOString().split('T')[0];
              }
            } catch (e) {
              console.log('Could not parse Verfügbar date:', row['Verfügbar']);
            }
          }

          // Collect all images including featured
          const images = [];
          
          // Add featured image first
          if (row['image-featured']) {
            images.push(row['image-featured']);
          }
          
          // Add additional images from image-1 to image-6
          for (let imgNum = 1; imgNum <= 6; imgNum++) {
            const imgKey = `image-${imgNum}`;
            if (row[imgKey]) {
              images.push(row[imgKey]);
            }
          }

          // Parse numeric values with fallbacks
          const parseNumber = (value: any, fallback = 0) => {
            if (!value) return fallback;
            const parsed = parseInt(value.toString().replace(/[^\d]/g, ''));
            return isNaN(parsed) ? fallback : parsed;
          };

          // Create property object
          const property = {
            Title: row['Title'] || 'Untitled Property',
            'image-featured': row['image-featured'] || '',
            'image-1': row['image-1'] || '',
            'image-2': row['image-2'] || '',
            'image-3': row['image-3'] || '',
            'image-4': row['image-4'] || '',
            'image-5': row['image-5'] || '',
            'image-6': row['image-6'] || '',
            'Verfügbar': row['Verfügbar'] || '',
            'Objektbeschreibung': row['Objektbeschreibung'] || '',
            'Ausstattungsmerkmale': row['Ausstattungsmerkmale'] || '',
            'Rent': row['Rent'] || '',
            'Nebenkosten': row['Nebenkosten'] || '',
            'postcode-city': row['postcode-city'] || '',
            'address': row['address'] || '',
            'size': row['size'] || '',
            'zimmer': row['zimmer'] || '',
            'Lage': row['Lage'] || '',
            'Weitere': row['Weitere'] || ''
          };

          properties.push(property);
        } catch (error) {
          console.error(`Error processing row ${i + 1}:`, error);
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      console.log(`Processed ${properties.length} properties, ${errors.length} errors`);

      // Send to edge function
      const { data, error } = await supabase.functions.invoke('xlsx-upload', {
        body: { properties, token },
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
          XLSX Import
        </CardTitle>
        <CardDescription>
          Upload an XLSX file to import multiple properties at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="xlsx-file" className="text-sm font-medium">
            Choose XLSX File
          </label>
          <Input
            id="xlsx-file"
            type="file"
            accept=".xlsx"
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
          <h4 className="text-sm font-medium">Expected XLSX Format:</h4>
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
            <p>The XLSX should have these columns:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li><strong>Title:</strong> Property title</li>
              <li><strong>image-featured:</strong> Featured image URL</li>
              <li><strong>image-1 to image-6:</strong> Additional carousel images</li>
              <li><strong>Verfügbar:</strong> Available from date</li>
              <li><strong>Objektbeschreibung:</strong> Property description</li>
              <li><strong>Ausstattungsmerkmale:</strong> Features description</li>
              <li><strong>Rent:</strong> Cold rent amount</li>
              <li><strong>Nebenkosten:</strong> Additional costs</li>
              <li><strong>postcode-city:</strong> Postcode and city (e.g., "12345 Berlin")</li>
              <li><strong>address:</strong> Property address</li>
              <li><strong>size:</strong> Property size in m²</li>
              <li><strong>zimmer:</strong> Number of rooms</li>
              <li><strong>Lage:</strong> Location/neighborhood description</li>
              <li><strong>Weitere:</strong> Additional description</li>
            </ul>
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
              Upload XLSX
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