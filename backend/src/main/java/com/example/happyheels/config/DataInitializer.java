package com.example.happyheels.config;

import com.example.happyheels.model.Role;
import com.example.happyheels.model.User;
import com.example.happyheels.repo.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Ensure admin user exists with correct role and password
        userRepository.findByEmail("admin@happyheels.com").ifPresentOrElse(existing -> {
            existing.setRole(Role.ROLE_ADMIN);
            existing.setPassword(passwordEncoder.encode("admin123"));
            if (existing.getName() == null || existing.getName().isBlank()) {
                existing.setName("Admin");
            }
            if (existing.getAddress() == null) existing.setAddress("Admin Address");
            if (existing.getPhone() == null) existing.setPhone("1234567890");
            userRepository.save(existing);
            System.out.println("Admin user verified/updated successfully!");
        }, () -> {
            User admin = User.builder()
                    .name("Admin")
                    .email("admin@happyheels.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ROLE_ADMIN)
                    .address("Admin Address")
                    .phone("1234567890")
                    .build();
            userRepository.save(admin);
            System.out.println("Admin user created successfully!");
        });
    }
}
