import { useState } from 'react';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { buildPdfHtml } from '../utils/pdfTemplate';
import type { Motorcycle, MaintenanceLog, Part, TaxRecord } from '../types/models';

export function usePdfExport() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportPdf = async (params: {
    motorcycle: Motorcycle;
    logs: MaintenanceLog[];
    parts: Part[];
    taxRecords: TaxRecord[];
  }) => {
    setIsGenerating(true);
    setError(null);
    try {
      const html = buildPdfHtml(params);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `${params.motorcycle.name} Maintenance Report`,
        });
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return { exportPdf, isGenerating, error };
}
