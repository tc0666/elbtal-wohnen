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

      // Parse XLSX file
      const xlsxData = await parseXLSXFile(file);
      
      if (xlsxData.length < 2) {
        throw new Error('XLSX file must have at least a header row and one data row');
      }

      // Get headers from first row
      const headers = xlsxData[0] as string[];
      console.log('XLSX Headers:', headers);

      // Find column indices - handle multiple Frymo-listing-meta-item-value columns
      const imageColIndex = headers.findIndex(h => h && h.toLowerCase().includes('attachment-medium image'));
      const titleColIndex = headers.findIndex(h => h === 'A');
      const locationColIndex = headers.findIndex(h => h && h.toLowerCase().includes('frymo-listing-location'));
      const priceColIndex = headers.findIndex(h => h && h.toLowerCase().includes('price'));
      
      // Find all Frymo-listing-meta-item-value columns
      const metaValueColumns = [];
      headers.forEach((header, index) => {
        if (header && header.toLowerCase().includes('frymo-listing-meta-item-value')) {
          metaValueColumns.push(index);
        }
      });

      console.log('Column indices:', {
        image: imageColIndex,
        title: titleColIndex,
        location: locationColIndex,
        price: priceColIndex,
        metaValueColumns: metaValueColumns
      });

      const properties = [];
      const errors = [];

      // Process each row (skip header)
      for (let i = 1; i < xlsxData.length; i++) {
        try {
          const row = xlsxData[i] as any[];
          
          const imageUrl = row[imageColIndex] || '';
          const title = row[titleColIndex] || '';
          const location = row[locationColIndex] || '';
          const priceRaw = row[priceColIndex] || '';
          
          // Get values from all meta value columns
          const metaValues = metaValueColumns.map(colIndex => row[colIndex] || '');
          
          console.log(`Processing row ${i}:`, {
            imageUrl,
            title,
            location,
            priceRaw,
            metaValues
          });

          // Skip empty rows
          if (!title && !location) continue;

          // Parse location (e.g., "14199, Berlin")
          const locationMatch = location.match(/^(\d{5}),?\s*(.+)$/);
          let postalCode = '';
          let cityName = '';
          
          if (locationMatch) {
            postalCode = locationMatch[1];
            cityName = locationMatch[2].trim();
          } else {
            const parts = location.split(',');
            if (parts.length >= 2) {
              postalCode = parts[0].trim();
              cityName = parts[1].trim();
            } else {
              cityName = location.trim();
            }
          }

          // Parse price - multiply by 100 if it contains a decimal point
          let priceMonthly = 0;
          if (priceRaw && priceRaw !== 'auf Anfrage') {
            const priceStr = priceRaw.toString().replace(/[€,]/g, '').trim();
            const priceValue = parseFloat(priceStr);
            
            if (!isNaN(priceValue)) {
              if (priceStr.includes('.')) {
                // Has decimal point, multiply by 100
                priceMonthly = Math.round(priceValue * 100);
              } else {
                // No decimal point, use as is
                priceMonthly = Math.round(priceValue);
              }
            }
          }

          // Parse rooms and area from meta values
          let rooms = '1';
          let areaSqm = 50;
          
          for (const metaValue of metaValues) {
            const valueStr = metaValue.toString().trim();
            
            // Check if this is rooms (just a number without units)
            if (valueStr && /^\d+$/.test(valueStr)) {
              const roomNumber = parseInt(valueStr);
              if (roomNumber > 0 && roomNumber <= 20) { // Reasonable room count
                rooms = roomNumber.toString();
              }
            }
            
            // Check if this is area (contains m² or numbers with decimal)
            if (valueStr && (valueStr.includes('m²') || valueStr.includes(','))) {
              const areaMatch = valueStr.match(/(\d+(?:,\d+)?)/);
              if (areaMatch) {
                const areaStr = areaMatch[1].replace(',', '.');
                const areaValue = parseFloat(areaStr);
                if (!isNaN(areaValue) && areaValue > 10 && areaValue < 1000) {
                  areaSqm = Math.round(areaValue);
                }
              }
            }
          }

          console.log(`Parsed data for row ${i}:`, {
            postalCode,
            cityName,
            priceMonthly,
            rooms,
            areaSqm,
            originalPrice: priceRaw,
            originalMetaValues: metaValues
          });

          // Create property object
          const property = {
            title: title || `Property ${i}`,
            description: `Imported from XLSX`,
            address: `${postalCode} ${cityName}`,
            postal_code: postalCode,
            neighborhood: cityName,
            rooms: rooms,
            area_sqm: areaSqm,
            price_monthly: priceMonthly,
            warmmiete_monthly: priceMonthly,
            additional_costs_monthly: 0,
            city_name: cityName,
            images: imageUrl ? [imageUrl] : []
          };

          properties.push(property);
        } catch (error) {
          console.error(`Error processing row ${i}:`, error);
          errors.push(`Row ${i}: ${error.message}`);
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
              <li><strong>Attachment-medium Image:</strong> Property image URL</li>
              <li><strong>A:</strong> Listing name/title</li>
              <li><strong>Frymo-listing-location:</strong> Postcode, city</li>
              <li><strong>Price:</strong> Price (×100 for decimals, as-is for whole numbers)</li>
              <li><strong>Frymo-listing-meta-item-value:</strong> Rooms (number) and Size (with m²)</li>
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