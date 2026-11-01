import React, { useState } from 'react';
import { FileText, Download, CheckCircle2 } from 'lucide-react';
import { exportModulePDF, PDFExportData } from '../utils/pdfExport.ts';

interface PDFExportButtonProps {
  moduleName: string;
  subtitle?: string;
  userLoc?: { lat: number; lng: number };
  satelliteName?: string;
  satLongitude?: number;
  defcon?: number;
  isJamming?: boolean;
  jammingPower?: number;
  telemetry?: {
    snr: string;
    rxPower: string;
    bucTemp: string;
    packetLoss: string;
    status: string;
  };
  details?: Array<{ key: string; value: string }>;
  tables?: Array<{
    title?: string;
    headers: string[];
    rows: (string | number)[][];
  }>;
  summaryText?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  getExportData?: () => Partial<PDFExportData>;
}

export const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  moduleName,
  subtitle,
  userLoc,
  satelliteName,
  satLongitude,
  defcon,
  isJamming,
  jammingPower,
  telemetry,
  details,
  tables,
  summaryText,
  className = '',
  size = 'md',
  getExportData
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExporting(true);

    setTimeout(() => {
      try {
        const extraData = getExportData ? getExportData() : {};

        const exportPayload: PDFExportData = {
          moduleName,
          subtitle: subtitle || extraData.subtitle || `Detailed Operational Report for ${moduleName}`,
          userLoc: userLoc || extraData.userLoc,
          satelliteName: satelliteName || extraData.satelliteName,
          satLongitude: satLongitude ?? extraData.satLongitude,
          defcon: defcon ?? extraData.defcon,
          isJamming: isJamming ?? extraData.isJamming,
          jammingPower: jammingPower ?? extraData.jammingPower,
          telemetry: telemetry || extraData.telemetry,
          details: details || extraData.details || [],
          tables: tables || extraData.tables || [],
          summaryText: summaryText || extraData.summaryText || `Official military-grade intel log generated for ${moduleName}. All telemetry parameters captured in real-time under tactical protocols.`
        };

        exportModulePDF(exportPayload);
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 2500);
      } catch (err) {
        console.error("PDF_EXPORT_ERROR", err);
      } finally {
        setIsExporting(false);
      }
    }, 200);
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-[9px]',
    md: 'px-3.5 py-1.5 text-[10px]',
    lg: 'px-4 py-2 text-[11px]'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      title={`Export ${moduleName} PDF Report`}
      className={`inline-flex items-center space-x-2 font-black uppercase tracking-wider rounded-xl transition-all duration-300 border shadow-lg ${
        isSuccess
          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-emerald-500/20'
          : 'bg-slate-900/90 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 border-slate-700/80 hover:border-cyan-500/50 active:scale-95'
      } ${sizeClasses[size]} ${className}`}
    >
      {isExporting ? (
        <div className={`border-2 border-cyan-400 border-t-transparent rounded-full animate-spin ${iconSizes[size]}`} />
      ) : isSuccess ? (
        <CheckCircle2 className={`${iconSizes[size]} text-emerald-400 animate-bounce`} />
      ) : (
        <FileText className={`${iconSizes[size]} text-cyan-400`} />
      )}
      <span>{isSuccess ? 'PDF GENERATED' : isExporting ? 'EXPORTING...' : 'EXPORT PDF'}</span>
      <Download className={`opacity-60 group-hover:opacity-100 ${iconSizes[size]}`} />
    </button>
  );
};
