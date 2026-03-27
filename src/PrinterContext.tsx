import React, { createContext, useContext, useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

interface PrinterDevice {
    name: string;
    address: string;
}

interface PrinterContextType {
    devices: PrinterDevice[];
    connectedDevice: PrinterDevice | null;
    isScanning: boolean;
    scanDevices: () => Promise<void>;
    connectDevice: (device: PrinterDevice) => Promise<void>;
    disconnectDevice: () => Promise<void>;
    printText: (text: string) => Promise<void>;
}

const PrinterContext = createContext<PrinterContextType | undefined>(undefined);

export const PrinterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [devices, setDevices] = useState<PrinterDevice[]>([]);
    const [connectedDevice, setConnectedDevice] = useState<PrinterDevice | null>(null);
    const [isScanning, setIsScanning] = useState(false);

    const scanDevices = async () => {
        setIsScanning(true);
        try {
            if (Capacitor.getPlatform() === 'web') {
                alert('No computador, use a impressão nativa do navegador (clique em Imprimir nos relatórios/pedidos).');
                setDevices([]);
                return;
            }
            // Mock implementation - in production, you would integrate with a real Bluetooth library
            await new Promise(resolve => setTimeout(resolve, 1500));
            alert('Funcionalidade de impressão Bluetooth disponível apenas com plugin nativo instalado.');
            setDevices([]);
        } catch (error) {
            console.error('Erro ao buscar impressoras:', error);
        } finally {
            setIsScanning(false);
        }
    };

    const connectDevice = async (device: PrinterDevice) => {
        try {
            setConnectedDevice(device);
            await Preferences.set({ key: 'saved_printer', value: JSON.stringify(device) });
            alert(`Conectado a ${device.name}`);
        } catch (error) {
            console.error('Erro ao conectar:', error);
        }
    };

    const disconnectDevice = async () => {
        setConnectedDevice(null);
        await Preferences.remove({ key: 'saved_printer' });
    };

    const printWeb = (text: string) => {
        // Create a printable HTML structure
        const lines = text.split('\n');
        let htmlContent = '<div style="font-family: monospace; font-size: 14px; width: 300px; margin: 0 auto;">';

        lines.forEach(line => {
            let style = 'margin: 2px 0; white-space: pre-wrap;';
            let formattedLine = line;

            // Alignment
            if (formattedLine.startsWith('[C]')) {
                style += 'text-align: center;';
                formattedLine = formattedLine.replace('[C]', '');
            } else if (formattedLine.startsWith('[L]')) {
                style += 'text-align: left;';
                formattedLine = formattedLine.replace('[L]', '');
            } else if (formattedLine.startsWith('[R]')) {
                style += 'text-align: right;';
                formattedLine = formattedLine.replace('[R]', '');
            }

            // Bold
            formattedLine = formattedLine.replace(/<b>/g, '<strong>').replace(/<\/b>/g, '</strong>');

            if (formattedLine.trim()) {
                htmlContent += `<div style="${style}">${formattedLine}</div>`;
            } else {
                htmlContent += '<br/>';
            }
        });

        htmlContent += '</div>';

        // Use window.open instead of iframe for better reliability
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Imprimir Comprovante</title>
                        <style>
                            @page { margin: 0; }
                            body { margin: 10mm; font-family: monospace; }
                        </style>
                    </head>
                    <body>
                        ${htmlContent}
                        <script>
                            window.onload = function() {
                                window.print();
                                setTimeout(function() { window.close(); }, 500);
                            }
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        } else {
            alert('Por favor, permita popups para imprimir.');
        }
    };

    const printText = async (text: string) => {
        // 1. Prioritize Web/Desktop
        if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() === 'web') {
            printWeb(text);
            return;
        }

        // 2. If Native, check connection
        if (!connectedDevice) {
            // HYBRID FALLBACK: If on native/hybrid but no bluetooth printer connected, 
            // try generic print (which might just fail or do nothing on Android, but better than an alert blocking desktop if misdetected)
            // But actually, for the User's specific request "hybrid bluetooth and local network printer":
            // on Desktop, they want local network (window.print).
            // on Mobile, they might want Bluetooth OR maybe local too?
            // Let's assume if no bluetooth device is paired, we try the web/system print.

            // Checking if we are really on a browser masquerading or just want fallback
            console.warn('Nenhuma impressora Bluetooth conectada. Tentando impressão do sistema...');
            printWeb(text);
            return;
        }

        try {
            // Mock implementation for native
            console.log('Print Text:', text);
            alert('Funcionalidade de impressão disponível apenas com plugin nativo instalado.');
        } catch (error) {
            console.error('Erro ao imprimir:', error);
        }
    };

    return (
        <PrinterContext.Provider
            value={{
                devices,
                connectedDevice,
                isScanning,
                scanDevices,
                connectDevice,
                disconnectDevice,
                printText,
            }}
        >
            {children}
        </PrinterContext.Provider>
    );
};

export const usePrinter = () => {
    const context = useContext(PrinterContext);
    if (!context) throw new Error('usePrinter must be used within PrinterProvider');
    return context;
};
