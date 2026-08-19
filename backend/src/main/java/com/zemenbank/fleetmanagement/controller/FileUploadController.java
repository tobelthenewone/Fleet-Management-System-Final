package com.zemenbank.fleetmanagement.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import org.apache.commons.imaging.ImageInfo;
import org.apache.commons.imaging.Imaging;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/uploads")
public class FileUploadController {

    private static final String UPLOAD_DIR = System.getProperty("user.dir")
            + File.separator + "fleetmangement" + File.separator + "uploads";

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @PostMapping
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("No file selected");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body("File size exceeds 5MB limit");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());

        // Validate file extension
        String fileExtension = getFileExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(fileExtension)) {
            return ResponseEntity.badRequest().body("Only JPG, JPEG, PNG, and WEBP images are allowed");
        }
        // Prevent double extensions
        if (!hasSingleExtension(originalFilename)) {
            return ResponseEntity.badRequest().body("Filename contains multiple extensions");
        }

        // Validate content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            return ResponseEntity.badRequest().body("Invalid image content type");
        }

        // Validate file content (Commons Imaging + Magic Bytes)
        if (!isValidImageFile(file) || !hasValidMagicBytes(file)) {
            return ResponseEntity.badRequest().body("Uploaded file is not a valid image");
        }

        try {
            String newFilename = UUID.randomUUID() + fileExtension;
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(newFilename);
            file.transferTo(filePath.toFile());

            String fileUrl = "/uploads/" + newFilename;
            return ResponseEntity.ok().body(fileUrl);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload file");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error");
        }
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex > 0) ? filename.substring(dotIndex).toLowerCase() : "";
    }

    private boolean isValidImageFile(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            ImageInfo imageInfo = Imaging.getImageInfo(inputStream, file.getOriginalFilename());
            String formatName = imageInfo.getFormat().getName().toLowerCase();

            switch (getFileExtension(file.getOriginalFilename())) {
                case ".jpg":
                case ".jpeg":
                    return formatName.equalsIgnoreCase("jpeg");
                case ".png":
                    return formatName.equalsIgnoreCase("png");
                case ".webp":
                    return formatName.equalsIgnoreCase("webp");
                default:
                    return false;
            }
        } catch (Exception e) {
            return false;
        }
    }

    private boolean hasValidMagicBytes(MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[12];
            int read = is.read(header, 0, 12);
            if (read < 12) return false;

            // JPEG starts with: FF D8
            if (header[0] == (byte) 0xFF && header[1] == (byte) 0xD8) return true;

            // PNG starts with: 89 50 4E 47
            if (header[0] == (byte) 0x89 && header[1] == (byte) 0x50 &&
                header[2] == (byte) 0x4E && header[3] == (byte) 0x47) return true;

            // WEBP starts with RIFF....WEBP
            if (new String(header, 0, 4).equals("RIFF") &&
                new String(header, 8, 12).startsWith("WEBP")) return true;

            return false;
        } catch (IOException e) {
            return false;
        }
    }
    private boolean hasSingleExtension(String filename) {
        String name = filename.trim();
        int first = name.indexOf('.');
        int last = name.lastIndexOf('.');
        return first == last && first != -1;
    }
}
