package com.example.happyheels.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${file.upload-dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation.resolve("products"));
        } catch (Exception ex) {
            throw new RuntimeException("Could not create directory for file uploads.", ex);
        }
    }

    /**
     * Store a file on disk and return its relative web URL.
     */
    public String storeFile(MultipartFile file, String subDirectory) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String fileExtension = "";
        int dotIndex = originalFileName.lastIndexOf('.');
        if (dotIndex > 0) {
            fileExtension = originalFileName.substring(dotIndex);
        }

        // Generate unique filename to avoid overwriting existing files
        String uniqueFileName = System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + fileExtension;

        Path targetDirectory = this.fileStorageLocation.resolve(subDirectory);
        if (!Files.exists(targetDirectory)) {
            Files.createDirectories(targetDirectory);
        }

        Path targetLocation = targetDirectory.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + subDirectory + "/" + uniqueFileName;
    }

    /**
     * Delete a file from disk by relative URL.
     */
    public boolean deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank() || !fileUrl.startsWith("/uploads/")) {
            return false;
        }
        try {
            String relativePath = fileUrl.replace("/uploads/", "");
            Path filePath = this.fileStorageLocation.resolve(relativePath).normalize();
            return Files.deleteIfExists(filePath);
        } catch (IOException e) {
            return false;
        }
    }

    /**
     * Load file as a Spring Resource for downloading/viewing.
     */
    public Resource loadFileAsResource(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return null;
        }
        try {
            String relativePath = fileUrl.startsWith("/uploads/") ? fileUrl.replace("/uploads/", "") : fileUrl;
            Path filePath = this.fileStorageLocation.resolve(relativePath).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                return null;
            }
        } catch (MalformedURLException ex) {
            return null;
        }
    }
}
