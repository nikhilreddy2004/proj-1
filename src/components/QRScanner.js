import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './QRScanner.css';

const QRScanner = ({ onScanSuccess }) => {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "qr-reader", 
            { 
                fps: 10, 
                qrbox: 250 
            }, 
            false // verbose
        );

        function onScan(decodedText, decodedResult) {
            // The library will keep scanning, so we need to stop it
            scanner.clear();
            onScanSuccess(decodedText);
        }

        function onScanError(errorMessage) {
            // handle scan error, usually this means no QR code is found
            // console.warn(`QR Code no longer in front of camera.`);
        }

        scanner.render(onScan, onScanError);

        // cleanup function to stop the scanner when component unmounts
        return () => {
            scanner.clear();
        };
    }, [onScanSuccess]);

    return (
        <div className="qr-scanner-container">
            <h3>Scan Student QR Code</h3>
            <div id="qr-reader"></div>
        </div>
    );
};

export default QRScanner; 