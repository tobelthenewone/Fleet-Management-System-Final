package com.zemenbank.fleetmanagement.utils;

import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.property.UnitValue;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.zemenbank.fleetmanagement.dto.report.VehicleReportDTO;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PdfGenerator {

    public byte[] generateVehicleReport(List<VehicleReportDTO> vehicles) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        document.add(new Paragraph("Vehicle Report").setBold().setFontSize(16));
        document.add(new Paragraph("Report Date Range: " +
            (vehicles.isEmpty() ? "-" : vehicles.get(0).getReportStartDate()) + " to " +
            (vehicles.isEmpty() ? "-" : vehicles.get(0).getReportEndDate())).setFontSize(12));

        // Header: Define the table with 8 columns
        Table table = new Table(UnitValue.createPercentArray(8)).useAllAvailableWidth();

        table.addHeaderCell("Plate Number");
        table.addHeaderCell("Model");
        table.addHeaderCell("Manufacturer");
        table.addHeaderCell("Year");
        table.addHeaderCell("Distance (km)");
        table.addHeaderCell("Fuel (L)");
        table.addHeaderCell("Fuel Cost");
        table.addHeaderCell("Maintenance Cost");

        // Data rows
        for (VehicleReportDTO dto : vehicles) {
            table.addCell(dto.getPlateNumber());
            table.addCell(dto.getModel());
            table.addCell(dto.getManufacturer());
            table.addCell(String.valueOf(dto.getYearOfMade()));
            table.addCell(String.format("%.2f", dto.getTotalDistance()));
            table.addCell(String.format("%.2f", dto.getTotalFuelConsumed()));
            table.addCell(String.format("%.2f", dto.getTotalFuelCost()));
            table.addCell(String.format("%.2f", dto.getTotalMaintenanceCost()));
        }

        document.add(table);
        document.close();

        return out.toByteArray();
    }
}
