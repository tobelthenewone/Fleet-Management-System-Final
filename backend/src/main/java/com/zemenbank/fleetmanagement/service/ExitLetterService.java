package com.zemenbank.fleetmanagement.service;

import org.springframework.stereotype.Service;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;

import java.io.ByteArrayOutputStream;

@Service
public class ExitLetterService {

    public byte[] generateExitLetterPdf( String requestId,
                String vehicleModel,
                String plateNumber,
                String driverName,
                String requesterName,
                String department,
                String purpose,
                String destination,
                String approvedBy,
                String acceptedBy,
                String dateOfExit) {
                    Document document = new Document();
                    ByteArrayOutputStream out = new ByteArrayOutputStream();
            
                    try {
                        PdfWriter.getInstance(document, out);
                        document.open();
            
                        Font headerFont = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD);
                        Font normalFont = new Font(Font.FontFamily.HELVETICA, 12);
            
                        Paragraph header = new Paragraph("VEHICLE EXIT AUTHORIZATION", headerFont);
                        header.setAlignment(Element.ALIGN_CENTER);
                        document.add(header);
            
                        document.add(Chunk.NEWLINE);
                        document.add(new Paragraph("Request ID: " + requestId, normalFont));
                        document.add(new Paragraph("Date of Exit: " + dateOfExit, normalFont));
            
                        document.add(Chunk.NEWLINE);
                        document.add(new Paragraph("Vehicle Information:", headerFont));
                        document.add(new Paragraph("Vehicle Model: " + vehicleModel, normalFont));
                        document.add(new Paragraph("Plate Number: " + plateNumber, normalFont));
                        document.add(new Paragraph("Assigned Driver: " + driverName, normalFont));
                        document.add(Chunk.NEWLINE);
                        document.add(new Paragraph("Requester Information:", headerFont));
                        document.add(new Paragraph("Name: " + requesterName, normalFont));
                        document.add(new Paragraph("Department: " + department, normalFont));
                        document.add(new Paragraph("Purpose: " + purpose, normalFont));
                        document.add(new Paragraph("Destination: " + destination, normalFont));
            
                        document.add(Chunk.NEWLINE);
                        document.add(new Paragraph("Approvals:", headerFont));
                        document.add(new Paragraph("Department Head: " + approvedBy + " (✔ Approved)", normalFont));
                        document.add(new Paragraph("Logistics Officer: " + acceptedBy + " (✔ Vehicle Assigned)", normalFont));
            
                        document.add(Chunk.NEWLINE);
                        document.add(new Paragraph("Signature & Stamp:", headerFont));
                        document.add(new Paragraph("Security Guard: _____________________________", normalFont));
                        document.add(new Paragraph("Stamp: _____________________________", normalFont));
            
                        document.close();

            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed: " + e.getMessage());
        }
    }
}

